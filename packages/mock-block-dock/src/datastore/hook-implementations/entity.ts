import {
  GetEntityData,
  Subgraph,
  SubgraphRootTypes,
} from "@blockprotocol/graph";
import { getEntity as getEntityFromSubgraph } from "@blockprotocol/graph/stdlib-temporal";

export const getEntity = (
  {
    entityId,
    atTimestamp,
    graphResolveDepths = {
      hasLeftEntity: { incoming: 1, outgoing: 1 },
      hasRightEntity: { incoming: 1, outgoing: 1 },
    },
  }: GetEntityData,
  graph: Subgraph,
): Subgraph<SubgraphRootTypes["entity"]> | undefined => {
  /** @todo - We can make this **much much** faster, this is a temporary implementation */
  const entityEdition = getEntityFromSubgraph(graph, entityId);

  if (entityEdition === undefined) {
    return undefined;
  }

  return {
    roots: [entityEdition.metadata.editionId],
    vertices: {},
    edges: {},
    graphResolveDepths,
  };
};
