import { BaseUri } from "@blockprotocol/type-system/slim";

import {
  AggregateEntitiesData as AggregateEntitiesDataBase,
  Entity as EntityBase,
  EntityMetadata as EntityMetadataBase,
  EntityPropertiesObject,
  EntityPropertyValue,
  GetEntityData as GetEntityDataBase,
} from "./entity.js";
import { UnresolvedQueryTemporalAxes } from "./subgraph/temporal-axes.js";
import {
  ExclusiveTimestampLimitedTemporalBound,
  InclusiveTimestampLimitedTemporalBound,
  TemporalAxes,
  TimeInterval,
} from "./temporal-versioning.js";

export * from "./entity.js";

type HalfClosedInterval = TimeInterval<
  InclusiveTimestampLimitedTemporalBound,
  ExclusiveTimestampLimitedTemporalBound
>;

export type EntityTemporalVersioningMetadata = Record<
  TemporalAxes,
  HalfClosedInterval
>;

export type EntityMetadata = EntityMetadataBase & {
  temporalVersioning: EntityTemporalVersioningMetadata;
};

export type Entity<
  Properties extends EntityPropertiesObject | null = Record<
    BaseUri,
    EntityPropertyValue
  >,
> = EntityBase<Properties> & { metadata: EntityMetadata };

export type GetEntityData = GetEntityDataBase & {
  temporalAxes: UnresolvedQueryTemporalAxes;
};

export type AggregateEntitiesData = AggregateEntitiesDataBase & {
  temporalAxes: UnresolvedQueryTemporalAxes;
};
