import { Subgraph } from "@blockprotocol/graph";
import { buildSubgraph } from "@blockprotocol/graph/stdlib-temporal";
import { useMemo } from "react";

import { MockData } from "./use-mock-datastore";

export const useMockDataToSubgraph = (mockData: MockData): Subgraph<true> => {
  return useMemo(() => {
    const { entities } = mockData;

    return buildSubgraph({ entities }, [], {
      hasLeftEntity: { incoming: 255, outgoing: 255 },
      hasRightEntity: { incoming: 255, outgoing: 255 },
    });
  }, [mockData]);
};
