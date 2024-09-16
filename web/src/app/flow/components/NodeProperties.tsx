import React from "react";
import { Box, VStack, Text, Heading, Select, Input } from "@chakra-ui/react";
import { Node } from "reactflow";

interface NodePropertiesProps {
  node: Node | null;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const NodeProperties: React.FC<NodePropertiesProps> = ({ node, onNodeDataChange }) => {
  if (!node) {
    return (
      <Box width="250px" padding={4} borderLeft="1px solid #ccc">
        <Text>Select a node to view its properties</Text>
      </Box>
    );
  }

  const renderProperties = () => {
    switch (node.type) {
      case "llm":
        return (
          <>
            <Box>
              <Text fontWeight="bold">Model:</Text>
              <Select 
                value={node.data.model} 
                onChange={(e) => onNodeDataChange(node.id, 'model', e.target.value)}
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
              </Select>
            </Box>
            <Box>
              <Text fontWeight="bold">Temperature:</Text>
              <Input
                type="number"
                value={node.data.temperature}
                onChange={(e) => onNodeDataChange(node.id, 'temperature', e.target.value)}
              />
            </Box>
          </>
        );
      case "tool":
        return (
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
        );
      default:
        return null;
    }
  };

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
        {renderProperties()}
      </VStack>
    </Box>
  );
};

export default NodeProperties;
