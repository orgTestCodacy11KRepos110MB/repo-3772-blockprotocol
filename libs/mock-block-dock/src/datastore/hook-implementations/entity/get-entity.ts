import {
  EntityRootedSubgraph,
  GetEntityData,
  Subgraph,
} from "@blockprotocol/graph";
import { getEntity as getEntityFromSubgraph } from "@blockprotocol/graph/stdlib-temporal";

import { getDefaultTemporalAxes } from "../../get-default-temporal-axes";
import { resolveTemporalAxes } from "../../resolve-temporal-axes";
import { traverseElement } from "../../traverse";
import { TraversalContext } from "../../traverse/traversal-context";

export const getEntityImpl = (
  {
    entityId,
    graphResolveDepths = {
      hasLeftEntity: { incoming: 1, outgoing: 1 },
      hasRightEntity: { incoming: 1, outgoing: 1 },
    },
    temporalAxes,
  }: GetEntityData<true>,
  graph: Subgraph<true>,
): EntityRootedSubgraph<true> | undefined => {
  const resolvedTemporalAxes = resolveTemporalAxes(temporalAxes);

  const entityRevision = getEntityFromSubgraph(graph, entityId);

  if (entityRevision === undefined) {
    return undefined;
  }

  const subgraph: EntityRootedSubgraph<true> = {
    roots: [
      {
        baseId: entityRevision.metadata.recordId.entityId,
        revisionId:
          entityRevision.metadata.temporalVersioning[
            resolvedTemporalAxes.variable.axis
          ].start.limit,
      },
    ],
    vertices: {},
    edges: {},
    depths: graphResolveDepths,
    temporalAxes: { initial: temporalAxes, resolved: resolvedTemporalAxes },
  };

  traverseElement(
    subgraph,
    {
      baseId: entityRevision.metadata.recordId.entityId,
      revisionId:
        entityRevision.metadata.temporalVersioning[
          resolvedTemporalAxes.variable.axis
        ].start.limit,
    },
    graph,
    new TraversalContext(graph),
    graphResolveDepths,
  );

  return subgraph;
};

export const getEntity = <TemporalSupport extends boolean>(
  data: GetEntityData<TemporalSupport>,
  graph: Subgraph<true>,
): EntityRootedSubgraph<TemporalSupport> | undefined => {
  if (data.temporalAxes !== undefined) {
    return getEntityImpl(data as GetEntityData<true>, graph) as
      | EntityRootedSubgraph<TemporalSupport>
      | undefined;
  } else {
    return getEntityImpl(
      {
        ...(data as GetEntityData<false>),
        temporalAxes: getDefaultTemporalAxes(),
      },
      graph,
    ) as EntityRootedSubgraph<TemporalSupport> | undefined;
  }
};