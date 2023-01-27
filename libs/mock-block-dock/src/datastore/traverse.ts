import {
  EntityIdAndTimestamp,
  GraphElementForIdentifier,
  GraphElementVertexId,
  GraphResolveDepths,
  isEntityVertex,
  NonNullTimeInterval,
  OutwardEdge,
  Subgraph,
  Vertex,
} from "@blockprotocol/graph";
import { intervalIntersectionWithInterval } from "@blockprotocol/graph/src/stdlib/interval";
import {
  getIncomingLinksForEntity,
  getLeftEntityForLinkEntity,
  getOutgoingLinksForEntity,
  getRightEntityForLinkEntity,
} from "@blockprotocol/graph/stdlib-temporal";

import { typedEntries } from "../util";

/**
 * Advanced type to recursively search a type for `EntityIdAndTimestamp` and patch those occurrences by removing the
 * definition of the "timestamp" property.
 */
type PatchEntityEdges<ToPatch extends unknown> = ToPatch extends object
  ? ToPatch extends EntityIdAndTimestamp
    ? Omit<EntityIdAndTimestamp, "timestamp">
    : { [key in keyof ToPatch]: PatchEntityEdges<ToPatch[key]> }
  : ToPatch;

/**
 * A patched {@link Subgraph} type which is partially incomplete. Entity-to-entity edges aren't fully specified, as
 * to avoid many intermediary rewrites, the timestamps of the edges are filled in as a post-processing step and are left
 * unspecified until then.
 */
export type TraversalSubgraph<TemporalSupport extends boolean> =
  PatchEntityEdges<Subgraph<TemporalSupport>>;

type GetNeighborsReturn<
  EdgeKind extends keyof GraphResolveDepths,
  Reversed extends boolean,
> = GraphElementForIdentifier<
  true,
  Extract<OutwardEdge, { kind: EdgeKind; reversed: Reversed }>["rightEndpoint"]
>[];

export const getNeighbors = <
  EdgeKind extends keyof GraphResolveDepths,
  Reversed extends boolean,
>(
  datastore: Subgraph<true>,
  source: Vertex<true>,
  edgeKind: EdgeKind,
  reversed: Reversed,
  interval: NonNullTimeInterval,
): GetNeighborsReturn<EdgeKind, Reversed> => {
  switch (edgeKind) {
    case "hasLeftEntity": {
      if (!isEntityVertex(source)) {
        return [];
      }

      const { inner: sourceEntity } = source;

      const entityId = sourceEntity.metadata.recordId.entityId;

      if (reversed) {
        // get outgoing links for entity
        return getOutgoingLinksForEntity(datastore, entityId, interval);
      } else if (
        sourceEntity.linkData?.leftEntityId !== undefined &&
        sourceEntity.linkData?.rightEntityId !== undefined
      ) {
        // get left entity for link entity
        return getLeftEntityForLinkEntity(datastore, entityId, interval);
      }

      return [];
    }
    case "hasRightEntity": {
      if (!isEntityVertex(source)) {
        return [];
      }

      const { inner: sourceEntity } = source;

      const entityId = sourceEntity.metadata.recordId.entityId;

      if (reversed) {
        // get incoming links for entity
        return getIncomingLinksForEntity(datastore, entityId, interval);
      } else if (
        sourceEntity.linkData?.leftEntityId !== undefined &&
        sourceEntity.linkData?.rightEntityId !== undefined
      ) {
        // get right entity for link entity
        return getRightEntityForLinkEntity(datastore, entityId, interval);
      }

      return [];
    }
  }

  /**
   * @todo - Unsure why this error is required, avoiding it would be good as TS would force us to be exhaustive in the
   *   case statements, making sure we update this if we support more edge kinds. However, removing it complains about
   *   lacking ending return statement otherwise
   */
  throw new Error(`Unknown edge kind: ${edgeKind}`);
};

export const traverseElementTemporal = ({
  traversalSubgraph,
  datastore,
  element,
  elementIdentifier,
  interval,
  currentTraversalDepths,
}: {
  traversalSubgraph: TraversalSubgraph<true>;
  datastore: Subgraph<true>;
  element: Vertex<true>;
  elementIdentifier: GraphElementVertexId;
  interval: NonNullTimeInterval;
  currentTraversalDepths: GraphResolveDepths;
}) => {
  const revisionsInTraversalSubgraph =
    traversalSubgraph.vertices[elementIdentifier.baseId];

  // `any` casts here are because TypeScript wants us to narrow the Identifier type before trusting us
  if (revisionsInTraversalSubgraph) {
    revisionsInTraversalSubgraph[elementIdentifier.revisionId] = element as any;
  } else {
    // eslint-disable-next-line no-param-reassign -- The point of this function is to mutate the traversal subgraph
    traversalSubgraph.vertices[elementIdentifier.baseId] = {
      [elementIdentifier.revisionId]: element as any,
    };
  }

  for (const [edgeKind, depthsPerDirection] of typedEntries(
    currentTraversalDepths,
  )) {
    for (const [direction, depth] of typedEntries(depthsPerDirection)) {
      if (depth < 1) {
        continue;
      }
      for (const neighbor of getNeighbors(
        datastore,
        element,
        edgeKind,
        direction === "incoming",
        interval,
      )) {
        let newIntersection;

        if (isEntityVertex(neighborVertex)) {
          // get from temporal data of the neighbor vertex
          newIntersection = intervalIntersectionWithInterval(
            interval,
            neighborVertex.inner.metadata.temporalVersioning[
              traversalSubgraph.temporalAxes.resolved.pinned.axis
            ],
          );
        } else {
          newIntersection = interval;
        }

        if (newIntersection) {
          traverseElementTemporal({
            traversalSubgraph,
            datastore,
            element: neighborVertex,
            elementIdentifier: neighborVertexId,
            interval: newIntersection,
            currentTraversalDepths: {
              ...currentTraversalDepths,
              [edgeKind]: {
                ...currentTraversalDepths[edgeKind],
                [direction]: depth - 1,
              },
            },
          });
        }
      }
    }
  }
};

