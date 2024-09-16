import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  Box,
  Select,
  Input,
  VStack,
  Text,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { FaRobot, FaTools, FaPlay, FaStop } from "react-icons/fa";

interface ExtendedNodeProps extends NodeProps {
  children?: React.ReactNode;
}

const BaseNode: React.FC<ExtendedNodeProps> = ({ data, type, children }) => (
  <Box
    padding="10px" // Reduced from 10px
    borderRadius="lg"
    background="white"
    minWidth="200" // Reduced from 200px
    maxWidth="200" // Added max-width
    textAlign="center"
    position="relative"
    // fontSize="sm" // Added to reduce font size
    boxShadow="md"
  >
    <HStack spacing={2} mb={1}>
      {getNodeIcon(type)}
      <Text fontWeight="bold" fontSize="xs">
        {data.label}
      </Text>
    </HStack>
    {children}
  </Box>
);
const getNodeIcon = (type: string) => {
  switch (type) {
    case "llm":
      // return <Icon as={FaRobot} color={"green"} />;
      return (
        <IconButton
          aria-label="llm"
          icon={<FaRobot />}
          colorScheme="blue"
          size="xs"
        />
      );
    case "tool":
      return (
        <IconButton
          aria-label="tool"
          icon={<FaTools />}
          colorScheme="purple"
          size="xs"
        />
      );
    case "start":
      return (
        <IconButton
          aria-label="start"
          icon={<FaPlay />}
          colorScheme="green"
          size="xs"
        />
      );
    case "end":
      return (
        <IconButton
          aria-label="end"
          icon={<FaStop />}
          colorScheme="red"
          size="xs"
        />
      );

    default:
      return (
        <IconButton
          aria-label="llm"
          icon={<FaRobot />}
          colorScheme="green"
          size="xs"
        />
      );
  }
};

const LLMNode: React.FC<NodeProps> = (props) => (
  <BaseNode {...props}>
    <Handle type="target" position={Position.Left} id="left" />
    <Handle type="target" position={Position.Right} id="right" />
    <Handle type="source" position={Position.Left} id="left" />
    <Handle type="source" position={Position.Right} id="right" />
    <VStack spacing={1}>
      <Select
        size="xs"
        placeholder="Select model"
        value={props.data.model}
        onChange={(e) => props.data.onChange("model", e.target.value)}
      >
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        <option value="gpt-4">GPT-4</option>
      </Select>
      <Input
        size="xs"
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
      size="xs"
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
  </BaseNode>
);

const EndNode: React.FC<NodeProps> = (props) => (
  <BaseNode {...props}>
    <Handle type="target" position={Position.Left} id="left" />
  </BaseNode>
);

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  llm: LLMNode,
  tool: ToolNode,
};
