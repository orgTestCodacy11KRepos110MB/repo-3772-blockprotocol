import {
  EntityEditionId,
  OntologyTypeEditionId,
  Subgraph,
} from "@blockprotocol/graph";

import { typedEntries } from "../util";
import { PartialDepths, TraversalContext } from "./traverse/traversal-context";

/** @todo - doc */
export const traverseElement = (
  traversalSubgraph: Subgraph,
  elementIdentifier: EntityEditionId | OntologyTypeEditionId,
  datastore: Subgraph,
  traversalContext: TraversalContext,
  currentTraversalDepths: PartialDepths,
) => {
  const unresolvedDepths = traversalContext.insert(
    elementIdentifier,
    currentTraversalDepths,
  );

  if (Object.keys(unresolvedDepths).length === 0) {
    return;
  }

  const element =
    datastore.vertices[elementIdentifier.baseId]?.[elementIdentifier.versionId];

  if (!element) {
    throw new Error(
      `Couldn't find element in graph associated with identifier: ${JSON.stringify(
        elementIdentifier,
      )}`,
    );
  }

  const editionsInTraversalSubgraph =
    traversalSubgraph.vertices[elementIdentifier.baseId];

  // `any` casts here are because TypeScript wants us to narrow the Identifier type before trusting us
  if (editionsInTraversalSubgraph) {
    (editionsInTraversalSubgraph as any)[elementIdentifier.versionId] = element;
  } else {
    // eslint-disable-next-line no-param-reassign -- The point of this function is to mutate the subgraph
    (traversalSubgraph as any).vertices[elementIdentifier.baseId] = {
      [elementIdentifier.versionId]: element,
    };
  }

  const toResolve: Record<string, PartialDepths> = {};

  for (const [edgeKind, depths] of typedEntries(unresolvedDepths)) {
    // Little hack for typescript, this is wrapped in a function with a return value to get type safety to ensure the
    // switch statement is exhaustive. Try removing a case to see.
    ((): boolean => {
      switch (edgeKind) {
        case "hasLeftEntity": {
          if (depths.incoming) {
            // get outgoing links for entity and insert edges
          }
          if (depths.outgoing) {
            // get left entity for link entity and insert edges
          }
          return true;
        }
        case "hasRightEntity": {
          if (depths.incoming) {
            // get incoming links for entity and insert edges
          }
          if (depths.outgoing) {
            // get right entity for link entity and insert edges
          }
          return true;
        }
      }
    })();
  }

  for (const [siblingElementIdentifierString, depths] of typedEntries(
    toResolve,
  )) {
    traverseElement(
      traversalSubgraph,
      JSON.parse(siblingElementIdentifierString) as
        | EntityEditionId
        | OntologyTypeEditionId,
      datastore,
      traversalContext,
      depths,
    );
  }
};
