import {
  BoundedTimeInterval,
  NonNullTimeInterval,
  TemporalBound,
  Timestamp,
  TimestampLimitedTemporalBound,
} from "../types/temporal-versioning";
import { boundIsAdjacentTo, compareBounds } from "./bound";

export const intervalIsAdjacentToInterval = (
  lhs: NonNullTimeInterval,
  rhs: NonNullTimeInterval,
): boolean => {
  return (
    boundIsAdjacentTo(lhs.end, rhs.start) ||
    boundIsAdjacentTo(lhs.start, rhs.end)
  );
};

export const intervalContainsInterval = (
  lhs: NonNullTimeInterval,
  rhs: NonNullTimeInterval,
): boolean => {
  return (
    compareBounds(lhs.start, rhs.start, "start", "start") <= 0 &&
    compareBounds(lhs.end, rhs.end, "end", "end") >= 0
  );
};

export const intervalContainsTimestamp = (
  interval: NonNullTimeInterval,
  timestamp: Timestamp,
): boolean => {
  return (
    compareBounds(
      interval.start,
      { kind: "inclusive", limit: timestamp },
      "start",
      "start",
    ) <= 0 &&
    compareBounds(
      interval.end,
      { kind: "inclusive", limit: timestamp },
      "end",
      "end",
    ) >= 0
  );
};

export const intervalOverlapsInterval = (
  lhs: NonNullTimeInterval,
  rhs: NonNullTimeInterval,
): boolean => {
  return (
    (compareBounds(lhs.start, rhs.start, "start", "start") >= 0 &&
      compareBounds(lhs.start, rhs.end, "start", "end") <= 0) ||
    (compareBounds(rhs.start, lhs.start, "start", "start") >= 0 &&
      compareBounds(rhs.start, lhs.end, "start", "end") <= 0)
  );
};

// If *either* of the start bounds is bounded, then the resultant start bound will be bounded, same goes for end
// respectively
type IntersectionReturn<
  LhsInterval extends NonNullTimeInterval,
  RhsInterval extends NonNullTimeInterval,
> = [LhsInterval, RhsInterval] extends [
  NonNullTimeInterval<infer LhsStartBound, infer LhsEndBound>,
  NonNullTimeInterval<infer RhsStartBound, infer RhsEndBound>,
]
  ? NonNullTimeInterval<
      LhsStartBound | RhsStartBound extends TimestampLimitedTemporalBound
        ? TimestampLimitedTemporalBound
        : TemporalBound,
      LhsEndBound | RhsEndBound extends TimestampLimitedTemporalBound
        ? TimestampLimitedTemporalBound
        : TemporalBound
    >
  : never;

export const intervalIntersectionWithInterval = <
  LhsInterval extends NonNullTimeInterval = NonNullTimeInterval,
  RhsInterval extends NonNullTimeInterval = NonNullTimeInterval,
>(
  lhs: LhsInterval,
  rhs: RhsInterval,
): IntersectionReturn<LhsInterval, RhsInterval> | null => {
  if (!intervalOverlapsInterval(lhs, rhs)) {
    return null;
  } else {
    return {
      start:
        compareBounds(lhs.start, rhs.start, "start", "start") <= 0
          ? rhs.start
          : lhs.start,
      end:
        compareBounds(lhs.end, rhs.end, "end", "end") <= 0 ? lhs.end : rhs.end,
    } as IntersectionReturn<LhsInterval, RhsInterval>;
  }
};

// If *both* of the start bounds are bounded, then the resultant start bound will be bounded, same goes for end
// respectively
type MergeReturn<
  LhsInterval extends NonNullTimeInterval,
  RhsInterval extends NonNullTimeInterval,
> = [LhsInterval, RhsInterval] extends [
  NonNullTimeInterval<infer LhsStartBound, infer LhsEndBound>,
  NonNullTimeInterval<infer RhsStartBound, infer RhsEndBound>,
]
  ? NonNullTimeInterval<
      LhsStartBound extends TimestampLimitedTemporalBound
        ? RhsStartBound extends TimestampLimitedTemporalBound
          ? TimestampLimitedTemporalBound
          : TemporalBound
        : TemporalBound,
      LhsEndBound extends TimestampLimitedTemporalBound
        ? RhsEndBound extends TimestampLimitedTemporalBound
          ? TimestampLimitedTemporalBound
          : TemporalBound
        : TemporalBound
    >
  : never;

export const intervalMergeWithInterval = <
  LhsInterval extends NonNullTimeInterval = NonNullTimeInterval,
  RhsInterval extends NonNullTimeInterval = NonNullTimeInterval,
>(
  lhs: LhsInterval,
  rhs: RhsInterval,
): MergeReturn<LhsInterval, RhsInterval> => {
  return {
    start:
      compareBounds(lhs.start, rhs.start, "start", "start") <= 0
        ? lhs.start
        : rhs.start,
    end: compareBounds(lhs.end, rhs.end, "end", "end") >= 0 ? lhs.end : rhs.end,
  } as MergeReturn<LhsInterval, RhsInterval>;
};

type UnionReturn<
  LhsInterval extends NonNullTimeInterval,
  RhsInterval extends NonNullTimeInterval,
> =
  | [MergeReturn<LhsInterval, RhsInterval>]
  | [LhsInterval, RhsInterval]
  | [RhsInterval, LhsInterval];

export const intervalUnionWithInterval = <
  LhsInterval extends NonNullTimeInterval = NonNullTimeInterval,
  RhsInterval extends NonNullTimeInterval = NonNullTimeInterval,
>(
  lhs: LhsInterval,
  rhs: RhsInterval,
): UnionReturn<LhsInterval, RhsInterval> => {
  if (
    intervalOverlapsInterval(lhs, rhs) ||
    intervalIsAdjacentToInterval(lhs, rhs)
  ) {
    return [intervalMergeWithInterval(lhs, rhs)];
  } else if (compareBounds(lhs.start, rhs.start, "start", "start") < 0) {
    return [lhs, rhs];
  } else {
    return [rhs, lhs];
  }
};

export const unionOfIntervals = <IntervalsType extends NonNullTimeInterval>(
  ...intervals: IntervalsType[]
): UnionReturn<IntervalsType, IntervalsType>[number][] => {
  intervals.sort((intervalA, intervalB) => {
    const startComparison = compareBounds(
      intervalA.start,
      intervalB.start,
      "start",
      "start",
    );

    return startComparison !== 0
      ? startComparison
      : compareBounds(intervalA.end, intervalB.end, "end", "end");
  });

  return intervals.reduce((union, currentInterval) => {
    if (union.length === 0) {
      return [currentInterval];
    } else {
      // The intervals were sorted above, it's only necessary to check the union of this with the last interval, if it
      // overlaps two of the previous ones (which would make it necessary to check the union with more than just the
      // last) then those would have been merged into one in the previous iteration (again because they are sorted).
      return [
        ...union.slice(0, -1),
        ...intervalUnionWithInterval(union[-1]!, currentInterval),
      ];
    }
  }, [] as UnionReturn<IntervalsType, IntervalsType>[number][]);
};
