import { MessageCallback } from "@blockprotocol/core";

import {
  AggregateEntitiesData,
  AggregateEntitiesResult,
  CreateEntityData,
  DeleteEntityData,
  Entity,
  GetEntityData,
  UpdateEntityData,
} from "./entity.js";
import { UploadFileData, UploadFileReturn } from "./file.js";
import {
  AggregateEntityTypesData,
  AggregateEntityTypesResult,
  GetEntityTypeData,
} from "./ontology/entity-type.js";
import {
  EntityRootedSubgraph,
  EntityTypeRootedSubgraph,
  EntityVertexId,
  Subgraph,
} from "./subgraph.js";

export type BlockGraphProperties<
  TemporalSupport extends boolean,
  RootEntity extends Entity<TemporalSupport> = Entity<TemporalSupport>,
> = {
  /**
   * The 'graph' object contains messages sent under the graph service from the app to the block.
   * They are sent on initialization and again when the application has new values to send.
   * One such message is 'graph.blockEntity', which is a data entity fitting the block's schema (its type).
   * @see https://blockprotocol.org/docs/spec/graph-service#message-definitions for a full list
   */
  graph: {
    blockEntitySubgraph?: Subgraph<
      TemporalSupport,
      {
        vertexId: EntityVertexId;
        element: RootEntity;
      }
    >;
    readonly?: boolean;
  };
};

export type BlockGraphMessageCallbacks<TemporalSupport extends boolean> = {
  blockEntitySubgraph: MessageCallback<
    EntityRootedSubgraph<TemporalSupport>,
    null
  >;
  readonly: MessageCallback<boolean, null>;
};

export type EmbedderGraphMessages<
  TemporalSupport extends boolean,
  Key extends keyof BlockGraphMessageCallbacks<TemporalSupport> = keyof BlockGraphMessageCallbacks<TemporalSupport>,
> = {
  [key in Key]: ({
    data,
    errors,
  }: Parameters<
    BlockGraphMessageCallbacks<TemporalSupport>[key]
  >[0]) => ReturnType<BlockGraphMessageCallbacks<TemporalSupport>[key]>;
};

export type CreateResourceError =
  | "FORBIDDEN"
  | "INVALID_INPUT"
  | "NOT_IMPLEMENTED";
export type ReadOrModifyResourceError =
  | "FORBIDDEN"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "NOT_IMPLEMENTED";

/**
 * @todo Generate these types from the JSON definition, to avoid manually keeping the JSON and types in sync
 */
export type EmbedderGraphMessageCallbacks<TemporalSupport extends boolean> = {
  createEntity: MessageCallback<
    CreateEntityData,
    null,
    Entity<TemporalSupport>,
    CreateResourceError
  >;
  updateEntity: MessageCallback<
    UpdateEntityData,
    null,
    Entity<TemporalSupport>,
    ReadOrModifyResourceError
  >;
  deleteEntity: MessageCallback<
    DeleteEntityData,
    null,
    true,
    ReadOrModifyResourceError
  >;
  getEntity: MessageCallback<
    GetEntityData<TemporalSupport>,
    null,
    EntityRootedSubgraph<TemporalSupport>,
    ReadOrModifyResourceError
  >;
  aggregateEntities: MessageCallback<
    AggregateEntitiesData<TemporalSupport>,
    null,
    AggregateEntitiesResult<
      TemporalSupport,
      EntityRootedSubgraph<TemporalSupport>
    >,
    ReadOrModifyResourceError
  >;
  /** @todo - Add Type System mutation methods */
  // createEntityType: MessageCallback<
  //   CreateEntityTypeData,
  //   null,
  //   EntityType,
  //   CreateResourceError
  // >;
  // updateEntityType: MessageCallback<
  //   UpdateEntityTypeData,
  //   null,
  //   EntityType,
  //   ReadOrModifyResourceError
  // >;
  // deleteEntityType: MessageCallback<
  //   DeleteEntityTypeData,
  //   null,
  //   true,
  //   ReadOrModifyResourceError
  // >;
  getEntityType: MessageCallback<
    GetEntityTypeData,
    null,
    EntityTypeRootedSubgraph<TemporalSupport>,
    ReadOrModifyResourceError
  >;
  aggregateEntityTypes: MessageCallback<
    AggregateEntityTypesData,
    null,
    AggregateEntityTypesResult<
      TemporalSupport,
      EntityTypeRootedSubgraph<TemporalSupport>
    >,
    ReadOrModifyResourceError
  >;
  /** @todo - Reimplement linked aggregations */
  // createLinkedAggregation: MessageCallback<
  //   CreateLinkedAggregationData,
  //   null,
  //   LinkedAggregationDefinition,
  //   CreateResourceError
  // >;
  // updateLinkedAggregation: MessageCallback<
  //   UpdateLinkedAggregationData,
  //   null,
  //   LinkedAggregationDefinition,
  //   ReadOrModifyResourceError
  // >;
  // deleteLinkedAggregation: MessageCallback<
  //   DeleteLinkedAggregationData,
  //   null,
  //   true,
  //   ReadOrModifyResourceError
  // >;
  // getLinkedAggregation: MessageCallback<
  //   GetLinkedAggregationData,
  //   null,
  //   LinkedAggregationDefinition,
  //   ReadOrModifyResourceError
  // >;
  uploadFile: MessageCallback<
    UploadFileData,
    null,
    UploadFileReturn,
    CreateResourceError
  >;
};

export type BlockGraphMessages<
  TemporalSupport extends boolean,
  Key extends keyof EmbedderGraphMessageCallbacks<TemporalSupport> = keyof EmbedderGraphMessageCallbacks<TemporalSupport>,
> = {
  [key in Key]: ({
    data,
    errors,
  }: Parameters<
    EmbedderGraphMessageCallbacks<TemporalSupport>[key]
  >[0]) => ReturnType<EmbedderGraphMessageCallbacks<TemporalSupport>[key]>;
};
