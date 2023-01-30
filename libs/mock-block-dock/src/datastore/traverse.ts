import {
  Edges,
  EntityId,
  EntityValidInterval,
  GraphElementForIdentifier,
  GraphElementVertexId,
  GraphResolveDepths,
  HasLeftEntityEdge,
  HasRightEntityEdge,
  IncomingLinkEdge,
  isEntityVertex,
  KnowledgeGraphOutwardEdge,
  NonNullTimeInterval,
  OntologyRootedEdges,
  OutgoingLinkEdge,
  OutwardEdge,
  Subgraph,
  Vertex,
} from "@blockprotocol/graph";
import { mustBeDefined } from "@blockprotocol/graph/dist/stdlib/must-be-defined";
import { mapElementsIntoRevisions } from "@blockprotocol/graph/dist/stdlib/subgraph/element/map-revisions";
import { addKnowledgeGraphEdgeToSubgraphByMutation } from "@blockprotocol/graph/internal";
import { intervalIntersectionWithInterval } from "@blockprotocol/graph/src/stdlib/interval";
import {
  getIncomingLinksForEntity,
  getLeftEntityForLinkEntity,
  getOutgoingLinksForEntity,
  getRightEntityForLinkEntity,
} from "@blockprotocol/graph/stdlib-temporal";

import { typedEntries } from "../util";

const TIMESTAMP_PLACEHOLDER = `TIMESTAMP_PLACEHOLDER` as const;

/**
 * Advanced type to recursively search a type for `EntityValidInterval` and patch those occurrences by removing the
 * definition of the "validInterval" property.
 */
type PatchEntityOutwardEdges<ToPatch extends unknown> = ToPatch extends object
  ? ToPatch extends EntityValidInterval
    ? Omit<ToPatch, "validInterval">
    : { [key in keyof ToPatch]: PatchEntityOutwardEdges<ToPatch[key]> }
  : ToPatch;

/**
 * A patched {@link Subgraph} type which is partially incomplete. Entity-to-entity edges aren't fully specified, as
 * to avoid many intermediary rewrites, the timestamps of the edges are filled in as a post-processing step and are left
 * unspecified until then.
 */
export type TraversalSubgraph<TemporalSupport extends boolean> = Omit<
  Subgraph<TemporalSupport>,
  "edges"
> & {
  edges: OntologyRootedEdges & {
    [entityId: EntityId]: Record<
      typeof TIMESTAMP_PLACEHOLDER,
      PatchEntityOutwardEdges<KnowledgeGraphOutwardEdge[]>
    >;
  };
};

type PatchedOutgoingLinkEdge = PatchEntityOutwardEdges<OutgoingLinkEdge>;
type PatchedIncomingLinkEdge = PatchEntityOutwardEdges<IncomingLinkEdge>;
type PatchedHasLeftEntityEdge = PatchEntityOutwardEdges<HasLeftEntityEdge>;
type PatchedHasRightEntityEdge = PatchEntityOutwardEdges<HasRightEntityEdge>;

/**
 * @todo - doc
 * @param traversalSubgraph
 * @param sourceEntityId
 * @param outwardEdge
 */
const patchedAddKnowledgeGraphEdge = <TemporalSupport extends boolean>(
  traversalSubgraph: TraversalSubgraph<TemporalSupport>,
  sourceEntityId: EntityId,
  outwardEdge: PatchEntityOutwardEdges<KnowledgeGraphOutwardEdge>,
) =>
  addKnowledgeGraphEdgeToSubgraphByMutation(
    // intermediary `as unknown` cast is needed because otherwise tsc gets confused and complains about type
    // instantiation being excessively deep and possibly infinite
    traversalSubgraph as unknown as Subgraph<TemporalSupport>,
    sourceEntityId,
    TIMESTAMP_PLACEHOLDER,
    outwardEdge as KnowledgeGraphOutwardEdge,
  );

/**
 * @todo - doc
 */
type NestedExtract<T, U> = Extract<
  T,
  T extends { [key in keyof U]: unknown }
    ? {
        [sharedKey in keyof U]: NestedExtract<T[sharedKey], U[sharedKey]>;
      }
    : T extends U
    ? T
    : never
>;

type GetNeighborsReturn<
  EdgeKind extends OutwardEdge["kind"],
  Reversed extends boolean,
> = GraphElementForIdentifier<
  true,
  NestedExtract<
    OutwardEdge,
    { kind: EdgeKind; reversed: Reversed }
  >["rightEndpoint"]
>[];

export const getNeighbors = <
  EdgeKind extends OutwardEdge["kind"],
  Reversed extends boolean,
