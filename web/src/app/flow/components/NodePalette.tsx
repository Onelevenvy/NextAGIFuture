import React from "react";
import { Box, VStack, Text, IconButton } from "@chakra-ui/react";
import { nodeConfig, NodeType } from "./nodes/nodeConfig";

const NodePalette: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Box width="200px" padding={4} borderRight="1px solid #ccc">
      <VStack spacing={4} align="stretch">
        {(Object.entries(nodeConfig) as [NodeType, typeof nodeConfig[NodeType]][]).map(
          ([nodeType, { display, icon: Icon, colorScheme }]) => (
            <Box
              key={nodeType}
              border="1px solid #ddd"
              borderRadius="md"
              padding={2}
              textAlign="left"
              cursor="move"
              draggable
              onDragStart={(event) => onDragStart(event, nodeType)}
            >
              <IconButton
                aria-label={display}
                icon={<Icon />}
                colorScheme={colorScheme}
                size="xs"
              />
              <Text display="inline" ml={2}>
                {display}
              </Text>
            </Box>
          )
        )}
      </VStack>
    </Box>
  );
};

export default NodePalette;