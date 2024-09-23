"use client";

import { Box } from "@chakra-ui/react";
import { ReactFlowProvider } from "reactflow";
import FlowVisualizer from "./FlowVisualizer";
import { nodeTypes } from "./nodes";
import { GraphsOut } from "@/client";

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