>(
  traversalSubgraph: TraversalSubgraph<true>,
  datastore: Subgraph<true>,
  source: Vertex<true>,
  edgeKind: EdgeKind,
  reversed: Reversed,
  interval: NonNullTimeInterval,
): GetNeighborsReturn<EdgeKind, Reversed> => {
  switch (edgeKind) {
    case "HAS_LEFT_ENTITY": {
      if (!isEntityVertex(source)) {
        return [];
      }

      const { inner: sourceEntity } = source;

      const sourceEntityId = sourceEntity.metadata.recordId.entityId;

      if (reversed) {
        // get outgoing links for entity
        const outgoingLinks = getOutgoingLinksForEntity(
          datastore,
          sourceEntityId,
          interval,
        );
        const mappedRevisions = mapElementsIntoRevisions(outgoingLinks);

        for (const outgoingLinkEntityId of Object.keys(mappedRevisions)) {
          const outgoingLinkEdge: PatchedOutgoingLinkEdge = {
            kind: "HAS_LEFT_ENTITY",
            reversed: true,
            rightEndpoint: {
              entityId: outgoingLinkEntityId,
            },
          };

          patchedAddKnowledgeGraphEdge(
            traversalSubgraph,
            sourceEntityId,
            outgoingLinkEdge,
          );
        }

        return Object.values(mappedRevisions) as GetNeighborsReturn<
          "HAS_LEFT_ENTITY",
          true
        > as GetNeighborsReturn<EdgeKind, Reversed>;
      } else if (
        sourceEntity.linkData?.leftEntityId !== undefined &&
        sourceEntity.linkData?.rightEntityId !== undefined
      ) {
        // get left entity for link entity
        const leftEntityRevisions = getLeftEntityForLinkEntity(
          datastore,
          sourceEntityId,
          interval,
        );
        const hasLeftEntityEdge: PatchedHasLeftEntityEdge = {
          kind: "HAS_LEFT_ENTITY",
          reversed: false,
          rightEndpoint: {
            /**
             * @todo - This assumes that once a link entity's endpoints cannot change. This is based on the assumption
             *   that once entity is a link, it's always a link, however we don't enforce this currently.
             */
            entityId: mustBeDefined(leftEntityRevisions[0]).metadata.recordId
              .entityId,
          },
        };

        patchedAddKnowledgeGraphEdge(
          traversalSubgraph,
          sourceEntityId,
          hasLeftEntityEdge,
        );

        return [leftEntityRevisions] as GetNeighborsReturn<
          "HAS_LEFT_ENTITY",
          false
        > as GetNeighborsReturn<EdgeKind, Reversed>;
      }

      return [];
    }
    case "HAS_RIGHT_ENTITY": {
      if (!isEntityVertex(source)) {
        return [];
      }

      const { inner: sourceEntity } = source;

      const sourceEntityId = sourceEntity.metadata.recordId.entityId;

      if (reversed) {
        // get incoming links for entity
        const incomingLinks = getIncomingLinksForEntity(
          datastore,
          sourceEntityId,
          interval,
        );
        const mappedRevisions = mapElementsIntoRevisions(incomingLinks);

        for (const incomingLinkEntityId of Object.keys(mappedRevisions)) {
          const incomingLinkEdge: PatchedIncomingLinkEdge = {
            kind: "HAS_RIGHT_ENTITY",
            reversed: true,
            rightEndpoint: {
              entityId: incomingLinkEntityId,
            },
          };

          patchedAddKnowledgeGraphEdge(
            traversalSubgraph,
            sourceEntityId,
            incomingLinkEdge,
          );
        }

        return Object.values(mappedRevisions) as GetNeighborsReturn<
          "HAS_RIGHT_ENTITY",
          true
        > as GetNeighborsReturn<EdgeKind, Reversed>;
      } else if (
        sourceEntity.linkData?.leftEntityId !== undefined &&
        sourceEntity.linkData?.rightEntityId !== undefined
      ) {
        // get right entity for link entity
        const rightEntityRevisions = getRightEntityForLinkEntity(
          datastore,
          sourceEntityId,
          interval,
        );
        const hasRightEntityEdge: PatchedHasRightEntityEdge = {
          kind: "HAS_RIGHT_ENTITY",
          reversed: false,
          rightEndpoint: {
            /**
             * @todo - This assumes that once a link entity's endpoints cannot change. This is based on the assumption
             *   that once entity is a link, it's always a link, however we don't enforce this currently.
             */
            entityId: mustBeDefined(rightEntityRevisions[0]).metadata.recordId
              .entityId,
          },
        };

        patchedAddKnowledgeGraphEdge(
          traversalSubgraph,
          sourceEntityId,
          hasRightEntityEdge,
        );

        return [rightEntityRevisions] as GetNeighborsReturn<
          "HAS_RIGHT_ENTITY",
          false
        > as GetNeighborsReturn<EdgeKind, Reversed>;
      }

      return [];
    }
    default: {
      throw new Error(`Currently unsupported traversal edge kind: ${edgeKind}`);
    }
  }
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
