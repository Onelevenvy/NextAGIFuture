import { Box } from "@chakra-ui/react";
import type React from "react";
import NodeMenu from "./NodeMenu";
import { type NodeType } from "../Nodes/nodeConfig";

const NodePalette: React.FC = () => {
  const handleNodeSelect = (nodeType: NodeType | string, isPlugin: boolean) => {
    // 这里可以添加选择节点时的逻辑，如果需要的话
    console.log(`Selected node type: ${nodeType}, isPlugin: ${isPlugin}`);
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, isPlugin: boolean) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ tool: nodeType, type: isPlugin ? "plugin" : nodeType })
    );
    event.dataTransfer.effectAllowed = "move";
    console.log(`Dragging type: ${nodeType}, isPlugin: ${isPlugin}`);
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
        onNodeSelect={handleNodeSelect} 
        onDragStart={onDragStart}
        showStartEnd={false} 
      />
    </Box>
  );
};

export default NodePalette;
