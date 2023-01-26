import { typedEntries } from "../../../codegen/shared.js";
import {
  Entity,
  EntityId,
  isHasLeftEntityEdge,
  isHasRightEntityEdge,
  isIncomingLinkEdge,
  isOutgoingLinkEdge,
  LinkEntityAndRightEntity,
  NonNullTimeInterval,
  OutwardEdge,
  Subgraph,
  Timestamp,
} from "../../../index.js";
import { compareBounds } from "../../bound.js";
import {
  getLatestInstantIntervalForSubgraph,
  intervalIntersectionWithInterval,
} from "../../interval.js";
import { mustBeDefined } from "../../must-be-defined.js";
import { getEntityRevisionsByEntityId } from "../element/entity.js";

const convertTimeToStringWithDefault = (timestamp?: Date | Timestamp) => {
  return timestamp === undefined
    ? new Date().toISOString()
    : typeof timestamp === "string"
    ? timestamp
    : timestamp.toISOString();
};

const getUniqueEntitiesFilter = <TemporalSupport extends boolean>() => {
  const set = new Set();
  return (entity: Entity<TemporalSupport>) => {
    const recordIdString = JSON.stringify(entity.metadata.recordId);
    if (set.has(recordIdString)) {
      return false;
    } else {
      set.add(recordIdString);
      return true;
    }
  };
};

/**
 * Get all outgoing link entities from a given entity.
 *
 * @param {Subgraph} subgraph
 * @param {EntityId} entityId - The ID of the source entity to search for outgoing links from
 * @param {NonNullTimeInterval} [interval] - An optional {@link NonNullTimeInterval} which, when provided with a
 *  {@link Subgraph} that supports temporal versioning, will constrain the results to links that were present during
 *  that interval. If the parameter is omitted then results will default to only returning results that are active in
 *  the latest instant of time in the {@link Subgraph}
 */
export const getOutgoingLinksForEntity = <TemporalSupport extends boolean>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  interval?: TemporalSupport extends true ? NonNullTimeInterval : never,
): Entity<TemporalSupport>[] => {
  const searchInterval =
    interval !== undefined
      ? interval
      : getLatestInstantIntervalForSubgraph(subgraph);

  const entityEdges = subgraph.edges[entityId];

  if (!entityEdges) {
    return [];
  }

  const uniqueEntitiesFilter = getUniqueEntitiesFilter();

  return (
    Object.entries(entityEdges)
      // Only look at outgoing edges that were created before or within the search interval
      .filter(
        ([edgeTimestamp, _outwardEdges]) =>
          compareBounds(
            { kind: "inclusive", limit: edgeTimestamp },
            searchInterval.end,
            /** @todo - should this be end */
            "start",
            "end",
          ) <= 0,
      )
      // Extract the link endpoint information
      .flatMap(([_edgeTimestamp, outwardEdges]) => {
        return (outwardEdges as OutwardEdge[])
          .filter(isOutgoingLinkEdge)
          .map((edge) => {
            return edge.rightEndpoint;
          });
      })
      .flatMap(({ entityId: linkEntityId, validInterval }) => {
        if (subgraph.temporalAxes !== undefined) {
          // Find the revisions of the link at the intersection of the search interval and the edge's valid interval
          const intersection = intervalIntersectionWithInterval(
            searchInterval,
            validInterval,
          );

          if (intersection === null) {
            throw new Error(
              `No entity revision was found which overlapped the given edge, subgraph was likely malformed.\n` +
                `EntityId: ${linkEntityId}\n` +
                `Search Interval: ${JSON.stringify(searchInterval)}\n` +
                `Edge Valid Interval: ${JSON.stringify(validInterval)}`,
            );
          }

          return getEntityRevisionsByEntityId(
            subgraph as Subgraph<true>,
            linkEntityId,
            intersection,
          ) as Entity<TemporalSupport>[];
        } else {
          return getEntityRevisionsByEntityId(subgraph, linkEntityId);
        }
      })
      .filter(uniqueEntitiesFilter)
  );
};

/**
 * Get all incoming link entities from a given entity.
 *
 * @param {Subgraph} subgraph
 * @param {EntityId} entityId - The ID of the source entity to search for incoming links to
 * @param {NonNullTimeInterval} [interval] - An optional {@link NonNullTimeInterval} which, when provided with a
 *  {@link Subgraph} that supports temporal versioning, will constrain the results to links that were present during
 *  that interval. If the parameter is omitted then results will default to only returning results that are active in
 *  the latest instant of time in the {@link Subgraph}
 */
