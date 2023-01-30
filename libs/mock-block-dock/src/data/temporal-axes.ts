import { ResolvedQueryTemporalAxes } from "@blockprotocol/graph";

export const mockDataTemporalAxes = (): ResolvedQueryTemporalAxes => {
  const now = new Date().toISOString();

  const interval = {
    start: {
      kind: "inclusive",
      limit: new Date(0).toISOString(),
    },
    end: {
      kind: "inclusive",
      limit: now,
    },
  } as const;

  return {
    pinned: {
      axis: "transactionTime",
      timestamp: now,
    },
    variable: {
      axis: "decisionTime",
      interval,
    },
  };
};
