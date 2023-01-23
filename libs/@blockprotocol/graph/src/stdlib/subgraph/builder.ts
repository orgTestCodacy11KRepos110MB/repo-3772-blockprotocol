import {
  Entity,
  EntityRecordId,
  GraphResolveDepths,
  ResolvedQueryTemporalAxes,
  Subgraph,
} from "../../index.js";
import { addEntitiesToSubgraphByMutation } from "../../internal/mutate-subgraph.js";

/**
 * Builds a Subgraph from a given set of entities, some (or all) of which may be 'link entities' –
 * i.e. entities that represent relationships between other entities – or other entities.
 *
 * The set of entities should represent the result of a query on a graph.
 * The 'roots' and 'depths' used for that query should be provided along with the data.
 *
 * The maximum value for any single depth is 255.
 *
 * This function does NOT verify that the provided depths are accurate for the data.
 * This function does NOT verify if provided temporal axes are accurate for the data.
 *   - the caller is responsible for both of the above.
 * It DOES check that the provided roots are present in the data.
 *
 * @param data – the data to build the subgraph from (which becomes the vertices)
 * @param data.entities – the entities to build the subgraph from
 * @param depths – the depth values to provide in the returned subgraph
 * @param rootRecordIds – the root values to provide in the returned subgraph
 * @param {ResolvedQueryTemporalAxes} temporalAxes - the temporal axes that were used when originally selecting the
 *   provided data
 *
 * @returns a Subgraph containing:
 *   - 'vertices' containing the provided entities
 *   - 'edges' calculated by the function, representing connections between vertices
 *   - 'depths' as provided by the caller
 *   - 'roots' as provided by the caller
 *   - 'temporalAxes' where both the `initial` and `resolved` are as provided by the caller
 *
 * @throws if the provided roots are not present in the data
 *
 * @todo add support for ontology vertices (e.g. entity types)
 */
export const buildSubgraph = <TemporalSupport extends boolean>(
  data: { entities: Entity<TemporalSupport>[] },
  rootRecordIds: EntityRecordId[],
  depths: GraphResolveDepths,
  temporalAxes: TemporalSupport extends true
    ? ResolvedQueryTemporalAxes
    : undefined,
) => {
  const missingRoots = rootRecordIds.filter(
    ({ entityId, editionId }) =>
      !data.entities.find(
        (entity) =>
          entity.metadata.recordId.entityId === entityId &&
          entity.metadata.recordId.editionId === editionId,
      ),
  );

  if (missingRoots) {
    throw new Error(
      `Root(s) not present in data: ${missingRoots
        .map(
          (missingRoot) =>
            `${missingRoot.entityId} at version ${missingRoot.editionId}`,
        )
        .join(", ")}`,
    );
  }

  const roots = rootRecordIds.map((rootRecordId) => ({
    baseId: rootRecordId.entityId,
    /** @todo - This is temporary, and wrong */
    revisionId: rootRecordId.editionId,
  }));

  const subgraph: Subgraph<TemporalSupport> = {
    roots,
    vertices: {},
    edges: {},
    depths,
    temporalAxes:
      temporalAxes !== undefined
        ? {
            initial: temporalAxes,
            resolved: temporalAxes,
          }
        : undefined,
  };

  addEntitiesToSubgraphByMutation(subgraph, data.entities);

  return subgraph;
};