export const getIncomingLinksForEntity = <TemporalSupport extends boolean>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  interval?: TemporalSupport extends true ? NonNullTimeInterval : never,
): Entity<TemporalSupport>[] => {
  const searchInterval =
    interval !== undefined
      ? interval
      : getLatestInstantIntervalForSubgraph(subgraph);

  const entityEdges = subgraph.edges[entityId];

  if (!entityEdges) {
    return [];
  }

  const uniqueEntitiesFilter = getUniqueEntitiesFilter();

  return (
    Object.entries(entityEdges)
      // Only look at outgoing edges that were created before or within the search interval
      .filter(
        ([edgeTimestamp, _outwardEdges]) =>
          compareBounds(
            { kind: "inclusive", limit: edgeTimestamp },
            searchInterval.end,
            /** @todo - should this be end */
            "start",
            "end",
          ) <= 0,
      )
      // Extract the link endpoint information
      .flatMap(([_edgeTimestamp, outwardEdges]) => {
        return (outwardEdges as OutwardEdge[])
          .filter(isIncomingLinkEdge)
          .map((edge) => {
            return edge.rightEndpoint;
          });
      })
      .flatMap(({ entityId: linkEntityId, validInterval }) => {
        if (subgraph.temporalAxes !== undefined) {
          // Find the revisions of the link at the intersection of the search interval and the edge's valid interval
          const intersection = intervalIntersectionWithInterval(
            searchInterval,
            validInterval,
          );

          if (intersection === null) {
            throw new Error(
              `No entity revision was found which overlapped the given edge, subgraph was likely malformed.\n` +
                `EntityId: ${linkEntityId}\n` +
                `Search Interval: ${JSON.stringify(searchInterval)}\n` +
                `Edge Valid Interval: ${JSON.stringify(validInterval)}`,
            );
          }

          return getEntityRevisionsByEntityId(
            subgraph as Subgraph<true>,
            linkEntityId,
            intersection,
          ) as Entity<TemporalSupport>[];
        } else {
          return getEntityRevisionsByEntityId(subgraph, linkEntityId);
        }
      })
      .filter(uniqueEntitiesFilter)
  );
};

/**
 * Get the "left entity" revisions (by default this is the "source") of a given link entity.
 *
 * @param {Subgraph} subgraph
 * @param {EntityId} entityId - The ID of the link entity
 * @param {NonNullTimeInterval} [interval] - An optional {@link NonNullTimeInterval} which, when provided with a
 *  {@link Subgraph} that supports temporal versioning, will constrain the results to links that were present during
 *  that interval. If the parameter is omitted then results will default to only returning results that are active in
 *  the latest instant of time in the {@link Subgraph}
 */
export const getLeftEntityForLinkEntity = <TemporalSupport extends boolean>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  interval?: TemporalSupport extends true ? NonNullTimeInterval : never,
): Entity<TemporalSupport>[] => {
  const searchInterval =
    interval !== undefined
      ? interval
      : getLatestInstantIntervalForSubgraph(subgraph);

  const linkEntityEdges = mustBeDefined(
    subgraph.edges[entityId],
    "link entities must have left endpoints and therefore must have edges",
  );

  const outwardEdge = mustBeDefined(
    Object.values(linkEntityEdges).flat().find(isHasLeftEntityEdge),
    "link entities must have left endpoints",
  );

  const leftEntityId = outwardEdge.rightEndpoint.entityId;

  if (subgraph.temporalAxes !== undefined) {
    const { validInterval } = outwardEdge.rightEndpoint;
    const intersection = intervalIntersectionWithInterval(
      searchInterval,
      validInterval,
    );

    if (intersection === null) {
      throw new Error(
        `No entity revision was found which overlapped the given edge, subgraph was likely malformed.\n` +
          `EntityId: ${leftEntityId}\n` +
          `Search Interval: ${JSON.stringify(searchInterval)}\n` +
          `Edge Valid Interval: ${JSON.stringify(validInterval)}`,
      );
    }

    return getEntityRevisionsByEntityId(
      subgraph as Subgraph<true>,
      leftEntityId,
      intersection,
    ) as Entity<TemporalSupport>[];
  } else {
    return getEntityRevisionsByEntityId(
      subgraph as Subgraph<true>,
      leftEntityId,
    ) as Entity<TemporalSupport>[];
  }
};

/**
 * Get the "right entity" revisions (by default this is the "target") of a given link entity.
 *
 * @param {Subgraph} subgraph
 * @param {EntityId} entityId - The ID of the link entity
 * @param {NonNullTimeInterval} [interval] - An optional {@link NonNullTimeInterval} which, when provided with a
 *  {@link Subgraph} that supports temporal versioning, will constrain the results to links that were present during
 *  that interval. If the parameter is omitted then results will default to only returning results that are active in
 *  the latest instant of time in the {@link Subgraph}
 */
