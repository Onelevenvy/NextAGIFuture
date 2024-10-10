import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import { BaseNode } from "../Base/BaseNode";
import { nodeConfig } from "../nodeConfig";
import { FaDatabase } from "react-icons/fa";

const RetrievalToolNode: React.FC<NodeProps> = (props) => {
  const { icon: Icon, colorScheme } = nodeConfig.toolretrieval;
  const knowledgeBases = Array.isArray(props.data.knowledgeBases)
    ? props.data.knowledgeBases
    : [];

  return (
    <BaseNode {...props} icon={<Icon />} colorScheme={colorScheme}>
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />

      <VStack align="stretch" spacing={1}>
        {knowledgeBases.length > 0 ? (
          knowledgeBases.map((kb: string, index: number) => (
            <HStack key={index} justifyContent="center" justifyItems={"center"}>
              <Box bg="#f2f4f7" borderRadius="md" w="full" p="1">
                <HStack spacing={"2"}>
                  <FaDatabase />
                  <Text fontWeight={"bold"}>{kb}</Text>
                </HStack>
              </Box>
            </HStack>
          ))
        ) : (
          <Text fontSize="xs" textAlign="center">
            No knowledge bases selected
          </Text>
        )}
      </VStack>
    </BaseNode>
  );
};

export default React.memo(RetrievalToolNode);
