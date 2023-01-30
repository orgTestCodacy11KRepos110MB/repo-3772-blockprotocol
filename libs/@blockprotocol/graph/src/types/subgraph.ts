import { BaseUri, VersionedUri } from "@blockprotocol/type-system/slim";

import { Entity, EntityId, EntityRecordId } from "./entity.js";
import { OntologyTypeRecordId } from "./ontology.js";
import { DataTypeWithMetadata } from "./ontology/data-type.js";
import { EntityTypeWithMetadata } from "./ontology/entity-type.js";
import { PropertyTypeWithMetadata } from "./ontology/property-type.js";
import {
  Edges,
  EntityIdAndTimestamp,
  EntityValidInterval,
} from "./subgraph/edges.js";
import { GraphResolveDepths } from "./subgraph/graph-resolve-depths.js";
import { SubgraphTemporalAxes } from "./subgraph/temporal-axes.js";
import {
  DataTypeVertex,
  EntityTypeVertex,
  EntityVertex,
  EntityVertexId,
  OntologyTypeVertexId,
  PropertyTypeVertex,
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
  temporalAxes: TemporalSupport extends true ? SubgraphTemporalAxes : never;
};

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

/**
 * A utility type that maps various ways of identifying a single (or series of) element(s) of the graph to their
 * associated types.
 *
 * Helpful when creating generic functions that operate over a {@link Subgraph}
 */
export type GraphElementIdentifiers<TemporalSupport extends boolean> =
  | {
      identifier: VersionedUri | OntologyTypeVertexId | OntologyTypeRecordId;
      element:
        | DataTypeWithMetadata
        | PropertyTypeWithMetadata
        | EntityTypeWithMetadata;
      vertex: DataTypeVertex | PropertyTypeVertex | EntityTypeVertex;
    }
  | {
      identifier: BaseUri;
      element:
        | DataTypeWithMetadata[]
        | PropertyTypeWithMetadata[]
        | EntityTypeWithMetadata[];
      vertex: DataTypeVertex[] | PropertyTypeVertex[] | EntityTypeVertex[];
    }
  | {
      identifier: EntityIdAndTimestamp | EntityVertexId | EntityRecordId;
      element: Entity<TemporalSupport>;
      vertex: EntityVertex<TemporalSupport>;
    }
  | {
      identifier: EntityId | EntityValidInterval;
      element: Entity<TemporalSupport>[];
      vertex: EntityVertex<TemporalSupport>[];
    };

/**
 * @todo - doc
 */
type RecursiveSelect<T, U, Reversed extends boolean = false> = T extends U
  ? Reversed extends false
    ? T
    : U
  : T extends { [key in keyof U]: unknown }
  ? T extends { [key in keyof U]: RecursiveSelect<U[key], T[key], true> }
    ? T
    : never
  : never;

/**
 * @todo - doc
 */
export type IdentifierForGraphElement<
  TemporalSupport extends boolean,
  Element extends GraphElementIdentifiers<TemporalSupport>["element"],
> =
  // This extends keyof check is strange, and seems to be a limitation of typescript..
  "identifier" extends keyof RecursiveSelect<
    GraphElementIdentifiers<TemporalSupport>,
    {
      element: Element;
    }
  >
    ? RecursiveSelect<
        GraphElementIdentifiers<TemporalSupport>,
        {
          element: Element;
        }
      >["identifier"]
    : never;

/**
 * @todo - doc
 */
export type GraphElementForIdentifier<
  TemporalSupport extends boolean,
  Identifier extends GraphElementIdentifiers<TemporalSupport>["identifier"],
> =
  // This extends keyof check is strange, and seems to be a limitation of typescript..
  "element" extends keyof RecursiveSelect<
    GraphElementIdentifiers<TemporalSupport>,
    {
      identifier: Identifier;
    }
  >
    ? RecursiveSelect<
        GraphElementIdentifiers<TemporalSupport>,
        {
          identifier: Identifier;
        }
      >["element"]
    : never;
