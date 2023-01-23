import { BaseUri } from "@blockprotocol/type-system/slim";

import {
  Entity,
  EntityId,
  EntityPropertiesObject,
  EntityPropertyValue,
  EntityRevisionId,
} from "../entity-temporal.js";
import { OntologyVertex, OntologyVertices } from "./vertices.js";

export * from "./vertices.js";

export type EntityVertex<
  Properties extends EntityPropertiesObject | null = Record<
    BaseUri,
    EntityPropertyValue
  >,
> = { kind: "entity"; inner: Entity<Properties> };

export type KnowledgeGraphVertex<
  Properties extends EntityPropertiesObject | null = Record<
    BaseUri,
    EntityPropertyValue
  >,
> = EntityVertex<Properties>;

export type VertexTemporal<
  Properties extends EntityPropertiesObject | null = Record<
    BaseUri,
    EntityPropertyValue
  >,
> = OntologyVertex | KnowledgeGraphVertex<Properties>;

export type KnowledgeGraphVertices = {
  [entityId: EntityId]: {
    [entityVersion: EntityRevisionId]: KnowledgeGraphVertex;
  };
};

export type Vertices = OntologyVertices & KnowledgeGraphVertices;
