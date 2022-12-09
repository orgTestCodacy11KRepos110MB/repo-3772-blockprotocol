import { BaseUri } from "@blockprotocol/type-system/slim";

import { EntityId } from "../entity";
import {
  KnowledgeGraphOutwardEdge,
  OntologyOutwardEdge,
} from "./edges/outward-edge";
import { Timestamp } from "./time";

export * from "./edges/kind";
export * from "./edges/outward-edge";

export type OntologyRootedEdges = {
  [_: BaseUri]: {
    [_: number]: OntologyOutwardEdge[];
  };
};

export type KnowledgeGraphRootedEdges = {
  [_: EntityId]: {
    [_: Timestamp]: KnowledgeGraphOutwardEdge[];
  };
};

export type Edges = OntologyRootedEdges & KnowledgeGraphRootedEdges;
