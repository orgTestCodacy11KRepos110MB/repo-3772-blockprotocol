import { PropertyType } from "@blockprotocol/graph";

export const propertyTypes = {
  numberOfEmployees: {
    kind: "propertyType",
    $id: "https://blockprotocol.org/@alice/types/property-type/number-of-employees/v/1",
    title: "Number of Employees",
    oneOf: [
      {
        $ref: "https://blockprotocol.org/@blockprotocol/types/data-type/number/v/1",
      },
    ],
  },
  name: {
    kind: "propertyType",
    $id: "https://blockprotocol.org/@alice/types/property-type/name/v/1",
    title: "Name",
    oneOf: [
      {
        $ref: "https://blockprotocol.org/@blockprotocol/types/data-type/text/v/1",
      },
    ],
  },
  age: {
    kind: "propertyType",
    $id: "https://blockprotocol.org/@alice/types/property-type/age/v/1",
    title: "Age",
    oneOf: [
      {
        $ref: "https://blockprotocol.org/@blockprotocol/types/data-type/number/v/1",
      },
    ],
  },
  email: {
    kind: "propertyType",
    $id: "https://blockprotocol.org/@alice/types/property-type/email/v/1",
    title: "E-Mail",
    oneOf: [
      {
        $ref: "https://blockprotocol.org/@blockprotocol/types/data-type/text/v/1",
      },
    ],
  },
  username: {
    kind: "propertyType",
    $id: "https://blockprotocol.org/@alice/types/property-type/username/v/1",
    title: "Username",
    oneOf: [
      {
        $ref: "https://blockprotocol.org/@blockprotocol/types/data-type/text/v/1",
      },
    ],
  },
} satisfies Record<string, PropertyType>;
