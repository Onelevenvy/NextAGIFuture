"use client";

import { Box } from "@chakra-ui/react";
import { ReactFlowProvider } from "reactflow";
import FlowVisualizer from "./FlowVisualizer";
import { nodeTypes } from "./nodes";

export default function TqxWorkflow({ buildConfig }: { buildConfig: any }) {
  return (
    <Box h="full" w="full">
      <ReactFlowProvider>
        <FlowVisualizer
          initialNodes={buildConfig?.nodes || []}
          initialEdges={buildConfig?.edges || []}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{ type: "default" }}
        />
      </ReactFlowProvider>
    </Box>
  );
}
