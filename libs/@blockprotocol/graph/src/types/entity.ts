import { JsonValue } from "@blockprotocol/core";
import { BaseUri, VersionedUri } from "@blockprotocol/type-system/slim";

import {
  EntityRootedSubgraph,
  ExclusiveTimestampLimitedTemporalBound,
  InclusiveTimestampLimitedTemporalBound,
  TemporalAxes,
  TimeInterval,
  Timestamp,
  Unbounded,
  UnresolvedQueryTemporalAxes,
} from "../types-non-temporal.js";
import { GraphResolveDepths } from "./subgraph/graph-resolve-depths.js";

/** @todo - Consider branding these */
/** @todo - Add documentation for these if we keep them */
export type EntityId = string;
// This isn't necessary, it just _could_ provide greater clarity that this corresponds to an exact vertex and can be
// used in a direct lookup and not a search in the vertices
export type EntityRevisionId = Timestamp;

export type EntityRecordId = {
  entityId: EntityId;
  editionId: string;
};

export const isEntityRecordId = (
  recordId: unknown,
): recordId is EntityRecordId => {
  return (
    recordId != null &&
    typeof recordId === "object" &&
    "entityId" in recordId &&
    "editionId" in recordId
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

type HalfClosedInterval = TimeInterval<
  InclusiveTimestampLimitedTemporalBound,
  ExclusiveTimestampLimitedTemporalBound | Unbounded
>;

export type EntityTemporalVersioningMetadata = Record<
  TemporalAxes,
  HalfClosedInterval
>;

export type EntityMetadata<TemporalSupport extends boolean> = {
  recordId: EntityRecordId;
  entityTypeId: VersionedUri;
  temporalVersioning: TemporalSupport extends true
    ? EntityTemporalVersioningMetadata
    : never;
};

export type LinkData = {
  leftToRightOrder?: number;
  rightToLeftOrder?: number;
  leftEntityId: EntityId;
  rightEntityId: EntityId;
};

export type Entity<
  TemporalSupport extends boolean,
  Properties extends EntityPropertiesObject | null = Record<
    BaseUri,
    EntityPropertyValue
  >,
> = {
  metadata: EntityMetadata<TemporalSupport>;
  linkData?: LinkData;
  properties: Properties extends null ? never : Properties;
};

export type LinkEntityAndRightEntity<TemporalSupport extends boolean> = {
  linkEntity: Entity<TemporalSupport>;
  rightEntity: Entity<TemporalSupport>;
};

export type CreateEntityData = {
  entityTypeId: VersionedUri;
  properties: EntityPropertiesObject;
  linkData?: LinkData;
};

export type GetEntityData<TemporalSupport extends boolean> = {
  entityId: EntityId;
  graphResolveDepths?: GraphResolveDepths;
  temporalAxes: TemporalSupport extends true
    ? UnresolvedQueryTemporalAxes
    : never;
};

export type UpdateEntityData = {
  entityId: EntityId;
  entityTypeId: VersionedUri;
  properties: EntityPropertiesObject;
} & Pick<LinkData, "leftToRightOrder" | "rightToLeftOrder">;

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

export type AggregateEntitiesData<TemporalSupport extends boolean> = {
  operation: AggregateOperationInput;
  graphResolveDepths?: GraphResolveDepths;
  temporalAxes: TemporalSupport extends true
    ? UnresolvedQueryTemporalAxes
    : never;
};

export type AggregateEntitiesResult<
  TemporalSupport extends boolean,
  T extends EntityRootedSubgraph<TemporalSupport>,
> = {
  results: T;
  operation: AggregateOperationInput &
    Required<Pick<AggregateOperationInput, "pageNumber" | "itemsPerPage">> & {
      pageCount?: number | null;
      totalCount?: number | null;
    };
};

/**
 * A utility type that extracts the last segment of a string delimited by a separator
 */
type BeforeTrailingLast<
  CurrentString extends string,
  Separator extends string,
  PreviouslyExtractedSegment extends string = never,
> = CurrentString extends `${string}${Separator}${infer Segment}${Separator}`
  ? BeforeTrailingLast<`${Segment}${Separator}`, Separator, Segment>
  : PreviouslyExtractedSegment;

/**
 * A properties object where the URI keys have been replaced by the last segment of the URI
 * To experiment with in block building – might be useful in patterns to make block building easier.
 * @todo remove this if we settle on a pattern that doesn't benefit from it
 */
export type SimpleProperties<Properties extends EntityPropertiesObject> = {
  [Key in keyof Properties as BeforeTrailingLast<
    Extract<Key, string>,
    "/"
  >]: Properties[Key];
};
