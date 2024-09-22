"use client";

import { Box } from "@chakra-ui/react";
import { ReactFlowProvider } from "reactflow";
import FlowVisualizer from "../../../components/WorkFlow/FlowVisualizer";
import { nodeTypes } from "../../../components/WorkFlow/nodes";
import config from "./graphConfig";

export default function ShowFlow() {
  return (
    <Box h="full" w="full">
      <ReactFlowProvider>
        <FlowVisualizer
          initialNodes={config.nodes}
          initialEdges={config.edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{ type: "default" }}
        />
      </ReactFlowProvider>
    </Box>
  );
}
