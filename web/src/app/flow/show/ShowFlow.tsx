"use client";

import { Box } from "@chakra-ui/react";
import { ReactFlowProvider } from "reactflow";
import FlowVisualizer from "../components/FlowVisualizer";
import { nodeTypes } from "../components/nodes";
import config from "./graphConfig";

export default function ShowFlow() {
  return (
    <Box h="100vh" w="100vw">
      <Box h="calc(100vh - 68px)">
        <ReactFlowProvider>
          <FlowVisualizer
            initialNodes={config.nodes}
            initialEdges={config.edges}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{ type: "default" }}
          />
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}
