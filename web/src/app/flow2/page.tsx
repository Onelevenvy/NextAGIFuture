"use client";

import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import {
  Node,
  Edge,
  MarkerType,

} from "reactflow";
import { ReactFlowProvider } from "reactflow";
import FlowVisualizer from "./components/FlowVisualizer";
import { nodeTypes } from "./components/CustomNodes";

interface ConfigNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    model?: string;
    tools?: string[];
    label?: string;
  };
}

interface ConfigEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  type: "default" | "conditional";
}

interface Config {
  name: string;
  nodes: ConfigNode[];
  edges: ConfigEdge[];
  metadata: {
    entry_point: string;
    start_connections: Array<{
      target: string;
      type: "default" | "conditional";
    }>;
    end_connections: Array<{
      source: string;
      type: "default" | "conditional";
    }>;
  };
}

const config: Config = {
  name: "Flow Visualization",
  nodes: [
    {
      id: "chatbot",
      type: "custom",
      position: { x: 250, y: 100 },
      data: {
        model: "glm-4",
        label: "Chatbot (LLM)",
      },
    },
    {
      id: "tools",
      type: "custom",
      position: { x: 250, y: 300 },
      data: {
        tools: ["tavilysearch", "calculator"],
        label: "Tools",
      },
    },
  ],
  edges: [
    {
      id: "chatbot-to-tools",
      source: "chatbot",
      target: "tools",
      sourceHandle: "bottom",
      targetHandle: "top",
      type: "conditional",
    },
    {
      id: "tools-to-chatbot",
      source: "tools",
      target: "chatbot",
      sourceHandle: "bottom",
      targetHandle: "bottom",
      type: "default",
    },
  ],
  metadata: {
    entry_point: "chatbot",
    start_connections: [{ target: "chatbot", type: "default" }],
    end_connections: [{ source: "chatbot", type: "conditional" }],
  },
};

const startNode: Node = {
  id: "START",
  type: "custom",
  position: { x: 250, y: 0 },
  data: { label: "Start" },
};

const endNode: Node = {
  id: "END",
  type: "custom",
  position: { x: 250, y: 400 },
  data: { label: "End" },
};

const nodes: Node[] = [
  startNode,
  ...config.nodes.map((node) => ({
    id: node.id,
    position: node.position,
    data: { label: node.data.label || node.id },
    type: "custom",
  })),
  endNode,
];

const edges: Edge[] = [
  ...config.metadata.start_connections.map((conn) => ({
    id: `start-to-${conn.target}`,
    source: "START",
    target: conn.target,
    sourceHandle: "bottom",
    targetHandle: "top",
    type: "default", // 或者使用 "bezier"
    animated: conn.type === "conditional",
    style: { strokeDasharray: conn.type === "conditional" ? "5,5" : "none" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  })),
  ...config.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: "default", // 或者使用 "bezier"
    animated: edge.type === "conditional",
    style: { strokeDasharray: edge.type === "conditional" ? "5,5" : "none" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  })),
  ...config.metadata.end_connections.map((conn) => ({
    id: `${conn.source}-to-end`,
    source: conn.source,
    target: "END",
    sourceHandle: "bottom",
    targetHandle: "top",
    type: "default", // 或者使用 "bezier"
    animated: conn.type === "conditional",
    style: { strokeDasharray: conn.type === "conditional" ? "5,5" : "none" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  })),
];

export default function Home() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Box h="100vh" w="100vw">
      <Heading as="h1" size="xl" textAlign="center" py={4}>
        Flow Visualization
      </Heading>
      <Box h="calc(100vh - 68px)">
        {isClient && (
          <ReactFlowProvider>
            <FlowVisualizer
              initialNodes={[]}
              initialEdges={[]}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{ type: "default" }}
            />
          </ReactFlowProvider>
        )}
      </Box>
    </Box>
  );
}
