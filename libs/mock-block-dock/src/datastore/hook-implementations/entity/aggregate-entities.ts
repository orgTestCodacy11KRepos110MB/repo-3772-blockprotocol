import {
  AggregateEntitiesData,
  AggregateEntitiesResult,
  EntityRootedSubgraph,
  Subgraph,
} from "@blockprotocol/graph";
import { getEntities } from "@blockprotocol/graph/stdlib-temporal";

import { filterAndSortEntitiesOrTypes } from "../../../util";
import { getDefaultTemporalAxes } from "../../get-default-temporal-axes";
import { resolveTemporalAxes } from "../../resolve-temporal-axes";
import { traverseElement } from "../../traverse";
import { TraversalContext } from "../../traverse/traversal-context";

const aggregateEntitiesImpl = (
  {
    operation,
    graphResolveDepths = {
      hasLeftEntity: { incoming: 1, outgoing: 1 },
      hasRightEntity: { incoming: 1, outgoing: 1 },
    },
    temporalAxes,
  }: AggregateEntitiesData<true>,
  graph: Subgraph<true>,
): AggregateEntitiesResult<true, EntityRootedSubgraph<true>> => {
  const resolvedTemporalAxes = resolveTemporalAxes(temporalAxes);

  const { results, operation: appliedOperation } =
    filterAndSortEntitiesOrTypes<true>(getEntities<true>(graph), {
      operation,
      temporalAxes: resolvedTemporalAxes,
    });

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

export const aggregateEntities = <TemporalSupport extends boolean>(
  data: AggregateEntitiesData<TemporalSupport>,
  graph: Subgraph<true>,
): AggregateEntitiesResult<
  TemporalSupport,
  EntityRootedSubgraph<TemporalSupport>
> => {
  if ("temporalAxes" in data) {
    return aggregateEntitiesImpl(
      data as AggregateEntitiesData<true>,
      graph,
    ) as AggregateEntitiesResult<
      TemporalSupport,
      EntityRootedSubgraph<TemporalSupport>
    >;
  } else {
    return aggregateEntitiesImpl(
      {
        ...(data as AggregateEntitiesData<false>),
        temporalAxes: getDefaultTemporalAxes(),
      },
      graph,
    ) as AggregateEntitiesResult<
      TemporalSupport,
      EntityRootedSubgraph<TemporalSupport>
    >;
  }
};
