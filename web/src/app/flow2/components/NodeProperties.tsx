import React from "react";
import { Box, VStack, Text, Heading } from "@chakra-ui/react";
import { Node } from "reactflow";

interface NodePropertiesProps {
  node: Node | null;
}

const NodeProperties: React.FC<NodePropertiesProps> = ({ node }) => {
  if (!node) {
    return (
      <Box width="250px" padding={4} borderLeft="1px solid #ccc">
        <Text>Select a node to view its properties</Text>
      </Box>
    );
  }

  return (
    <Box width="250px" padding={4} borderLeft="1px solid #ccc">
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Node Properties</Heading>
        <Box>
          <Text fontWeight="bold">ID:</Text>
          <Text>{node.id}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold">Type:</Text>
          <Text>{node.type}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold">Label:</Text>
          <Text>{node.data.label}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold">Position:</Text>
          <Text>
            X: {node.position.x.toFixed(2)}, Y: {node.position.y.toFixed(2)}
          </Text>
        </Box>
        {/* Add more properties as needed */}
      </VStack>
    </Box>
  );
};

export default NodeProperties;