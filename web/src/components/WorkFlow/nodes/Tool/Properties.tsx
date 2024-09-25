import React, { useState } from "react";
import {
  Box,
  VStack,
  Text,
  Button,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useSkillsQuery } from "@/hooks/useSkillsQuery";
import { DeleteIcon } from "@chakra-ui/icons";
import ToolsList from "./ToolsListModal";

interface ToolNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const ToolNodeProperties: React.FC<ToolNodePropertiesProps> = ({
  node,
  onNodeDataChange,
}) => {
  const [isToolsListOpen, setIsToolsListOpen] = useState(false);
  const { data: skills, isLoading, isError } = useSkillsQuery();

  const addTool = (tool: string) => {
    const currentTools = node.data.tools || [];
    if (!currentTools.includes(tool)) {
      onNodeDataChange(node.id, "tools", [...currentTools, tool]);
    }
  };

  const removeTool = (tool: string) => {
    const currentTools = node.data.tools || [];
    onNodeDataChange(
      node.id,
      "tools",
      currentTools.filter((t: string) => t !== tool)
    );
  };

  if (isLoading) return <Text>Loading skills...</Text>;
  if (isError) return <Text>Error loading skills</Text>;

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">Tools:</Text>
        {node.data.tools &&
          node.data.tools.map((tool: string) => (
            <HStack key={tool} justifyContent="space-between">
              <Text>{tool}</Text>
              <IconButton
                aria-label="Remove tool"
                icon={<DeleteIcon />}
                size="sm"
                onClick={() => removeTool(tool)}
              />
            </HStack>
          ))}
        <Button onClick={() => setIsToolsListOpen(true)} mt={2}>
          Add Tool
        </Button>
      </Box>
      {isToolsListOpen && (
        <ToolsList
          skills={skills?.data || []}
          onClose={() => setIsToolsListOpen(false)}
          onAddTool={addTool}
          selectedTools={node.data.tools || []}
        />
      )}
    </VStack>
  );
};

export default ToolNodeProperties;
