import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Box, VStack, Text, IconButton } from "@chakra-ui/react";
import { FaRobot } from "react-icons/fa";
import { BaseNode } from "../Base/BaseNode"; // 假设您创建了一个基础节点组件

const LLMNode: React.FC<NodeProps> = (props) => (
  <BaseNode {...props} icon={<FaRobot />} colorScheme="blue">
    <Handle type="target" position={Position.Left} id="left" />
    <Handle type="target" position={Position.Right} id="right" />
    <Handle type="source" position={Position.Left} id="left" />
    <Handle type="source" position={Position.Right} id="right" />
    <VStack spacing={1}>
      <Box bg="#f2f4f7" borderRadius={"md"} w="full" p="2">
        <Text fontSize="xs"> {props.data.model}</Text>
      </Box>
      <Box bg="#f2f4f7" borderRadius={"md"} w="full" p="2">
        <Text fontSize="xs">{props.data.temperature}</Text>
      </Box>
    </VStack>
  </BaseNode>
);

export default LLMNode;
