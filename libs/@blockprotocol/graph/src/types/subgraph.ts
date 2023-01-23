import { Entity } from "./entity.js";
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

export type SubgraphRootTypes<TemporalSupport extends boolean> = {
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
    element: Entity<TemporalSupport>;
  };
};

export type SubgraphRootType<TemporalSupport extends boolean> =
  SubgraphRootTypes<TemporalSupport>[keyof SubgraphRootTypes<TemporalSupport>];

export type Subgraph<
  TemporalSupport extends boolean,
  RootType extends SubgraphRootType<TemporalSupport> = SubgraphRootType<TemporalSupport>,
> = {
  roots: RootType["vertexId"][];
  vertices: Vertices<TemporalSupport>;
  edges: Edges;
  depths: GraphResolveDepths;
} & (TemporalSupport extends true
  ? {
      temporalAxes: SubgraphTemporalAxes;
    }
  : {});

export type EntityRootedSubgraph<TemporalSupport extends boolean> = Subgraph<
  TemporalSupport,
  SubgraphRootTypes<TemporalSupport>["entity"]
>;
export type DataTypeRootedSubgraph<TemporalSupport extends boolean> = Subgraph<
  TemporalSupport,
  SubgraphRootTypes<TemporalSupport>["dataType"]
>;
export type PropertyTypeRootedSubgraph<TemporalSupport extends boolean> =
  Subgraph<TemporalSupport, SubgraphRootTypes<TemporalSupport>["propertyType"]>;
export type EntityTypeRootedSubgraph<TemporalSupport extends boolean> =
  Subgraph<TemporalSupport, SubgraphRootTypes<TemporalSupport>["entityType"]>;
