import React from "react";
import { Box, VStack, Text, Select } from "@chakra-ui/react";
import BaseProperties from "../Base/Properties";

interface ToolNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const ToolNodeProperties: React.FC<ToolNodePropertiesProps> = ({ node, onNodeDataChange }) => {
  return (
    <BaseProperties>
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">Tool:</Text>
        <Select 
          value={node.data.tool} 
          onChange={(e) => onNodeDataChange(node.id, 'tool', e.target.value)}
        >
          <option value="calculator">Calculator</option>
          <option value="websearch">Web Search</option>
        </Select>
      </Box>
    </VStack>
    </BaseProperties>
  );
};

export default ToolNodeProperties;