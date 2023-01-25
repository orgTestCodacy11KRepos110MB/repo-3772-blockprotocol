import {
  BoundedTimeInterval,
  NonNullTimeInterval,
  Timestamp,
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

/**
 * @todo - The conditional types can be improved even further by applying conditionals on either end of the bounds
 *   e.g. if both starts are unbounded, the result start will be unbounded
 */
export const intervalIntersectionWithInterval = <
  LhsInterval extends NonNullTimeInterval = NonNullTimeInterval,
  RhsInterval extends NonNullTimeInterval = NonNullTimeInterval,
  ReturnInterval = LhsInterval | RhsInterval extends BoundedTimeInterval
    ? BoundedTimeInterval
    : NonNullTimeInterval,
>(
  lhs: LhsInterval,
  rhs: RhsInterval,
): ReturnInterval | null => {
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
    } as ReturnInterval;
  }
};