// export const traverseElementTemporal2 = (
//   traversalSubgraph: Subgraph<true>,
//   elementIdentifier: GraphElementVertexId,
//   datastore: Subgraph<true>,
//   traversalContext: TraversalContext,
//   currentTraversalDepths: PartialDepths,
// ) => {
//   const unresolvedDepths = traversalContext.insert(
//     elementIdentifier,
//     currentTraversalDepths,
//   );
//
//   if (Object.keys(unresolvedDepths).length === 0) {
//     return;
//   }
//
//   const element =
//     datastore.vertices[elementIdentifier.baseId]?.[
//       elementIdentifier.revisionId
//     ];
//
//   if (!element) {
//     throw new Error(
//       `Couldn't find element in graph associated with identifier: ${JSON.stringify(
//         elementIdentifier,
//       )}`,
//     );
//   }
//
//   const revisionsInTraversalSubgraph =
//     traversalSubgraph.vertices[elementIdentifier.baseId];
//
//   // `any` casts here are because TypeScript wants us to narrow the Identifier type before trusting us
//   if (revisionsInTraversalSubgraph) {
//     (revisionsInTraversalSubgraph as any)[elementIdentifier.revisionId] =
//       element;
//   } else {
//     // eslint-disable-next-line no-param-reassign -- The point of this function is to mutate the subgraph
//     (traversalSubgraph as any).vertices[elementIdentifier.baseId] = {
//       [elementIdentifier.revisionId]: element,
//     };
//   }
//
//   const toResolve: ResolveMap = new ResolveMap({});
//
//   for (const [edgeKind, depths] of typedEntries(unresolvedDepths)) {
//     // Little hack for typescript, this is wrapped in a function with a return value to get type safety to ensure the
//     // switch statement is exhaustive. Try removing a case to see.
//     ((): boolean => {
//       switch (edgeKind) {
//         case "hasLeftEntity": {
//           const entityId = elementIdentifier.baseId as EntityId;
//
//           if (depths.incoming) {
//             // get outgoing links for entity and insert edges
//             for (const outgoingLinkEntity of getOutgoingLinksForEntity(
//               datastore,
//               entityId,
//             )) {
//               const {
//                 metadata: {
//                   recordId: {
//                     entityId: outgoingLinkEntityId,
//                     editionId: edgeTimestamp,
//                   },
//                 },
//               } = outgoingLinkEntity;
//
//               const outgoingLinkEdge: OutgoingLinkEdge = {
//                 kind: "HAS_LEFT_ENTITY",
//                 reversed: true,
//                 rightEndpoint: {
//                   baseId: outgoingLinkEntityId,
//                   timestamp: edgeTimestamp,
//                 },
//               };
//
//               addKnowledgeGraphEdgeToSubgraphByMutation(
//                 traversalSubgraph,
//                 entityId,
//                 edgeTimestamp,
//                 outgoingLinkEdge,
//               );
//
//               /** @todo - This is temporary, and wrong */
//               toResolve.insert(
//                 {
//                   baseId: outgoingLinkEntity.metadata.recordId.entityId,
//                   revisionId: outgoingLinkEntity.metadata.recordId.editionId,
//                 },
//                 {
//                   [edgeKind]: { incoming: depths.incoming - 1 },
//                 },
//               );
//             }
//           }
//           if (depths.outgoing) {
//             if (
//               "linkData" in element.inner &&
//               element.inner.linkData?.leftEntityId !== undefined &&
//               element.inner.linkData?.rightEntityId !== undefined
//             ) {
//               // get left entity for link entity and insert edges
//               const leftEntity = getLeftEntityForLinkEntity(
//                 datastore,
//                 entityId,
//               );
//               const {
//                 metadata: {
//                   recordId: {
//                     entityId: leftEntityId,
//                     editionId: edgeTimestamp,
//                   },
//                 },
//               } = leftEntity;
//
//               const hasLeftEntityEdge: HasLeftEntityEdge = {
//                 kind: "HAS_LEFT_ENTITY",
//                 reversed: false,
//                 rightEndpoint: {
//                   baseId: leftEntityId,
//                   timestamp: edgeTimestamp,
//                 },
//               };
//
//               addKnowledgeGraphEdgeToSubgraphByMutation(
//                 traversalSubgraph,
//                 entityId,
//                 edgeTimestamp,
//                 hasLeftEntityEdge,
//               );
//
//               /** @todo - This is temporary, and wrong */
//               toResolve.insert(
//                 {
//                   baseId: leftEntity.metadata.recordId.entityId,
//                   revisionId: leftEntity.metadata.recordId.editionId,
//                 },
//                 {
//                   [edgeKind]: { outgoing: depths.outgoing - 1 },
//                 },
//               );
//             }
//           }
//
//           return true;
//         }
//         case "hasRightEntity": {
//           const entityId = elementIdentifier.baseId as EntityId;
//
//           if (depths.incoming) {
//             // get incoming links for entity and insert edges
//             for (const incomingLinkEntity of getIncomingLinksForEntity(
//               datastore,
//               entityId,
//             )) {
//               const {
//                 metadata: {
//                   recordId: {
//                     entityId: incomingLinkEntityId,
//                     editionId: edgeTimestamp,
//                   },
//                 },
//               } = incomingLinkEntity;
//
//               const incomingLinkEdge: IncomingLinkEdge = {
//                 kind: "HAS_RIGHT_ENTITY",
//                 reversed: true,
//                 rightEndpoint: {
//                   baseId: incomingLinkEntityId,
//                   timestamp: edgeTimestamp,
//                 },
//               };
//
//               addKnowledgeGraphEdgeToSubgraphByMutation(
//                 traversalSubgraph,
//                 entityId,
//                 edgeTimestamp,
//                 incomingLinkEdge,
//               );
//
//               /** @todo - This is temporary, and wrong */
//               toResolve.insert(
//                 {
//                   baseId: incomingLinkEntity.metadata.recordId.entityId,
//                   revisionId: incomingLinkEntity.metadata.recordId.editionId,
//                 },
//                 {
//                   [edgeKind]: { incoming: depths.incoming - 1 },
//                 },
//               );
//             }
//           }
//           if (depths.outgoing) {
//             if (
//               "linkData" in element.inner &&
//               element.inner.linkData?.leftEntityId !== undefined &&
//               element.inner.linkData?.rightEntityId !== undefined
//             ) {
//               // get right entity for link entity and insert edges
//               const rightEntity = getRightEntityForLinkEntity(
//                 datastore,
//                 entityId,
//               );
//               const {
//                 metadata: {
//                   recordId: {
//                     entityId: rightEntityId,
//                     editionId: edgeTimestamp,
//                   },
//                 },
//               } = rightEntity;
//
//               const hasLeftEntityEdge: HasRightEntityEdge = {
//                 kind: "HAS_RIGHT_ENTITY",
//                 reversed: false,
//                 rightEndpoint: {
//                   baseId: rightEntityId,
//                   timestamp: edgeTimestamp,
//                 },
//               };
//
//               addKnowledgeGraphEdgeToSubgraphByMutation(
//                 traversalSubgraph,
//                 entityId,
//                 edgeTimestamp,
//                 hasLeftEntityEdge,
//               );
//
//               /** @todo - This is temporary, and wrong */
//               toResolve.insert(
//                 {
//                   baseId: rightEntity.metadata.recordId.entityId,
//                   revisionId: rightEntity.metadata.recordId.editionId,
//                 },
//                 {
//                   [edgeKind]: { outgoing: depths.outgoing - 1 },
//                 },
//               );
//             }
//           }
//           return true;
//         }
//       }
//     })();
//   }
//
//   for (const [siblingElementIdentifierString, depths] of typedEntries(
//     toResolve.map,
//   )) {
//     traverseElement(
//       traversalSubgraph,
//       JSON.parse(siblingElementIdentifierString) as GraphElementVertexId,
//       datastore,
//       traversalContext,
//       depths.inner,
//     );
//   }
// };

/** @todo - doc */
/** @todo - Update this to take an interval instead of always being "latest" */
/** @todo - Update this to handle ontology edges */
/** @todo - Update this to use temporal versioning information */
export const traverseElement = <TemporalSupport extends boolean>(
  traversalSubgraph: TraversalSubgraph<TemporalSupport>,
  element: Vertex<TemporalSupport>,
  elementIdentifier: GraphElementVertexId,
  datastore: Subgraph<true>,
  currentTraversalDepths: GraphResolveDepths,
  interval: TemporalSupport extends true ? NonNullTimeInterval : undefined,
) => {
  if (traversalSubgraph.temporalAxes !== undefined) {
    return traverseElementTemporal({
      traversalSubgraph: traversalSubgraph as TraversalSubgraph<true>,
      datastore,
      element: element as Vertex<true>,
      elementIdentifier,
      interval: interval as NonNullTimeInterval,
      currentTraversalDepths,
    });
  }
};
