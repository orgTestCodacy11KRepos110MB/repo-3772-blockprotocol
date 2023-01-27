import { BaseUri } from "@blockprotocol/type-system/slim";

import {
  Entity as GeneralEntity,
  EntityPropertiesObject,
  EntityPropertyValue,
  LinkEntityAndRightEntity as GeneralLinkEntityAndRightEntity,
} from "./types/entity.js";
import {
  Subgraph as GeneralSubgraph,
  SubgraphRootType,
} from "./types/subgraph.js";

export * from "./types/block-graph.js";
export * from "./types/entity.js";
export * from "./types/file.js";
export * from "./types/linked-aggregation.js";
export * from "./types/ontology.js";
export * from "./types/subgraph.js";
export * from "./types/temporal-versioning.js";

export type Entity<
  Properties extends EntityPropertiesObject | null = Record<
    BaseUri,
    EntityPropertyValue
  >,
> = GeneralEntity<false, Properties>;

export type LinkEntityAndRightEntity = GeneralLinkEntityAndRightEntity<false>;

export type Subgraph<
  RootType extends SubgraphRootType<false> = SubgraphRootType<false>,
> = GeneralSubgraph<false, RootType>;