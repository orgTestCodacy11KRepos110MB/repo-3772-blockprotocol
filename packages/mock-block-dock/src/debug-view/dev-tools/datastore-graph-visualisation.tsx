import { Entity, EntityEditionId, Subgraph } from "@blockprotocol/graph";
import {
  getEntities,
  getEntityTypeById,
  getPropertyTypesByBaseUri,
} from "@blockprotocol/graph/dist/stdlib";
import { Box } from "@mui/material";
import { GraphChart, GraphSeriesOption } from "echarts/charts";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useEffect, useRef, useState } from "react";

import { useMockBlockDockContext } from "../../mock-block-dock-context";
import { partitionArrayByCondition } from "../../util";

/** @todo - rename this file to visualization */

const parseLabelFromEntity = (entityToLabel: Entity, subgraph: Subgraph) => {
  const getFallbackLabel = () => {
    // fallback to the entity type and a few characters of the entityUuid
    const entityId = entityToLabel.metadata.editionId.baseId;

    const entityType = getEntityTypeById(
      subgraph,
      entityToLabel.metadata.entityTypeId,
    );
    const entityTypeName = entityType?.schema.title ?? "Entity";

    return `${entityTypeName}-${entityId.slice(0, 5)}`;
  };

  const getFallbackIfNotString = (val: any) => {
    if (!val || typeof val !== "string") {
      return getFallbackLabel();
    }

    return val;
  };

  // fallback to some likely display name properties
  const options = [
    "name",
    "preferred name",
    "display name",
    "title",
    "shortname",
  ];

  const propertyTypes: { title?: string; propertyTypeBaseUri: string }[] =
    Object.keys(entityToLabel.properties).map((propertyTypeBaseUri) => {
      /** @todo - pick the latest version, or the version in the entity type, rather than first element? */
      const [propertyType] = getPropertyTypesByBaseUri(
        subgraph,
        propertyTypeBaseUri,
      );

      return propertyType
        ? {
            title: propertyType.schema.title.toLowerCase(),
            propertyTypeBaseUri,
          }
        : {
            title: undefined,
            propertyTypeBaseUri,
          };
    });

  for (const option of options) {
    const found = propertyTypes.find(({ title }) => title === option);

    if (found) {
      return getFallbackIfNotString(
        entityToLabel.properties[found.propertyTypeBaseUri],
      );
    }
  }

  return getFallbackLabel();
};

type SeriesOption = GraphSeriesOption;

// Combine an Option type with only required components and charts via ComposeOption
type EChartOption = echarts.ComposeOption<SeriesOption>;

const createDefaultEChartOptions = (params?: {
  initialNodes?: GraphSeriesOption["nodes"];
  initialEdges?: GraphSeriesOption["edges"];
}): EChartOption => ({
  color: ["#6F59EB"],
  series: [
    {
      type: "graph",
      layout: "force",
      draggable: true,
      /** @todo: find way to get this working, currently interferes with `draggable` */
      // roam: true,
      force: {
        repulsion: 125,
        edgeLength: 150,
      },
      label: {
        fontSize: 16,
      },
      edgeLabel: {
        fontSize: 10,
      },
      nodes: params?.initialNodes,
      edges: params?.initialEdges,
      // The size of the Node
      symbolSize: 25,
      edgeSymbol: ["none", "arrow"],
    },
  ],
});

// Register the required components
echarts.use([GraphChart, SVGRenderer]);

type EChartNode = {
  id: string;
  name: string;
  fixed?: boolean;
  x?: number;
  y?: number;
  label: {
    show?: boolean;
  };
};

const mapEntityToEChartNode = (
  entity: Entity,
  subgraph: Subgraph,
): EChartNode => ({
  id: JSON.stringify(entity.metadata.editionId),
  name: parseLabelFromEntity(entity, subgraph),
  label: { show: false },
});

type EChartEdge = {
  id: string;
  source: string;
  target: string;
  label: {
    show?: boolean;
    formatter?: string;
  };
};

const mapLinkToEChartEdge = ({
  linkId,
  sourceEntityId,
  destinationEntityId,
  path,
}: Link): EChartEdge => ({
  id: linkId,
  source: sourceEntityId,
  target: destinationEntityId,
  label: { show: false, formatter: path.replace("$.", "") },
});

