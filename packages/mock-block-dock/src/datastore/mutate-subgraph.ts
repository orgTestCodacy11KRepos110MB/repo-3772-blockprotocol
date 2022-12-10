import {
  EntityId,
  KnowledgeGraphOutwardEdge,
  KnowledgeGraphRootedEdges,
  Subgraph,
  Timestamp,
} from "@blockprotocol/graph";
import isEqual from "lodash/isEqual";

/** @todo - clean up the assertions here */
export const addKnowledgeGraphEdge = (
  subgraph: Subgraph,
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
    /**
     * @todo - Q for PR review: Added a lodash dependency for this, equality of the outward edge is actually complicated
     *    fine to keep?
     */
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
