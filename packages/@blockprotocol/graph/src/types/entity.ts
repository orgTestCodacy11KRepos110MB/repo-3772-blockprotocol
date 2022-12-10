import { JsonValue } from "@blockprotocol/core";
import { BaseUri, VersionedUri } from "@blockprotocol/type-system/slim";

import { isOntologyTypeEditionId } from "../types";
import { Subgraph, SubgraphRootTypes } from "./subgraph";
import { GraphResolveDepths } from "./subgraph/graph-resolve-depths";
import { Timestamp } from "./subgraph/time";

/** @todo - Consider branding these */
/** @todo - Add documentation for these if we keep them */
export type EntityId = string;
export type EntityVersion = string;
export type EntityEditionId = {
  baseId: EntityId;
  versionId: EntityVersion;
};

export const isEntityEditionId = (
  editionId: unknown,
): editionId is EntityEditionId => {
  return (
    editionId != null &&
    typeof editionId === "object" &&
    "baseId" in editionId &&
    "versionId" in editionId &&
    /** @todo - is it fine to just check that versionId is string, maybe timestamp if we want to lock it into being a
     *    timestamp?
     */
    !isOntologyTypeEditionId(editionId)
  );
};

/**
 * Entity Properties are JSON objects with `BaseUri`s as keys, _except_ when there is a Data Type of primitive type
 * `object` in which case the nested objects become plain `JsonObject`s
 */
export type EntityPropertyValue = JsonValue | EntityPropertiesObject;
export type EntityPropertiesObject = {
  [_: BaseUri]: EntityPropertyValue;
};

export type EntityMetadata = {
  editionId: EntityEditionId;
  entityTypeId: VersionedUri;
};

export type LinkData = {
  leftToRightOrder?: number;
  rightToLeftOrder?: number;
  leftEntityId: EntityId;
  rightEntityId: EntityId;
};

export type Entity<
  Properties extends EntityPropertiesObject | null = Record<
    BaseUri,
    EntityPropertyValue
  >,
> = {
  metadata: EntityMetadata;
  linkData?: LinkData;
} & (Properties extends null ? {} : { properties: Properties });

export type CreateEntityData = {
  entityTypeId: VersionedUri;
  properties: EntityPropertiesObject;
  /** @todo - Support creation of linked entities */
  // links?: Omit<
  //   CreateLinkData,
  //   "sourceAccountId" | "sourceEntityId" | "sourceEntityTypeId"
  // >[];
};

export type GetEntityData = {
  entityId: EntityId;
  atTimestamp?: Timestamp;
  graphResolveDepths?: GraphResolveDepths;
};

export type UpdateEntityData = {
  entityId: EntityId;
  properties: EntityPropertiesObject;
};

export type DeleteEntityData = {
  entityId: EntityId;
};

export type FilterOperatorType =
  | FilterOperatorRequiringValue
  | FilterOperatorWithoutValue;

export type FilterOperatorWithoutValue = "IS_EMPTY" | "IS_NOT_EMPTY";

export type FilterOperatorRequiringValue =
  | "CONTAINS"
  | "DOES_NOT_CONTAIN"
  | "IS"
  | "IS_NOT"
  | "STARTS_WITH"
  | "ENDS_WITH";

export type MultiFilterOperatorType = "AND" | "OR";

export type MultiFilter = {
  filters: (
    | {
        field: string;
        operator: FilterOperatorRequiringValue;
        value: string;
      }
    | { field: string; operator: FilterOperatorWithoutValue }
  )[];
  operator: MultiFilterOperatorType;
};

export type Sort = {
  field: string;
  desc?: boolean | undefined | null;
};

export type MultiSort = Sort[];

export type AggregateOperationInput = {
  entityTypeId?: VersionedUri | null;
  pageNumber?: number | null;
  itemsPerPage?: number | null;
  multiSort?: MultiSort | null;
  multiFilter?: MultiFilter | null;
};

export type AggregateEntitiesData = {
  operation: AggregateOperationInput;
  graphResolveDepths?: GraphResolveDepths;
};

export type AggregateEntitiesResult<
  T extends Subgraph<SubgraphRootTypes["entity"]>,
> = {
  results: T;
  operation: AggregateOperationInput &
    Required<Pick<AggregateOperationInput, "pageNumber" | "itemsPerPage">> & {
      pageCount?: number | null;
      totalCount?: number | null;
    };
};
