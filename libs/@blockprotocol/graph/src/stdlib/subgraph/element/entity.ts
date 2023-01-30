import { typedEntries } from "../../../codegen/shared.js";
import {
  Entity,
  EntityId,
  EntityRevisionId,
  isEntityVertex,
  NonNullTimeInterval,
  Subgraph,
  Timestamp,
} from "../../../index.js";
import {
  intervalContainsInterval,
  intervalContainsTimestamp,
} from "../../interval.js";
import { mustBeDefined } from "../../must-be-defined.js";

/**
 * Returns all `Entity`s within the vertices of the subgraph, optionally filtering to only get their latest revisions.
 *
 * @param subgraph
 * @param latest - whether or not to only return the latest revisions of each entity
 */
export const getEntities = <TemporalSupport extends boolean>(
  subgraph: Subgraph<TemporalSupport>,
  latest: boolean = false,
): Entity<TemporalSupport>[] => {
  return Object.values(
    Object.values(subgraph.vertices).flatMap((versionObject) => {
      const entityRevisionVertices = latest
        ? Object.keys(versionObject)
            .sort()
            .slice(-1)
            .map((latestVersion) => versionObject[latestVersion]!)
            .filter(isEntityVertex)
        : Object.values(versionObject).filter(isEntityVertex);

      return entityRevisionVertices.map((vertex) => vertex.inner);
    }),
  );
};

/**
 * Gets an {@link Entity} by its {@link EntityId} from within the vertices of the subgraph. If
 * `targetRevisionInformation` is not passed, then the latest version of the {@link Entity} will be returned.
 *
 * Returns `undefined` if the entity couldn't be found.
 *
 * @param subgraph
 * @param {EntityId} entityId - The {@link EntityId} of the entity to get.
 * @param {EntityRevisionId|Timestamp|Date} [targetRevisionInformation] - Optional information needed to uniquely
 *     identify a revision of an entity either by an explicit {@link EntityRevisionId}, `Date`, or by a given
 *     {@link Timestamp} where the entity whose lifespan overlaps the given timestamp will be returned.
 * @throws if the vertex isn't an {@link EntityVertex}
 */
export const getEntityRevision = <TemporalSupport extends boolean>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  targetRevisionInformation?: TemporalSupport extends true
    ? EntityRevisionId | Timestamp | Date
    : never,
): Entity<TemporalSupport> | undefined => {
  const entityRevisions = subgraph.vertices[entityId];

  if (entityRevisions === undefined) {
    return undefined;
  }

  const revisionVersions = Object.keys(entityRevisions).sort();

  // Short circuit for efficiency, just take the latest
  if (targetRevisionInformation === undefined) {
    return revisionVersions
      .slice(-1)
      .map((latestVersion) => entityRevisions[latestVersion]!.inner)
      .pop();
  } else {
    const targetTime =
      typeof targetRevisionInformation === "string"
        ? targetRevisionInformation
        : targetRevisionInformation.toISOString();

    return revisionVersions
      .filter((revisionTimestamp) => revisionTimestamp < targetTime)
      .map((revisionTimestamp) => {
        const vertex = mustBeDefined(entityRevisions[revisionTimestamp]);

        if (!isEntityVertex(vertex)) {
          throw new Error(
            `Found non-entity vertex associated with EntityId: ${entityId}`,
          );
        }
        return vertex.inner;
      })
      .find((entity) => {
        return intervalContainsTimestamp(
          entity.metadata.temporalVersioning[
            subgraph.temporalAxes.resolved.variable.axis
          ],
          targetTime,
        );
      });
  }
};

/**
 * Returns all {@link Entity} revisions within the vertices of the subgraph that match a given {@link EntityId}.
 *
 * When querying a subgraph with support for temporal versioning, it optionally constrains the search to a given
 * {@link NonNullTimeInterval}.
 *
 * @param subgraph
 * @param entityId
 * @param interval
 */
export const getEntityRevisionsByEntityId = <TemporalSupport extends boolean>(
  subgraph: Subgraph<TemporalSupport>,
  entityId: EntityId,
  interval?: TemporalSupport extends true ? NonNullTimeInterval : never,
): Entity<TemporalSupport>[] => {
  const versionObject = subgraph.vertices[entityId];

  if (!versionObject) {
    return [];
  }

  if (interval !== undefined) {
    return typedEntries(versionObject)
      .filter(([startTime, _entityVertex]) =>
        intervalContainsTimestamp(interval, startTime),
      )
      .map(([_startTime, entityVertex]) => entityVertex)
      .filter(isEntityVertex)
      .map((entityVertex) => entityVertex.inner)
      .filter((entity) =>
        intervalContainsInterval(
          interval,
          entity.metadata.temporalVersioning[
            subgraph.temporalAxes.resolved.variable.axis
          ],
        ),
      );
  } else {
    const entityVertices = Object.values(versionObject);
    return entityVertices.filter(isEntityVertex).map((vertex) => {
      return vertex.inner;
    });
  }
};
