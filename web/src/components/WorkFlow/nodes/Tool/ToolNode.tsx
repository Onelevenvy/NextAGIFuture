import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Box, Text, VStack, HStack, Tag } from "@chakra-ui/react";
import { nodeConfig } from "../nodeConfig";
import { BaseNode } from "../Base/BaseNode";

const ToolNode: React.FC<NodeProps> = (props) => {
  const { icon: Icon, colorScheme } = nodeConfig.tool;
  const tools = Array.isArray(props.data.tools) ? props.data.tools : [];

  return (
    <BaseNode {...props} icon={<Icon />} colorScheme={colorScheme}>
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <Box bg="#f2f4f7" borderRadius="md" w="full" p="2">
        <VStack align="stretch" spacing={1}>
          {tools.length > 0 ? (
            tools.map((tool: string, index: number) => (
              <HStack key={index} justifyContent="center">
                <Tag size="sm" variant="subtle" colorScheme="blue">
                  {tool}
                </Tag>
              </HStack>
            ))
          ) : (
            <Text fontSize="xs" textAlign="center">No tools selected</Text>
          )}
        </VStack>
      </Box>
    </BaseNode>
  );
};

export default React.memo(ToolNode);
