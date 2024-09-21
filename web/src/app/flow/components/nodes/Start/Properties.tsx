import React from "react";
import { Box, VStack, Text, Input } from "@chakra-ui/react";

interface StartNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const StartNodeProperties: React.FC<StartNodePropertiesProps> = ({
  node,
  onNodeDataChange,
}) => {
  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">Initial Input:</Text>
        <Input
          value={node.data.initialInput}
          onChange={(e) =>
            onNodeDataChange(node.id, "initialInput", e.target.value)
          }
          placeholder="Enter initial input"
        />
      </Box>
    </VStack>
  );
};

export default StartNodeProperties;
