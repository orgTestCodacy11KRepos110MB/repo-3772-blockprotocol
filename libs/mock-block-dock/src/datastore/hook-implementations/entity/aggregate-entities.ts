import {
  AggregateEntitiesData,
  AggregateEntitiesResult,
  Subgraph,
  SubgraphRootTypes,
} from "@blockprotocol/graph";
import { getEntities } from "@blockprotocol/graph/stdlib";

import { filterAndSortEntitiesOrTypes } from "../../../util";
import { resolveTemporalAxes } from "../../resolve-temporal-axes";
import { traverseElement } from "../../traverse";
import { TraversalContext } from "../../traverse/traversal-context";

export const aggregateEntities = (
  {
    operation,
    graphResolveDepths = {
      hasLeftEntity: { incoming: 1, outgoing: 1 },
      hasRightEntity: { incoming: 1, outgoing: 1 },
    },
    temporalAxes,
  }: AggregateEntitiesData,
  graph: Subgraph,
): AggregateEntitiesResult<Subgraph<SubgraphRootTypes["entity"]>> => {
  const resolvedTemporalAxes = resolveTemporalAxes(temporalAxes);

  const { results, operation: appliedOperation } = filterAndSortEntitiesOrTypes(
    getEntities(graph),
    {
      operation,
      temporalAxes: resolvedTemporalAxes,
    },
  );

  const subgraph = {
    roots: results.map((entity) => ({
      baseId: entity.metadata.recordId.entityId,
      revisionId:
        entity.metadata.temporalVersioning[temporalAxes.pinned.axis].start
          .limit,
    })),
    vertices: {},
    edges: {},
    depths: graphResolveDepths,
    temporalAxes: {
      initial: temporalAxes,
      resolved: resolvedTemporalAxes,
    },
  };

  for (const {
    metadata: { recordId, temporalVersioning },
  } of results) {
    traverseElement(
      subgraph,
      {
        baseId: recordId.entityId,
        revisionId: temporalVersioning[temporalAxes.pinned.axis].start.limit,
      },
      graph,
      new TraversalContext(graph),
      graphResolveDepths,
    );
  }

  return {
    results: subgraph,
    operation: appliedOperation,
  };
};
