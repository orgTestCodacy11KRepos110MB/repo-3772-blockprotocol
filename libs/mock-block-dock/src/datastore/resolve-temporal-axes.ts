import {
  ResolvedQueryTemporalAxes,
  UnresolvedQueryTemporalAxes,
} from "@blockprotocol/graph";

export const resolveTemporalAxes = (
  initialTemporalAxis: UnresolvedQueryTemporalAxes,
): ResolvedQueryTemporalAxes => {
  const currentTimestamp = new Date().toISOString();

  const resolvedTemporalAxes = JSON.parse(
    JSON.stringify(initialTemporalAxis),
  ) as UnresolvedQueryTemporalAxes;

  if (resolvedTemporalAxes.pinned.timestamp === null) {
    resolvedTemporalAxes.pinned.timestamp = currentTimestamp;
  }
  if (resolvedTemporalAxes.variable.interval.start === null) {
    resolvedTemporalAxes.variable.interval.start = {
      kind: "inclusive",
      limit: currentTimestamp,
    };
  }
  if (resolvedTemporalAxes.variable.interval.end === null) {
    resolvedTemporalAxes.variable.interval.end = {
      kind: "inclusive",
      limit: currentTimestamp,
    };
  }

  /** @todo - can we ergonomically convince TS of this type and avoid a cast */
  return resolvedTemporalAxes as ResolvedQueryTemporalAxes;
};
