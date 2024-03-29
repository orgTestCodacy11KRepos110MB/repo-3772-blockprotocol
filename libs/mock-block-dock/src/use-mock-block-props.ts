import {
  BlockGraph,
  EmbedderGraphMessageCallbacks,
  Entity,
  EntityType,
  Link,
  LinkedAggregation,
  LinkedAggregationDefinition,
} from "@blockprotocol/graph";
import { Dispatch, SetStateAction, useMemo } from "react";

import { mockData as initialMockData } from "./data";
import { useDefaultState } from "./use-default-state";
import { useLinkFields } from "./use-mock-block-props/use-link-fields";
import {
  MockData,
  useMockDatastore,
} from "./use-mock-block-props/use-mock-datastore";

export type MockBlockHookArgs = {
  blockEntity?: Entity;
  blockSchema?: Partial<EntityType>;
  initialEntities?: Entity[];
  initialEntityTypes?: EntityType[];
  initialLinks?: Link[];
  initialLinkedAggregations?: LinkedAggregationDefinition[];
  readonly: boolean;
};

export type MockBlockHookResult = {
  blockEntity: Entity;
  blockGraph: BlockGraph;
  blockSchema?: Partial<EntityType>;
  datastore: MockData;
  entityTypes: EntityType[];
  graphServiceCallbacks: Required<EmbedderGraphMessageCallbacks>;
  linkedAggregations: LinkedAggregation[];
  readonly: boolean;
  setReadonly: Dispatch<SetStateAction<boolean>>;
  setEntityIdOfEntityForBlock: Dispatch<SetStateAction<string>>;
};

/**
 * A hook to generate Block Protocol properties and callbacks for use in testing blocks.
 * The starting mock data can be customized using the initial[X] props.
 * See README.md for usage instructions.
 * @param [blockEntity] the block's own starting properties, if any
 * @param [blockSchema] - The schema for the block entity
 * @param [initialEntities] - The entities to include in the data store (NOT the block entity, which is always provided)
 * @param [initialEntityTypes] - The entity types to include in the data store (NOT the block's type, which is always provided)
 * @param [initialLinks] - The links to include in the data store
 * @param [initialLinkedAggregations] - The linkedAggregation DEFINITIONS to include in the data store (results will be resolved automatically)
 */
export const useMockBlockProps = ({
  blockEntity: externalBlockEntity,
  blockSchema: externalBlockSchema,
  initialEntities,
  initialEntityTypes,
  initialLinks,
  initialLinkedAggregations,
  readonly: externalReadonly,
}: MockBlockHookArgs): MockBlockHookResult => {
  const [entityIdOfEntityForBlock, setEntityIdOfEntityForBlock] =
    useDefaultState<string>(externalBlockEntity?.entityId ?? "");

  const [readonly, setReadonly] = useDefaultState<boolean>(externalReadonly);

  const { initialBlockEntity, mockData } = useMemo((): {
    initialBlockEntity: Entity;
    mockData: MockData;
  } => {
    const entityTypeId = externalBlockEntity?.entityTypeId ?? "block-type-1";

    const blockEntityType: EntityType = {
      entityTypeId,
      schema: {
        title: "BlockType",
        type: "object",
        $schema: "https://json-schema.org/draft/2019-09/schema",
        $id: "http://localhost/blockType1",
        ...(externalBlockSchema ?? {}),
      },
    };

    const newBlockEntity: Entity = {
      entityId: "block1",
      entityTypeId,
      properties: {},
    };

    if (externalBlockEntity && Object.keys(externalBlockEntity).length > 0) {
      Object.assign(newBlockEntity, externalBlockEntity);
    }

    const nextMockData: MockData = {
      entities: [
        newBlockEntity,
        ...(initialEntities ?? initialMockData.entities),
      ],
      entityTypes: [
        blockEntityType,
        ...(initialEntityTypes ?? initialMockData.entityTypes),
      ],
      links: initialLinks ?? initialMockData.links,
      linkedAggregationDefinitions:
        initialLinkedAggregations ??
        initialMockData.linkedAggregationDefinitions,
    };

    return { initialBlockEntity: newBlockEntity, mockData: nextMockData };
  }, [
    externalBlockEntity,
    externalBlockSchema,
    initialEntities,
    initialEntityTypes,
    initialLinks,
    initialLinkedAggregations,
  ]);

  const datastore = useMockDatastore(mockData, readonly);

  const {
    entities,
    entityTypes,
    graphServiceCallbacks,
    links,
    linkedAggregationDefinitions,
  } = datastore;

  const latestBlockEntity = useMemo(() => {
    return (
      entities.find((entity) => entity.entityId === entityIdOfEntityForBlock) ??
      // fallback in case the entityId of the wrapped component is updated by updating its props
      mockData.entities.find(
        (entity) => entity.entityId === initialBlockEntity.entityId,
      )
    );
  }, [
    entities,
    initialBlockEntity.entityId,
    mockData.entities,
    entityIdOfEntityForBlock,
  ]);

  if (!latestBlockEntity) {
    throw new Error("Cannot find block entity. Did it delete itself?");
  }

  // construct BP-specified link fields from the links and linkedAggregations in the datastore
  const { blockGraph, linkedAggregations } = useLinkFields({
    entities,
    links,
    linkedAggregationDefinitions,
    startingEntity: latestBlockEntity,
  });

  // @todo we don't do anything with this type except check it exists - do we need to do this?
  const latestBlockEntityType = useMemo(
    () =>
      entityTypes.find(
        (entityType) =>
          entityType.entityTypeId === latestBlockEntity.entityTypeId,
      ),
    [entityTypes, latestBlockEntity.entityTypeId],
  );

  if (!latestBlockEntityType) {
    throw new Error("Cannot find block entity type. Has it been deleted?");
  }

  return {
    blockEntity: latestBlockEntity,
    blockGraph,
    blockSchema: externalBlockSchema,
    datastore,
    entityTypes,
    graphServiceCallbacks,
    linkedAggregations,
    readonly,
    setEntityIdOfEntityForBlock,
    setReadonly,
  };
};
