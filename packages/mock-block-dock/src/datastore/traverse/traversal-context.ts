import {
  EntityEditionId,
  GraphResolveDepths,
  OntologyTypeEditionId,
  Subgraph,
} from "@blockprotocol/graph";

import { typedEntries } from "../../util";

export type PartialDepths = {
  [K1 in keyof GraphResolveDepths]?: {
    [K2 in keyof GraphResolveDepths[K1]]?: GraphResolveDepths[K1][K2];
  };
};

export class ResolvedDepths {
  constructor(protected depths: PartialDepths) {}

  /**
   * Takes a subset of `GraphResolveDepths` and checks if any of the supplied depths are greater than the ones already
   * tracked in this. If they are, this object is updated and the different depths are returned so that they can be
   * resolved further.
   *
   * @param {PartialDepths} newDepths - the new subset of depths at which the element should be resolved to
   * @returns {PartialDepths} - the depths that hadn't been resolved yet for this element
   */
  update(newDepths: PartialDepths): PartialDepths {
    const updatedDepths: PartialDepths = {};
    for (const [edgeKind, directions] of typedEntries(newDepths)) {
      if (directions) {
        for (const [direction, depth] of typedEntries(directions)) {
          if (depth < 1) {
            continue;
          }
          if (!this.depths[edgeKind]) {
            this.depths[edgeKind] = {
              [direction]: depth,
            };
          } else if (!this.depths[edgeKind]![direction]) {
            this.depths[edgeKind]![direction] = depth;
          } else if (depth > this.depths[edgeKind]![direction]!) {
            this.depths[edgeKind]![direction] = depth;
          } else {
            continue;
          }

          updatedDepths[edgeKind] = {
            ...updatedDepths[edgeKind],
            [direction]: depth,
          };
        }
      }
    }

    return updatedDepths;
  }
}

/**
 * Tracks the depths at which each element within the graph has been explored. This means that if the same element is
 * encountered multiple times during traversal, at different respective depths, the context can determine if its
 * neighbours have already been explored to a deeper depth than the current branch of the traversal, or if further
 * exploration is needed.
 */
export class TraversalContext {
  private readonly graph: Subgraph;
  private readonly resolveMap: Record<string, ResolvedDepths>;

  constructor(graph: Subgraph) {
    this.graph = graph;
    this.resolveMap = {};
  }

  /**
   *  Inserts an identifier of a given graph element into the context.
   *
   *  If the element does not already exist in the context, it will be inserted with the provided `depths`. In the case,
   *  that the dependency already exists, the `depths` will be compared with depths used when inserting it before:
   *  - If there weren't any previous depths, the element hasn't been resolved at all and all depths need to be
   *  resolved, and are returned
   *  - If some of the new `depths` are higher, the element has not been fully resolved yet and the context is updated,
   *  returning the subset of depths that need further resolution.
   *  - If all of the new `depths` are lower, the element had already been resolved to a deeper depth than the current
   *  branch of exploration, and the returned object will be empty.
   * @param identifier
   * @param {PartialDepths} depths - the depths at which this current branch intends to resolve for the given
   *    element
   * @returns {PartialDepths} - the depths which hadn't been fully resolved yet while traversing
   */
  insert(
    identifier: EntityEditionId | OntologyTypeEditionId,
    depths: PartialDepths,
  ): PartialDepths {
    const idString = JSON.stringify(identifier);

    const previousDepths = this.resolveMap[idString];
    if (previousDepths) {
      return previousDepths.update(depths);
    } else {
      this.resolveMap[idString] = new ResolvedDepths(depths);
      return { ...depths };
    }
  }
}
