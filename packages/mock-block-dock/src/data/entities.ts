import { Entity } from "@blockprotocol/graph";
import { extractBaseUri } from "@blockprotocol/type-system/slim";

import { entityTypes } from "./entity-types";
import { propertyTypes } from "./property-types";
import { companyNames, personNames } from "./words";

const entities: Entity[] = [];

const NUMBER_OF_ENTITIES_TO_CREATE = Math.min(
  personNames.length,
  companyNames.length,
);

const createPerson = (entityId: number): Entity => {
  const name = personNames[entityId] ?? "Unknown Person";
  return {
    metadata: {
      editionId: {
        baseId: `person-${entityId.toString()}`,
        versionId: new Date().toISOString(),
      },
      entityTypeId: entityTypes.person.$id,
    },
    properties: {
      [extractBaseUri(propertyTypes.age.$id)]: Math.ceil(Math.random() * 100),
      [extractBaseUri(propertyTypes.email.$id)]: `${name}@example.com`,
      [extractBaseUri(propertyTypes.name.$id)]: name,
      [extractBaseUri(propertyTypes.username.$id)]: name.toLowerCase(),
    },
  };
};

const createCompany = (entityId: number): Entity => {
  const name = companyNames[entityId] ?? "Unknown Company";
  return {
    metadata: {
      editionId: {
        baseId: `company-${entityId.toString()}`,
        versionId: new Date().toISOString(),
      },
      entityTypeId: entityTypes.company.$id,
    },
    properties: {
      [extractBaseUri(propertyTypes.numberOfEmployees.$id)]: Math.ceil(
        Math.random() * 10_000,
      ),
      [extractBaseUri(propertyTypes.name.$id)]: name,
    },
  };
};

for (let id = 0; id < NUMBER_OF_ENTITIES_TO_CREATE; id++) {
  entities.push(createCompany(id));
  entities.push(createPerson(id));
}

export { entities };
