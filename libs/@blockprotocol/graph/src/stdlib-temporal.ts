/**
 * The extended standard library of functions for interacting with a `Subgraph`, with support for temporal versioning.
 */
import { buildSubgraph as buildSubgraphGeneral } from "./stdlib/subgraph/builder";
import { Entity, EntityRecordId } from "./types/entity";
import { EntityRootedSubgraph } from "./types/subgraph";
import { GraphResolveDepths } from "./types/subgraph/graph-resolve-depths";
import { ResolvedQueryTemporalAxes } from "./types/subgraph/temporal-axes";

export {
  getIncomingLinksForEntity,
  getLeftEntityForLinkEntity,
  getOutgoingLinkAndTargetEntities,
  getOutgoingLinksForEntity,
  getRightEntityForLinkEntity,
} from "./stdlib/subgraph/edge/link-entity.js";
export {
  getDataTypeById,
  getDataTypes,
  getDataTypesByBaseUri,
} from "./stdlib/subgraph/element/data-type.js";
export { getEntities, getEntity } from "./stdlib/subgraph/element/entity.js";
export {
  getEntityTypeById,
  getEntityTypes,
  getEntityTypesByBaseUri,
} from "./stdlib/subgraph/element/entity-type.js";
export {
  getPropertyTypeById,
  getPropertyTypes,
  getPropertyTypesByBaseUri,
} from "./stdlib/subgraph/element/property-type.js";
export { getRoots } from "./stdlib/subgraph/roots.js";

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
export const buildSubgraph = (
  data: { entities: Entity<true>[] },
  rootRecordIds: EntityRecordId[],
  depths: GraphResolveDepths,
  temporalAxes: ResolvedQueryTemporalAxes,
): EntityRootedSubgraph<true> => {
  return buildSubgraphGeneral<true>(data, rootRecordIds, depths, temporalAxes);
};
