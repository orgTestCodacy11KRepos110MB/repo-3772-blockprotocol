/**
 * The extended standard library of functions for interacting with a `Subgraph`, with support for temporal versioning.
 */
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