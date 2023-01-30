import {
  EntityRootedSubgraph,
  GetEntityData,
  Subgraph,
  SubgraphRootTypes,
} from "@blockprotocol/graph";
import { getEntityRevision as getEntityFromSubgraph } from "@blockprotocol/graph/stdlib-temporal";

import { getDefaultTemporalAxes } from "../../get-default-temporal-axes";
import { resolveTemporalAxes } from "../../resolve-temporal-axes";
import {
  finalizeSubgraph,
  TraversalSubgraph,
  traverseElement,
} from "../../traverse";

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

  const traversalSubgraph: TraversalSubgraph<
    true,
    SubgraphRootTypes<true>["entity"]
  > = {
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

  traverseElement({
    traversalSubgraph,
    datastore: graph,
    element: { kind: "entity", inner: entityRevision },
    elementIdentifier: {
      baseId: entityRevision.metadata.recordId.entityId,
      revisionId:
        entityRevision.metadata.temporalVersioning[
          resolvedTemporalAxes.variable.axis
        ].start.limit,
    },
    currentTraversalDepths: graphResolveDepths,
    interval: resolvedTemporalAxes.variable.interval,
  });

  return finalizeSubgraph(traversalSubgraph);
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
