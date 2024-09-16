import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Box, VStack, Text } from "@chakra-ui/react";
import { FaRobot } from "react-icons/fa";
import { BaseNode } from "../Base/BaseNode";

const QuestionClassifierNode: React.FC<NodeProps> = (props) => (
  <BaseNode {...props} icon={<FaRobot />} colorScheme="blue">
    <Handle type="target" position={Position.Left} id="left" />
    <Handle type="target" position={Position.Right} id="right" />
    <Handle type="source" position={Position.Left} id="left" />
    <Handle type="source" position={Position.Right} id="right" />

    <Handle
      type="source"
      position={Position.Right}
      id="right"
      style={{ top: 10 }}
    />
    <Handle
      type="source"
      position={Position.Right}
      id="right"
      style={{ top: 60 }}
    />
    <Handle
      type="target"
      position={Position.Right}
      id="right"
      style={{ top: 60 }}
    />
    <Handle
      type="target"
      position={Position.Right}
      id="right"
      style={{ top: 10 }}
    />
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

export default React.memo(QuestionClassifierNode);
