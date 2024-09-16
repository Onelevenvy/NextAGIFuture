import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  Box,
  Select,
  Input,
  VStack,
  Text,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { FaRobot, FaTools, FaPlay, FaStop } from "react-icons/fa";

interface ExtendedNodeProps extends NodeProps {
  children?: React.ReactNode;
}

const BaseNode: React.FC<ExtendedNodeProps> = ({ data, type, children }) => (
  <Box
    border="1px solid #777"
    padding="10px"
    borderRadius="3px"
    background="white"
    minWidth="200px"
    textAlign="center"
    position="relative"
  >
    <HStack spacing={2} mb={2}>
      {getNodeIcon(type)}
      <Text fontWeight="bold">{data.label}</Text>
    </HStack>
    {children}
  </Box>
);

const getNodeIcon = (type: string) => {
  switch (type) {
    case "llm":
      return <Icon as={FaRobot} />;
    case "tool":
      return <Icon as={FaTools} />;
    case "start":
      return <Icon as={FaPlay} />;
    case "end":
      return <Icon as={FaStop} />;
    default:
      return null;
  }
};

const LLMNode: React.FC<NodeProps> = (props) => (
  <BaseNode {...props}>
    <Handle type="target" position={Position.Left} id="left" />
    <Handle type="target" position={Position.Right} id="right" />
    <Handle type="source" position={Position.Left} id="left" />
    <Handle type="source" position={Position.Right} id="right" />
    <VStack spacing={2}>
      <Select
        placeholder="Select model"
        value={props.data.model}
        onChange={(e) => props.data.onChange("model", e.target.value)}
      >
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        <option value="gpt-4">GPT-4</option>
      </Select>
      <Input
        type="number"
        placeholder="Temperature"
        value={props.data.temperature}
        onChange={(e) => props.data.onChange("temperature", e.target.value)}
      />
    </VStack>
  </BaseNode>
);

const ToolNode: React.FC<NodeProps> = (props) => (
  <BaseNode {...props}>
    <Handle type="target" position={Position.Left} id="left" />
    <Handle type="target" position={Position.Right} id="right" />
    <Handle type="source" position={Position.Left} id="left" />
    <Handle type="source" position={Position.Right} id="right" />
    <Select
      placeholder="Select tool"
      value={props.data.tool}
      onChange={(e) => props.data.onChange("tool", e.target.value)}
    >
      <option value="calculator">Calculator</option>
      <option value="websearch">Web Search</option>
    </Select>
  </BaseNode>
);

const StartNode: React.FC<NodeProps> = (props) => (
  <BaseNode {...props}>
    <Handle type="source" position={Position.Right} id="right" />
    <Text>Start</Text>
  </BaseNode>
);

const EndNode: React.FC<NodeProps> = (props) => (
  <BaseNode {...props}>
    <Handle type="target" position={Position.Left} id="left" />
    <Text>End</Text>
  </BaseNode>
);

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  llm: LLMNode,
  tool: ToolNode,
};
