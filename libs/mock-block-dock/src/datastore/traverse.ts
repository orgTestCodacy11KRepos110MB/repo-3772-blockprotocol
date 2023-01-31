import {
  EntityId,
  EntityValidInterval,
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
  SubgraphRootType,
  Vertex,
} from "@blockprotocol/graph";
import { addKnowledgeGraphEdgeToSubgraphByMutation } from "@blockprotocol/graph/internal";
import {
  getIncomingLinksForEntity,
  getLeftEntityForLinkEntity,
  getOutgoingLinksForEntity,
  getRightEntityForLinkEntity,
  intervalIntersectionWithInterval,
  mapElementsIntoRevisions,
} from "@blockprotocol/graph/stdlib-temporal";

import { get, mustBeDefined, typedEntries } from "../util";

const TIMESTAMP_PLACEHOLDER = `TIMESTAMP_PLACEHOLDER` as const;

/**
 * Advanced type to recursively search a type for `EntityValidInterval` and patch those occurrences by removing the
 * definition of the "validInterval" property.
 */
type PatchEntityValidInterval<ToPatch extends unknown> = ToPatch extends object
  ? ToPatch extends EntityValidInterval
    ? Omit<ToPatch, "validInterval">
    : { [key in keyof ToPatch]: PatchEntityValidInterval<ToPatch[key]> }
  : ToPatch;

/**
 * A patched {@link Subgraph} type which is partially incomplete. Entity-to-entity edges aren't fully specified, as
 * to avoid many intermediary rewrites, the timestamps of the edges are filled in as a post-processing step and are left
 * unspecified until then.
 */
export type TraversalSubgraph<
  TemporalSupport extends boolean,
  RootType extends SubgraphRootType<TemporalSupport> = SubgraphRootType<TemporalSupport>,
> = Omit<Subgraph<TemporalSupport, RootType>, "edges"> & {
  edges: PatchEntityValidInterval<
    OntologyRootedEdges & {
      [entityId: EntityId]: Record<
        typeof TIMESTAMP_PLACEHOLDER,
        KnowledgeGraphOutwardEdge[]
      >;
    }
  >;
};

type PatchedOutgoingLinkEdge = PatchEntityValidInterval<OutgoingLinkEdge>;
type PatchedIncomingLinkEdge = PatchEntityValidInterval<IncomingLinkEdge>;
type PatchedHasLeftEntityEdge = PatchEntityValidInterval<HasLeftEntityEdge>;
type PatchedHasRightEntityEdge = PatchEntityValidInterval<HasRightEntityEdge>;

/**
 * @todo - doc
 * @param traversalSubgraph
 * @param sourceEntityId
 * @param outwardEdge
 */