const getEntitiesAsNodes = (subgraph: Subgraph) => {
  const allEntities = getEntities(subgraph);

  const [linkEntities, nonLinkEntities] = partitionArrayByCondition(
    allEntities,
    (entity) =>
      entity.linkData?.leftEntityId !== undefined &&
      entity.linkData?.rightEntityId !== undefined,
  );

  return [
    ...nonLinkEntities.map((entity) => mapEntityToEChartNode(entity, subgraph)),
    /** @todo - Render link entities differently */
    ...linkEntities.map((linkEntity) =>
      mapEntityToEChartNode(linkEntity, subgraph),
    ),
  ]
}

export const DatastoreGraphVisualisation = () => {
  const { graph } = useMockBlockDockContext();

  const eChartWrapperRef = useRef<HTMLDivElement>(null);

  const [chart, setChart] = useState<echarts.ECharts>();

  useEffect(() => {
    const resizeChart = () => {
      if (chart) {
        chart.resize();
      }
    };

    window.addEventListener("resize", resizeChart);
    return () => {
      window.removeEventListener("resize", resizeChart);
    };
  }, [chart]);

  /** @todo - Render ontology elements */
  const [eChartNodes, setEChartNodes] = useState<EChartNode[]>(getEntitiesAsNodes(graph));

  const [eChartNodes, setEChartNodes] = useState<EChartNode[]>([
    ...nonLinkEntities.map((entity) => mapEntityToEChartNode(entity, graph)),
    /** @todo - Render link entities differently */
    ...linkEntities.map((linkEntity) =>
      mapEntityToEChartNode(linkEntity, graph),
    ),
  ]);

  const [eChartEdges, setEChartEdges] = useState<EChartEdge[]>(
    links.map(mapLinkToEChartEdge),
  );

  useEffect(() => {
    setEChartNodes(getEntitiesAsNodes(graph));
  }, [graph]);

  useEffect(() => {
    setEChartEdges(links.map(mapLinkToEChartEdge));
  }, [links]);

  const [selectedEntityId, setSelectedEntityId] = useState<string>();

  /** @todo: un-comment if we want to display something about the currently selected entity */
  // const selectedEntity = useMemo(
  //   () => entities.find(({ entityId }) => entityId === selectedEntityId),
  //   [entities, selectedEntityId],
  // );

  useEffect(() => {
    if (chart) {
      chart.setOption<EChartOption>({ series: [{ nodes: eChartNodes }] });
    }
  }, [chart, eChartNodes]);

  useEffect(() => {
    if (chart) {
      chart.setOption<EChartOption>({ series: [{ edges: eChartEdges }] });
    }
  }, [chart, eChartEdges]);

  useEffect(() => {
    if (chart && selectedEntityId) {
      const outgoingLinks = links.filter(
        ({ sourceEntityId }) => sourceEntityId === selectedEntityId,
      );

      const outgoingLinkIds = outgoingLinks.map(({ linkId }) => linkId);

      const neighbourIds = outgoingLinks.map(
        ({ destinationEntityId }) => destinationEntityId,
      );

      const nodesWithVisibleLabelsIds = [selectedEntityId, ...neighbourIds];

      // Display the label of the selected node and neighbouring nodes
      setEChartNodes((prev) =>
        prev.map((node) => ({
          ...node,
          label: {
            ...node.label,
            show: nodesWithVisibleLabelsIds.includes(node.id),
          },
        })),
      );

      // Display the label of the outgoing links of the selected node
      setEChartEdges((prev) =>
        prev.map((edge) => ({
          ...edge,
          label: { ...edge.label, show: outgoingLinkIds.includes(edge.id) },
        })),
      );
    }
  }, [chart, selectedEntityId, links, entities]);

  useEffect(() => {
    if (!chart && eChartWrapperRef.current) {
      const initialisedChart = echarts.init(eChartWrapperRef.current);

      initialisedChart.on("click", { dataType: "node" }, ({ data: node }) =>
        setSelectedEntityId((node as EChartNode).id),
      );

      const initialOptions = createDefaultEChartOptions();

      initialisedChart.setOption(initialOptions, { notMerge: true });

      setChart(initialisedChart);
    }
  }, [chart, eChartWrapperRef]);

  return (
    <Box
      sx={{
        width: "100%",
        height: 500,
      }}
      ref={eChartWrapperRef}
    />
  );
};