export const getRightEntityForLinkEntity = <TemporalSupport extends boolean>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  interval?: TemporalSupport extends true ? NonNullTimeInterval : never,
): Entity<TemporalSupport>[] => {
  const searchInterval =
    interval !== undefined
      ? interval
      : getLatestInstantIntervalForSubgraph(subgraph);

  const linkEntityEdges = mustBeDefined(
    subgraph.edges[entityId],
    "link entities must have right endpoints and therefore must have edges",
  );

  const outwardEdge = mustBeDefined(
    Object.values(linkEntityEdges).flat().find(isHasRightEntityEdge),
    "link entities must have right endpoints",
  );

  const rightEntityId = outwardEdge.rightEndpoint.entityId;

  if (subgraph.temporalAxes !== undefined) {
    const { validInterval } = outwardEdge.rightEndpoint;
    const intersection = intervalIntersectionWithInterval(
      searchInterval,
      validInterval,
    );

    if (intersection === null) {
      throw new Error(
        `No entity revision was found which overlapped the given edge, subgraph was likely malformed.\n` +
          `EntityId: ${rightEntityId}\n` +
          `Search Interval: ${JSON.stringify(searchInterval)}\n` +
          `Edge Valid Interval: ${JSON.stringify(validInterval)}`,
      );
    }

    return getEntityRevisionsByEntityId(
      subgraph as Subgraph<true>,
      rightEntityId,
      intersection,
    ) as Entity<TemporalSupport>[];
  } else {
    return getEntityRevisionsByEntityId(
      subgraph as Subgraph<true>,
      rightEntityId,
    ) as Entity<TemporalSupport>[];
  }
};

/**
 * For a given moment in time, get all outgoing link entities, and their "target" entities (by default this is the
 * "right entity"), from a given entity.
 *
 * @param subgraph
 * @param {EntityId} entityId - The ID of the source entity to search for outgoing links from
 * @param {Date | Timestamp} [timestamp] - An optional `Date` or an ISO-formatted datetime string of the moment to
 *    search for. If the parameter is omitted then results will default to only returning results that are active in
 *    the latest instant of time in the {@link Subgraph}
 */
export const getOutgoingLinkAndTargetEntities = <
  TemporalSupport extends boolean,
  LinkAndRightEntities extends LinkEntityAndRightEntity<TemporalSupport>[] = LinkEntityAndRightEntity<TemporalSupport>[],
>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  timestamp?: TemporalSupport extends true ? Date | Timestamp : never,
): LinkAndRightEntities => {
  const searchInterval =
    timestamp !== undefined
      ? ({
          start: {
            kind: "inclusive",
            limit: convertTimeToStringWithDefault(timestamp),
          },
          end: {
            kind: "inclusive",
            limit: convertTimeToStringWithDefault(timestamp),
          },
        } as const)
      : getLatestInstantIntervalForSubgraph(subgraph);

  if (subgraph.temporalAxes !== undefined) {
    const outgoingLinkEntities = getOutgoingLinksForEntity(
      subgraph as Subgraph<true>,
      entityId,
      searchInterval,
    );
    const mappedRevisions = outgoingLinkEntities.reduce(
      (revisionMap, entity) => {
        const linkEntityId = entity.metadata.recordId.entityId;

        if (revisionMap[linkEntityId] !== undefined) {
          revisionMap[linkEntityId]!.push(entity);
        } else {
          // eslint-disable-next-line no-param-reassign
          revisionMap[linkEntityId] = [entity];
        }

        return revisionMap;
      },
      {} as Record<EntityId, Entity<true>[]>,
    );

    return typedEntries(mappedRevisions).map(
      ([linkEntityId, linkEntityRevisions]) => {
        return {
          linkEntity: linkEntityRevisions,
          rightEntity: getRightEntityForLinkEntity(
            subgraph as Subgraph<true>,
            linkEntityId,
            searchInterval,
          ),
        };
      },
    ) as LinkAndRightEntities; // @todo consider fixing generics in functions called within
  } else {
    return getOutgoingLinksForEntity(subgraph as Subgraph<false>, entityId).map(
      (linkEntity) => {
        const rightEntityRevisions = getRightEntityForLinkEntity(
          subgraph as Subgraph<false>,
          linkEntity.metadata.recordId.entityId,
        );

        if (rightEntityRevisions.length !== 1) {
          throw new Error(
            `Querying a Subgraph without support for temporal versioning but there wasn't a unique revision for the right entity with ID: ${linkEntity.metadata.recordId.entityId}`,
          );
        }

        return {
          linkEntity,
          rightEntity: rightEntityRevisions[0],
        };
      },
    ) as LinkAndRightEntities; // @todo consider fixing generics in functions called within
  }
};
