import { EntityType } from "@blockprotocol/graph";

export const entityTypes: EntityType[] = [
  {
    kind: "entityType",
    $id: "https://example.com/types/entity-type/company/v/1",
    type: "object",
    title: "Company",
    description: "A company or organization.",
    properties: {
      "https://example.com/types/property-type/employees/": {
        $ref: "https://example.com/types/property-type/employees/v/1",
      },
      "https://example.com/types/property-type/name/": {
        $ref: "https://example.com/types/property-type/name/v/1",
      },
    },
    required: [
      "https://example.com/types/property-type/employees/",
      "https://example.com/types/property-type/name/",
    ],
    links: {},
  },
  {
    kind: "entityType",
    $id: "https://example.com/types/entity-type/person/v/1",
    type: "object",
    title: "Person",
    description: "A human person.",
    properties: {
      "https://example.com/types/property-type/age/": {
        $ref: "https://example.com/types/property-type/age/v/1",
      },
      "https://example.com/types/property-type/email/": {
        $ref: "https://example.com/types/property-type/email/v/1",
      },
      "https://example.com/types/property-type/name/": {
        $ref: "https://example.com/types/property-type/name/v/1",
      },
      "https://example.com/types/property-type/username/": {
        $ref: "https://example.com/types/property-type/username/v/1",
      },
    },
    required: [
      "https://example.com/types/property-type/age/",
      "https://example.com/types/property-type/email/",
      "https://example.com/types/property-type/name/",
      "https://example.com/types/property-type/username/",
    ],
    links: {},
  },
];
