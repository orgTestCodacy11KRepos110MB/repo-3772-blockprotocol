import {
  GetEntityData,
  Subgraph,
  SubgraphRootTypes,
} from "@blockprotocol/graph";
import { getEntity as getEntityFromSubgraph } from "@blockprotocol/graph/stdlib";

import { resolveTemporalAxes } from "../../resolve-temporal-axes";
import { traverseElement } from "../../traverse";
import { TraversalContext } from "../../traverse/traversal-context";

export const getEntity = (
  {
    entityId,
    graphResolveDepths = {
      hasLeftEntity: { incoming: 1, outgoing: 1 },
      hasRightEntity: { incoming: 1, outgoing: 1 },
    },
    temporalAxes,
  }: GetEntityData,
  graph: Subgraph,
): Subgraph<SubgraphRootTypes["entity"]> | undefined => {
  const resolvedTemporalAxes = resolveTemporalAxes(temporalAxes);

  const entityRevision = getEntityFromSubgraph(graph, entityId);

  if (entityRevision === undefined) {
    return undefined;
  }

  const subgraph = {
    /** @todo - This is temporary, and wrong */
    roots: [
      {
        baseId: entityRevision.metadata.recordId.entityId,
        revisionId: entityRevision.metadata.recordId.editionId,
      },
    ],
    vertices: {},
    edges: {},
    depths: graphResolveDepths,
  };

  traverseElement(
    subgraph,
    /** @todo - This is temporary, and wrong */
    {
      baseId: entityRevision.metadata.recordId.entityId,
      revisionId: entityRevision.metadata.recordId.editionId,
    },
    graph,
    new TraversalContext(graph),
    graphResolveDepths,
  );

  return subgraph;
};
