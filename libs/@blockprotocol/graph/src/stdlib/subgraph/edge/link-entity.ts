import {
  Entity,
  EntityId,
  isHasLeftEntityEdge,
  isHasRightEntityEdge,
  isIncomingLinkEdge,
  isOutgoingLinkEdge,
  LinkEntityAndRightEntity,
  OutgoingLinkEdge,
  OutwardEdge,
  Subgraph,
  Timestamp,
} from "../../../index.js";
import { mustBeDefined } from "../../must-be-defined.js";
import { getEntity } from "../element/entity.js";

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

/** @todo - Update these methods to take intervals instead of timestamps */

/**
 * For a given moment in time, get all outgoing link entities from a given entity.
 *
 * @param subgraph
 * @param {EntityId} entityId - The ID of the source entity to search for outgoing links from
 * @param {Date | Timestamp} [timestamp] - An optional `Date` or an ISO-formatted datetime string of the moment to search
 *    for, if not supplied it defaults to the current time
 */
export const getOutgoingLinksForEntity = <TemporalSupport extends boolean>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  timestamp?: Date | Timestamp,
): Entity<TemporalSupport>[] => {
  const timestampString = convertTimeToStringWithDefault(timestamp);

  const entityEdges = subgraph.edges[entityId];

  if (!entityEdges) {
    return [];
  }

  const uniqueEntitiesFilter = getUniqueEntitiesFilter();

  return (
    Object.entries(entityEdges)
      // Only look at outgoing edges that were created before or at the timestamp
      .filter(
        ([edgeTimestamp, _outwardEdges]) => edgeTimestamp <= timestampString,
      )
      // Extract the link `EntityRecordId`s from the endpoints of the link edges
      .flatMap(([_edgeTimestamp, outwardEdges]) => {
        return (outwardEdges as OutwardEdge[])
          .filter(isOutgoingLinkEdge)
          .map((edge) => {
            return edge.rightEndpoint;
          });
      })
      .map(({ baseId: linkEntityId, timestamp: _firstRevisionTimestamp }) => {
        return mustBeDefined(
          getEntity(
            subgraph,
            linkEntityId,
            // Find the revision of the link at the given moment (not at `_firstRevisionTimestamp`, the start of its history)
            timestampString,
          ),
        );
      })
      .filter(uniqueEntitiesFilter)
  );
};

/**
 * For a given moment in time, get all incoming link entities from a given entity.
 *
 * @param subgraph
 * @param {EntityId} entityId - The ID of the source entity to search for incoming links to
 * @param {Date | Timestamp} [timestamp] - An optional `Date` or an ISO-formatted datetime string of the moment to search
 *    for, if not supplied it defaults to the current time
 */
export const getIncomingLinksForEntity = <TemporalSupport extends boolean>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  timestamp?: Date | Timestamp,
): Entity<TemporalSupport>[] => {
  const timestampString = convertTimeToStringWithDefault(timestamp);

  const entityEdges = subgraph.edges[entityId];

  if (!entityEdges) {
    return [];
  }

  const uniqueEntitiesFilter = getUniqueEntitiesFilter();

  return (
    Object.entries(entityEdges)
      // Only look at edges that were created before or at the timestamp
      .filter(
        ([edgeTimestamp, _outwardEdges]) => edgeTimestamp <= timestampString,
      )
      // Extract the link `EntityRecordId`s from the endpoints of the link edges
      .flatMap(([_edgeTimestamp, outwardEdges]) => {
        return (outwardEdges as OutgoingLinkEdge[])
          .filter(isIncomingLinkEdge)
          .map((edge) => {
            return edge.rightEndpoint;
          });
      })
      .map(({ baseId: linkEntityId, timestamp: _firstRevisionTimestamp }) => {
        return mustBeDefined(
          getEntity(
            subgraph,
            linkEntityId,
            // Find the revision of the link at the given moment (not at `_firstRevisionTimestamp`, the start of its history)
            timestampString,
          ),
        );
      })
      .filter(uniqueEntitiesFilter)
  );
};

/**
 * For a given moment in time, get the "left entity" (by default this is the "source") of a given link entity.
 *
 * @param subgraph
 * @param {EntityId} entityId - The ID of the link entity
 * @param {Date | Timestamp} [timestamp] - An optional `Date` or an ISO-formatted datetime string of the moment to search
 *    for, if not supplied it defaults to the current time
 */
export const getLeftEntityForLinkEntity = <TemporalSupport extends boolean>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  timestamp?: Date | Timestamp,
): Entity<TemporalSupport> => {
  const linkEntityEdges = mustBeDefined(
    subgraph.edges[entityId],
    "link entities must have left endpoints and therefore must have edges",
  );

  const endpointEntityId = mustBeDefined(
    Object.values(linkEntityEdges).flat().find(isHasLeftEntityEdge)
      ?.rightEndpoint.baseId,
    "link entities must have left endpoints",
  );

  return mustBeDefined(
    getEntity(subgraph, endpointEntityId, timestamp),
    "all edge endpoints should have a corresponding vertex",
  );
};

/**
 * For a given moment in time, get the "right entity" (by default this is the "target") of a given link entity.
 *
 * @param subgraph
 * @param {EntityId} entityId - The ID of the link entity
 * @param {Date | Timestamp} [timestamp] - An optional `Date` or an ISO-formatted datetime string of the moment to search
 *    for, if not supplied it defaults to the current time
 */
export const getRightEntityForLinkEntity = <TemporalSupport extends boolean>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  timestamp?: Date | Timestamp,
): Entity<TemporalSupport> => {
  const linkEntityEdges = mustBeDefined(
    subgraph.edges[entityId],
    "link entities must have right endpoints and therefore must have edges",
  );

  const endpointEntityId = mustBeDefined(
    Object.values(linkEntityEdges).flat().find(isHasRightEntityEdge)
      ?.rightEndpoint.baseId,
    "link entities must have right endpoints",
  );

  return mustBeDefined(
    getEntity(subgraph, endpointEntityId, timestamp),
    "all edge endpoints should have a corresponding vertex",
  );
};

/**
 * For a given moment in time, get all outgoing link entities, and their "target" entities (by default this is the
 * "right entity"), from a given entity.
 *
 * @param subgraph
 * @param {EntityId} entityId - The ID of the source entity to search for outgoing links from
 * @param {Date | Timestamp} [timestamp] - An optional `Date` or an ISO-formatted datetime string of the moment to search
 *    for, if not supplied it defaults to the current time
 */
export const getOutgoingLinkAndTargetEntities = <
  TemporalSupport extends boolean,
  LinkAndRightEntities extends LinkEntityAndRightEntity<TemporalSupport>[] = LinkEntityAndRightEntity<TemporalSupport>[],
>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  timestamp?: Date | Timestamp,
): LinkAndRightEntities => {
  return getOutgoingLinksForEntity(subgraph, entityId, timestamp).map(
    (linkEntity) => {
      return {
        linkEntity,
        rightEntity: getRightEntityForLinkEntity(
          subgraph,
          linkEntity.metadata.recordId.entityId,
          timestamp,
        ),
      };
    },
  ) as LinkAndRightEntities; // @todo consider fixing generics in functions called within
};
