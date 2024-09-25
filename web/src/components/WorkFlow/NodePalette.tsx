import { Box, IconButton, Text, VStack } from "@chakra-ui/react";
import type React from "react";
import { type NodeType, nodeConfig } from "./nodes/nodeConfig";

const NodePalette: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Box
      width="150px"
      padding={4}
      bg={"#fcfcfd"}
      borderTopLeftRadius={"lg"}
      maxH={"full"}
      h="full"
    >
      <VStack spacing={4} align="stretch">
        {(
          Object.entries(nodeConfig) as [
            NodeType,
            (typeof nodeConfig)[NodeType],
          ][]
        ).map(([nodeType, { display, icon: Icon, colorScheme }]) => (
          <Box
            key={nodeType}
            border="1px solid #ddd"
            borderRadius="md"
            padding={2}
            textAlign="left"
            cursor="move"
            draggable
            maxH={"full"}
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
        ))}
      </VStack>
    </Box>
  );
};

export default NodePalette;
