import { UnresolvedQueryTemporalAxes } from "@blockprotocol/graph";

/**
 * @todo - docs, used for non-versioned blocks, defaults to current pinned transaction, decision: time,unbounded
 */
export const getDefaultTemporalAxes = (): UnresolvedQueryTemporalAxes => {
  const currentTimestamp = new Date().toISOString();

  return {
    pinned: {
      axis: "transactionTime",
      timestamp: currentTimestamp,
    },
    variable: {
      axis: "decisionTime",
      interval: {
        start: { kind: "inclusive", limit: currentTimestamp },
        end: { kind: "unbounded" },
      },
    },
  };
};
