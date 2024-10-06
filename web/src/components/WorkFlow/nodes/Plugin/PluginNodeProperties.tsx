import { Box, Input, Text, VStack } from "@chakra-ui/react";
import type React from "react";

interface PluginNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const PluginNodeProperties: React.FC<PluginNodePropertiesProps> = ({
  node,
  onNodeDataChange,
}) => {
  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">Tool Name:</Text>
        <Input
          value={node.data.toolName}
          onChange={(e) =>
            onNodeDataChange(node.id, "toolName", e.target.value)
          }
          placeholder="Enter tool name"
        />
      </Box>
      <Box>
        <Text fontWeight="bold">Arguments:</Text>
        <Input
          value={JSON.stringify(node.data.args)}
          onChange={(e) =>
            onNodeDataChange(node.id, "args", JSON.parse(e.target.value))
          }
          placeholder="Enter arguments as JSON"
        />
      </Box>
    </VStack>
  );
};

export default PluginNodeProperties;