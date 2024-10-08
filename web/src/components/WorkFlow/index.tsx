"use client";

import type { GraphsOut } from "@/client";
import { Box } from "@chakra-ui/react";
import { ReactFlowProvider } from "reactflow";
import FlowVisualizer from "./FlowVis/FlowVisualizer";
import { nodeTypes } from "./nodes";

export default function TqxWorkflow({
  graphData,
  teamId,
}: {
  graphData: GraphsOut;
  teamId: number;
}) {
  return (
    <Box h="full" w="full">
      <ReactFlowProvider>
        <FlowVisualizer
          teamId={teamId}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{ type: "default" }}
          graphData={graphData}
        />
      </ReactFlowProvider>
    </Box>
  );
}
