import { Box } from "@chakra-ui/react";
import type React from "react";
import NodeMenu from "./NodeMenu";
import { type NodeType } from "../Nodes/nodeConfig";

const NodePalette: React.FC = () => {


  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    isPlugin: boolean
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ tool: nodeType, type: isPlugin ? "plugin" : nodeType })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Box
      width="200px"
      bg={"#fcfcfd"}
      borderTopLeftRadius={"lg"}
      maxH={"full"}
      h="full"
    >
      <NodeMenu
        onDragStart={onDragStart}
        showStartEnd={false}
      />
    </Box>
  );
};

export default NodePalette;
