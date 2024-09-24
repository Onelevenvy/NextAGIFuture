import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Box, VStack, Text } from "@chakra-ui/react";
import { BaseNode } from "../Base/BaseNode";
import ModelProviderIcon from "@/components/Icons/models";
import { nodeConfig } from "../nodeConfig";
const { icon: Icon, colorScheme } = nodeConfig.llm;
const LLMNode: React.FC<NodeProps> = (props) => (
  <BaseNode {...props} icon={<Icon />} colorScheme={colorScheme}>
    <Handle type="target" position={Position.Left} id="left" />
    <Handle type="target" position={Position.Right} id="right" />
    <Handle type="source" position={Position.Left} id="left" />
    <Handle type="source" position={Position.Right} id="right" />
    <VStack spacing={1}>
      <Box
        bg="#f2f4f7"
        borderRadius={"md"}
        w="full"
        p="2"
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"center"}
        alignContent={"center"}
      >
        <ModelProviderIcon modelprovider_name={props.data.provider} />
        <Text fontSize="xs" ml={2}>
          {props.data.model}
        </Text>
      </Box>
    </VStack>
  </BaseNode>
);

export default React.memo(LLMNode);
