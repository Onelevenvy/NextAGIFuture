import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Box, Text } from "@chakra-ui/react";
import { nodeConfig } from "../nodeConfig";
import { BaseNode } from "../Base/BaseNode";

const ToolNode: React.FC<NodeProps> = (props) => {
  const { icon: Icon, colorScheme } = nodeConfig.tool;
  return (
    <BaseNode {...props} icon={<Icon />} colorScheme={colorScheme}>
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <Box bg="#f2f4f7" borderRadius={"md"} w="full" p="2">
        <Text fontSize="xs">{props.data.tools}</Text>
      </Box>
    </BaseNode>
  );
};

export default React.memo(ToolNode);
