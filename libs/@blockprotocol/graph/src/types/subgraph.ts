import { Entity, EntityMetadata, EntityMetadataTemporal } from "./entity.js";
import { DataTypeWithMetadata } from "./ontology/data-type.js";
import { EntityTypeWithMetadata } from "./ontology/entity-type.js";
import { PropertyTypeWithMetadata } from "./ontology/property-type.js";
import { Edges } from "./subgraph/edges.js";
import { GraphResolveDepths } from "./subgraph/graph-resolve-depths.js";
import { SubgraphTemporalAxes } from "./subgraph/temporal-axes";
import {
  EntityVertexId,
  OntologyTypeVertexId,
  Vertices,
} from "./subgraph/vertices.js";

export * from "./ontology.js";
export * from "./subgraph/edges.js";
export * from "./subgraph/graph-resolve-depths.js";
export * from "./subgraph/temporal-axes.js";
export * from "./subgraph/vertices.js";

export type SubgraphRootTypes = {
  dataType: {
    vertexId: OntologyTypeVertexId;
    element: DataTypeWithMetadata;
  };
  propertyType: {
    vertexId: OntologyTypeVertexId;
    element: PropertyTypeWithMetadata;
  };
  entityType: {
    vertexId: OntologyTypeVertexId;
    element: EntityTypeWithMetadata;
  };
  entity: {
    vertexId: EntityVertexId;
    element: Entity;
  };
};

export type SubgraphRootType = SubgraphRootTypes[keyof SubgraphRootTypes];

export type Subgraph<
  RootType extends SubgraphRootType = SubgraphRootType,
  TemporalSupport extends boolean = false,
> = {
  roots: RootType["vertexId"][];
  vertices: Vertices<TemporalSupport>;
  edges: Edges;
  depths: GraphResolveDepths;
} & (TemporalSupport extends false
  ? {}
  : {
      temporalAxes: SubgraphTemporalAxes;
    });

export type EntityRootedSubgraph<TemporalSupport extends boolean = false> =
  Subgraph<SubgraphRootTypes["entity"], TemporalSupport>;
export type DataTypeRootedSubgraph<TemporalSupport extends boolean = false> =
  Subgraph<SubgraphRootTypes["dataType"], TemporalSupport>;
export type PropertyTypeRootedSubgraph<
  TemporalSupport extends boolean = false,
> = Subgraph<SubgraphRootTypes["propertyType"], TemporalSupport>;
export type EntityTypeRootedSubgraph<TemporalSupport extends boolean = false> =
  Subgraph<SubgraphRootTypes["entityType"], TemporalSupport>;
