"use client";

import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import {
  Node,
  Edge,
  Position,
  MarkerType,
  Handle,
  NodeTypes,
  NodeProps,
} from "reactflow";
import type { FlowVisualizerProps } from "./components/FlowVisualizer";

const FlowVisualizer = dynamic<FlowVisualizerProps>(
  () => import("./components/FlowVisualizer"),
  { ssr: false }
);

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

export default function Home() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const CustomNode: React.FC<NodeProps> = ({ data }) => (
    <div
      style={{
        border: "1px solid #777",
        padding: "10px",
        borderRadius: "3px",
        background: "white",
        minWidth: "150px",
        textAlign: "center",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <div>{data.label}</div>
    </div>
  );

  const nodeTypes: NodeTypes = {
    custom: CustomNode,
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
      type: "smoothstep",
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
      type: "smoothstep",
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
      type: "smoothstep",
      animated: conn.type === "conditional",
      style: { strokeDasharray: conn.type === "conditional" ? "5,5" : "none" },
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    })),
  ];

  return (
    <Box h="100vh" w="100vw">
      <Heading as="h1" size="xl" textAlign="center" py={4}>
        {config.name}
      </Heading>
      <Box h="calc(100vh - 68px)">
        {isClient && (
          <FlowVisualizer
            initialNodes={nodes}
            initialEdges={edges}
            nodeTypes={nodeTypes}
          />
        )}
      </Box>
    </Box>
  );
}
