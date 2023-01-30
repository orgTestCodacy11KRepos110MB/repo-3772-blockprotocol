import {
  Entity,
  EntityId,
  EntityValidInterval,
  EntityVertex,
  KnowledgeGraphOutwardEdge,
  KnowledgeGraphRootedEdges,
  KnowledgeGraphVertices,
  Subgraph,
  Timestamp,
} from "../index.js";
import { unionOfIntervals } from "../stdlib/interval";
import { isEqual } from "./mutate-subgraph/is-equal.js";

/**
 * Looking to build a subgraph? You probably want `import { buildSubgraph } from @blockprotocol/graph/stdlib`
 *
 * This MUTATES the given `Subgraph` by adding the given outwardEdge to the entity at the specified atTime.
 * Mutating a Subgraph is unsafe in most situations – you should know why you need to do it.
 *
 * @param subgraph – the subgraph to mutate by adding the outward edge
 * @param sourceEntityId – the id of the entity the edge is coming from
 * @param atTime – the time at which the edge should be recorded as being added at
 * @param outwardEdge – the edge itself
 */
export const addKnowledgeGraphEdgeToSubgraphByMutation = <
  TemporalSupport extends boolean,
>(
  subgraph: Subgraph<TemporalSupport>,
  sourceEntityId: EntityId,
  atTime: Timestamp,
  outwardEdge: KnowledgeGraphOutwardEdge,
) => {
  /* eslint-disable no-param-reassign -- We want to mutate the input here */
  if (!subgraph.edges[sourceEntityId]) {
    // This is needed because ts can't differentiate between `EntityId` and `BaseUri`
    (subgraph.edges as KnowledgeGraphRootedEdges)[sourceEntityId] = {
      [atTime]: [outwardEdge],
    };
  } else if (!subgraph.edges[sourceEntityId]![atTime]) {
    subgraph.edges[sourceEntityId]![atTime] = [outwardEdge];
  } else {
    const outwardEdgesAtTime = subgraph.edges[sourceEntityId]![atTime]!;
    if (
      !outwardEdgesAtTime.find((otherOutwardEdge) =>
        isEqual(otherOutwardEdge, outwardEdge),
      )
    ) {
      outwardEdgesAtTime.push(outwardEdge);
    }
  }

  /* eslint-enable no-param-reassign */
};

/** @todo - fix the docs here */
/**
 * Looking to build a subgraph? You probably want `import { buildSubgraph } from @blockprotocol/graph/stdlib`
 *
 * This MUTATES the given `Subgraph` by adding the given outwardEdge to the entity at the specified atTime.
 * Mutating a Subgraph is unsafe in most situations – you should know why you need to do it.
 *
 * *Note*: This only adds edges as implied by the given entities, if the `Subgraph` is invalid at the time of method
 * call (e.g. by missing link endpoints), this will not loop through the vertex set to finish incomplete edges.
 *
 * @param subgraph – the subgraph to mutate by adding the provided entities
 * @param entities – the entity to add to the provided subgraph
 */
export const addEntitiesToSubgraphByMutation = <
  TemporalSupport extends boolean,
>(
  subgraph: Subgraph<TemporalSupport>,
  entities: Entity<TemporalSupport>[],
) => {
  /*
   * @todo This assumes that the left and right entity ID of a link entity is static for its entire lifetime, that is
   *   not necessarily going to continue being the case
   */
  /* eslint-disable no-param-reassign -- We want to mutate the input here */
  const linkMap: Record<
    EntityId,
    {
      leftEntityId: EntityId;
      rightEntityId: EntityId;
      validIntervals: EntityValidInterval["validInterval"][];
    }
  > = {};

  for (const entity of entities) {
    const entityId = entity.metadata.recordId.entityId;

    const entityRevisionValidInterval: EntityValidInterval["validInterval"] =
      subgraph.temporalAxes !== undefined
        ? entity.metadata.temporalVersioning[
            subgraph.temporalAxes.resolved.pinned.axis
          ]
        : {
            start: { kind: "inclusive", limit: new Date(0).toISOString() },
            end: { kind: "unbounded" },
          };

    if (entity.linkData) {
      const linkInfo = linkMap[entityId];
      if (!linkInfo) {
        linkMap[entityId] = {
          leftEntityId: entity.linkData.leftEntityId,
          rightEntityId: entity.linkData.rightEntityId,
          validIntervals: [entityRevisionValidInterval],
        };
      } else {
        linkInfo.validIntervals = unionOfIntervals(
          ...linkInfo.validIntervals,
          entityRevisionValidInterval,
        );
      }
    }

    const entityVertex: EntityVertex<TemporalSupport> = {
      kind: "entity",
      inner: entity,
    };

    if (!subgraph.vertices[entityId]) {
      // This is needed because ts can't differentiate between `EntityId` and `BaseUri`
      (subgraph.vertices as KnowledgeGraphVertices<TemporalSupport>)[entityId] =
        {
          [entityRevisionValidInterval.start.limit]: entityVertex,
        };
    } else {
      (subgraph.vertices as KnowledgeGraphVertices<TemporalSupport>)[entityId]![
        entityRevisionValidInterval.start.limit
      ] = entityVertex;
    }
  }

  for (const [
    linkEntityId,
    { leftEntityId, rightEntityId, validIntervals },
  ] of Object.entries(linkMap)) {
    for (const validInterval of validIntervals) {
      addKnowledgeGraphEdgeToSubgraphByMutation(
        subgraph,
        linkEntityId,
        validInterval.start.limit,
        {
          kind: "HAS_LEFT_ENTITY",
          reversed: false,
          rightEndpoint: { entityId: leftEntityId, validInterval },
        },
      );
      addKnowledgeGraphEdgeToSubgraphByMutation(
        subgraph,
        leftEntityId,
        validInterval.start.limit,
        {
          kind: "HAS_LEFT_ENTITY",
          reversed: true,
          rightEndpoint: { entityId: linkEntityId, validInterval },
        },
      );
      addKnowledgeGraphEdgeToSubgraphByMutation(
        subgraph,
        linkEntityId,
        validInterval.start.limit,
        {
          kind: "HAS_RIGHT_ENTITY",
          reversed: false,
          rightEndpoint: { entityId: rightEntityId, validInterval },
        },
      );
      addKnowledgeGraphEdgeToSubgraphByMutation(
        subgraph,
        rightEntityId,
        validInterval.start.limit,
        {
          kind: "HAS_RIGHT_ENTITY",
          reversed: true,
          rightEndpoint: { entityId: linkEntityId, validInterval },
        },
      );
    }
  }
  /* eslint-enable no-param-reassign */
};
