import { Vertex } from "../../../types/subgraph/vertices.js";

type BaseIdToRevisions<
  TemporalSupport extends boolean,
  GraphElementType extends Vertex<TemporalSupport>["inner"],
> = Record<
  /*
   * @todo - we _should_ be able to use `Extract<GraphElementForIdentifier<TemporalSupport, VertexId<any, any>>`
   *   here to actually get a strong type (like `EntityId` or `BaseUri`). TypeScript seems to break on using it with a
   *   generic though. So for now we write `string` because all of the baseId's of `VertexId` are string aliases anyway.
   */
  string,
  GraphElementType[]
>;

/**
 * @todo - doc
 * @param elements
 */
export const mapElementsIntoRevisions = <
  TemporalSupport extends boolean,
  GraphElementType extends Vertex<TemporalSupport>["inner"],
>(
  elements: GraphElementType[],
): BaseIdToRevisions<TemporalSupport, GraphElementType> => {
  return elements.reduce((revisionMap, element) => {
    const baseId =
      "entityId" in element.metadata.recordId
        ? element.metadata.recordId.entityId
        : element.metadata.recordId.baseUri;

    if (revisionMap[baseId] !== undefined) {
      revisionMap[baseId]!.push(element);
    } else {
      // eslint-disable-next-line no-param-reassign
      revisionMap[baseId] = [element];
    }

    return revisionMap;
  }, {} as BaseIdToRevisions<TemporalSupport, GraphElementType>);
};