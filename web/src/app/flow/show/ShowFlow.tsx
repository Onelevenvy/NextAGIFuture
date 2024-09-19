"use client";

import React, { useCallback } from "react";
import { Box } from "@chakra-ui/react";
import { ReactFlowProvider } from "reactflow";
import FlowVisualizer from "../components/FlowVisualizer";
import { nodeTypes } from "../components/nodes";
import config from "./graphConfig";

export default function ShowFlow() {
  const onNodeDataChange = useCallback(
    (nodeId: string, key: string, value: any) => {
      // 在这里可以添加更新节点数据的逻辑
      console.log(`Node ${nodeId} changed: ${key} = ${value}`);
    },
    []
  );

  const initialNodes = config.nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onChange: (key: string, value: any) =>
        onNodeDataChange(node.id, key, value),
    },
  }));

  return (
    <Box h="100vh" w="100vw">
      <Box h="calc(100vh - 68px)">
        <ReactFlowProvider>
          <FlowVisualizer
            initialNodes={initialNodes}
            initialEdges={config.edges}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{ type: "default" }}
          />
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}
