import { EntityType } from "@blockprotocol/graph";
import { extractBaseUri } from "@blockprotocol/type-system/slim";

import { propertyTypes } from "./property-types";

export const entityTypes = {
  company: {
    kind: "entityType",
    $id: "https://example.com/types/entity-type/company/v/1",
    type: "object",
    title: "Company",
    description: "A company or organization.",
    properties: {
      [extractBaseUri(propertyTypes.numberOfEmployees.$id)]: {
        $ref: propertyTypes.numberOfEmployees.$id,
      },
      [extractBaseUri(propertyTypes.name.$id)]: {
        $ref: propertyTypes.name.$id,
      },
    },
    required: [
      extractBaseUri(propertyTypes.numberOfEmployees.$id),
      extractBaseUri(propertyTypes.name.$id),
    ],
    links: {},
  },
  person: {
    kind: "entityType",
    $id: "https://example.com/types/entity-type/person/v/1",
    type: "object",
    title: "Person",
    description: "A human person.",
    properties: {
      [extractBaseUri(propertyTypes.age.$id)]: {
        $ref: propertyTypes.age.$id,
      },
      [extractBaseUri(propertyTypes.email.$id)]: {
        $ref: propertyTypes.email.$id,
      },
      [extractBaseUri(propertyTypes.name.$id)]: {
        $ref: propertyTypes.name.$id,
      },
      [extractBaseUri(propertyTypes.username.$id)]: {
        $ref: propertyTypes.username.$id,
      },
    },
    required: [
      extractBaseUri(propertyTypes.age.$id),
      extractBaseUri(propertyTypes.email.$id),
      extractBaseUri(propertyTypes.name.$id),
      extractBaseUri(propertyTypes.username.$id),
    ],
    links: {},
  },
} satisfies Record<string, EntityType>;
