import { MockData } from "../datastore/use-mock-datastore";
import { createEntities } from "./entities";
import { mockDataTemporalAxes } from "./temporal-axes";

export const mockData: MockData = (() => {
  const temporalAxes = mockDataTemporalAxes();

  return {
    temporalAxes,
    entities: createEntities(temporalAxes),
    // linkedAggregationDefinitions,
  };
})();
