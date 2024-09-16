import React from "react";
import { Box, VStack, Text, Textarea } from "@chakra-ui/react";

interface EndNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const EndNodeProperties: React.FC<EndNodePropertiesProps> = ({ node, onNodeDataChange }) => {
  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">Final Output:</Text>
        <Textarea
          value={node.data.finalOutput}
          onChange={(e) => onNodeDataChange(node.id, 'finalOutput', e.target.value)}
          placeholder="Final output will be displayed here"
          isReadOnly
        />
      </Box>
    </VStack>
  );
};

export default EndNodeProperties;