const patchedAddKnowledgeGraphEdge = <TemporalSupport extends boolean>(
  traversalSubgraph: TraversalSubgraph<TemporalSupport>,
  sourceEntityId: EntityId,
  outwardEdge: PatchEntityValidInterval<KnowledgeGraphOutwardEdge>,
) =>
  addKnowledgeGraphEdgeToSubgraphByMutation(
    // intermediary `as unknown` cast is needed because otherwise tsc gets confused and complains about type
    // instantiation being excessively deep and possibly infinite
    traversalSubgraph as unknown as Subgraph<TemporalSupport>,
    sourceEntityId,
    TIMESTAMP_PLACEHOLDER,
    outwardEdge as KnowledgeGraphOutwardEdge,
  );

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
): Vertex<true>[] => {
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

        return Object.values(mappedRevisions)
          .flat()
          .map((entity) => ({
            kind: "entity",
            inner: entity,
          }));
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

        return leftEntityRevisions.map((entity) => ({
          kind: "entity",
          inner: entity,
        }));
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

        return Object.values(mappedRevisions)
          .flat()
          .map((entity) => ({
            kind: "entity",
            inner: entity,
          }));
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

        return rightEntityRevisions.map((entity) => ({
          kind: "entity",
          inner: entity,
        }));
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

      for (const neighborVertex of getNeighbors(
        traversalSubgraph,
        datastore,
        element,
        /** @todo - this will be unergonomic as soon as there are more supported edge kinds */
        edgeKind === "hasLeftEntity" ? "HAS_LEFT_ENTITY" : "HAS_RIGHT_ENTITY",
        direction === "incoming",
        interval,
      )) {
        let newIntersection: NonNullTimeInterval | null;
        let neighborVertexId: GraphElementVertexId;

        if (isEntityVertex(neighborVertex)) {
          // get from temporal data of the neighbor vertex
          const entityValidInterval =
            neighborVertex.inner.metadata.temporalVersioning[
              traversalSubgraph.temporalAxes.resolved.pinned.axis
            ];
          newIntersection = intervalIntersectionWithInterval(
            interval,
            entityValidInterval,
          );
          neighborVertexId = {
            baseId: neighborVertex.inner.metadata.recordId.entityId,
            revisionId: entityValidInterval.start.limit,
          };
        } else {
          newIntersection = interval;
          neighborVertexId = {
            baseId: neighborVertex.inner.metadata.recordId.baseUri,
            revisionId: neighborVertex.inner.metadata.recordId.version,
          };
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
export const traverseElement = <TemporalSupport extends boolean>({
  traversalSubgraph,
  datastore,
  element,
  elementIdentifier,
  currentTraversalDepths,
  interval,
}: {
  traversalSubgraph: TraversalSubgraph<TemporalSupport>;
  datastore: Subgraph<true>;
  element: Vertex<TemporalSupport>;
  elementIdentifier: GraphElementVertexId;
  currentTraversalDepths: GraphResolveDepths;
  interval: TemporalSupport extends true ? NonNullTimeInterval : undefined;
}) => {
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

export const finalizeSubgraph = <
  TemporalSupport extends boolean,
  RootType extends SubgraphRootType<TemporalSupport> = SubgraphRootType<TemporalSupport>,
>(
  traversalSubgraph: TraversalSubgraph<TemporalSupport, RootType>,
): Subgraph<TemporalSupport, RootType> => {
  const finalizedSubgraph = {
    ...traversalSubgraph,
    edges: {},
  };

  if (traversalSubgraph.temporalAxes !== undefined) {
    const variableAxis = traversalSubgraph.temporalAxes.resolved.variable.axis;

    const validRanges = Object.fromEntries(
      Object.entries(traversalSubgraph.vertices).map(
        ([baseId, revisionMap]) => {
          const sortedRevisions = Object.keys(revisionMap).sort();

          /** @todo - This cast is needed because TS is confused again and thinks these must always be entity vertices */
          const latestVertex = revisionMap[
            mustBeDefined(sortedRevisions.at(-1))
          ]! as Vertex<TemporalSupport>;

          let latest;

          if (isEntityVertex(latestVertex)) {
            const endBound =
              latestVertex.inner.metadata.temporalVersioning[variableAxis].end;
            latest = endBound.kind === "unbounded" ? null : endBound.limit;
          } else {
            latest = latestVertex.inner.metadata.recordId.version;
          }

          return [
            baseId,
            { earliest: mustBeDefined(sortedRevisions[0]), latest },
          ];
        },
      ),
    );

    for (const [baseId, outwardEdgeMap] of typedEntries(
      traversalSubgraph.edges,
    )) {
      for (const [traversalEdgeFirstCreatedAt, outwardEdges] of typedEntries(
        outwardEdgeMap,
      )) {
        for (const outwardEdge of outwardEdges) {
          let finalizedOutwardEdge: OutwardEdge;
          let edgeFirstCreatedAt;

          switch (outwardEdge.kind) {
            case "HAS_LEFT_ENTITY":
            case "HAS_RIGHT_ENTITY": {
              let linkEntityValidRange;
              let endLimit;

              if (outwardEdge.reversed) {
                // incoming or outgoing link, we want the timestamps of the interval to refer to the earliest revision
                // of the link entity (right endpoint) in the subgraph, and the end bound of the latest revision
                linkEntityValidRange = mustBeDefined(
                  validRanges[outwardEdge.rightEndpoint.entityId],
                );
                edgeFirstCreatedAt = linkEntityValidRange.earliest;
                endLimit = linkEntityValidRange.latest;
              } else {
                // `baseId` here refers to a link entity, we want the timestamp to be the earliest revision of it in
                // the subgraph
                linkEntityValidRange = mustBeDefined(validRanges[baseId]);
                edgeFirstCreatedAt = linkEntityValidRange.earliest;
                endLimit = linkEntityValidRange.latest;
              }

              finalizedOutwardEdge = {
                ...outwardEdge,
                rightEndpoint: {
                  ...outwardEdge.rightEndpoint,
                  validInterval: {
                    start: { kind: "inclusive", limit: edgeFirstCreatedAt },
                    end: endLimit
                      ? { kind: "exclusive", limit: endLimit as string }
                      : { kind: "unbounded" },
                  },
                },
              };
              break;
            }
            case "IS_OF_TYPE": {
              if (outwardEdge.reversed) {
                throw new Error(
                  `Reversed "IS_OF_TYPE" edge kinds are not currently supported in graph traversal`,
                );
              }

              edgeFirstCreatedAt = traversalEdgeFirstCreatedAt;
              finalizedOutwardEdge = outwardEdge;
              break;
            }
            default: {
              edgeFirstCreatedAt = traversalEdgeFirstCreatedAt;
              finalizedOutwardEdge = outwardEdge;
            }
          }

          const finalizedEdgeMap = get(finalizedSubgraph.edges, baseId, {});
          const finalizedOutwardEdges = get(
            finalizedEdgeMap,
            edgeFirstCreatedAt,
            [],
          );

          (finalizedOutwardEdges as OutwardEdge[]).push(finalizedOutwardEdge);
        }
      }
    }
  } else {
    /** @todo - implement this */
    throw new Error(`Non-versioned traversal is currently unsupported`);
  }

  return finalizedSubgraph;
};
