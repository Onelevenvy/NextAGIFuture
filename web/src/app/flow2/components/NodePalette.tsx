import React from "react";
import { Box, VStack, Text } from "@chakra-ui/react";

const NodePalette: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Box width="200px" padding={4} borderRight="1px solid #ccc">
      <VStack spacing={4} align="stretch">
        {["start", "end", "llm", "tool"].map((nodeType) => (
          <Box
            key={nodeType}
            border="1px solid #ddd"
            borderRadius="md"
            padding={2}
            textAlign="center"
            cursor="move"
            draggable
            onDragStart={(event) => onDragStart(event, nodeType)}
          >
            <Text>{nodeType.toUpperCase()}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default NodePalette;
