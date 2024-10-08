import React from "react";
import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { nodeConfig, type NodeType } from "../Nodes/nodeConfig";
import { useSkillsQuery } from "@/hooks/useSkillsQuery";
import ToolsIcon from "../../Icons/Tools";

interface NodeAddMenuProps {
  onAddNode: (nodeType: NodeType | string, tool?: any) => void;
}

const NodeAddMenu: React.FC<NodeAddMenuProps> = ({ onAddNode }) => {
  const { data: tools, isLoading, isError } = useSkillsQuery();

  return (
    <Box width="200px" padding={2} bg="white" borderRadius="md" boxShadow="md">
      <Tabs isLazy>
        <TabList mb="1em">
          <Tab>Nodes</Tab>
          <Tab>Plugins</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack spacing={2} align="stretch">
              {Object.entries(nodeConfig).map(
                ([nodeType, { display, icon: Icon, colorScheme }]) =>
                  nodeType !== "plugin" &&
                  nodeType !== "start" &&
                  nodeType !== "end" && (
                    <Box
                      key={nodeType}
                      border="1px solid #ddd"
                      borderRadius="md"
                      padding={2}
                      cursor="pointer"
                      onClick={() => onAddNode(nodeType as NodeType)}
                      _hover={{ bg: "gray.100" }}
                    >
                      <IconButton
                        aria-label={display}
                        icon={<Icon />}
                        colorScheme={colorScheme}
                        size="xs"
                        mr={2}
                      />
                      <Text display="inline" fontSize="sm">
                        {display}
                      </Text>
                    </Box>
                  )
              )}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={2} align="stretch">
              {isLoading ? (
                <Text>Loading tools...</Text>
              ) : isError ? (
                <Text>Error loading tools</Text>
              ) : (
                tools?.data.map((tool) => (
                  <Box
                    key={tool.display_name}
                    border="1px solid #ddd"
                    borderRadius="md"
                    p={2}
                    cursor="pointer"
                    onClick={() => onAddNode("plugin", tool)}
                    _hover={{ bg: "gray.100" }}
                  >
                    <HStack spacing="2">
                      <ToolsIcon
                        tools_name={tool.display_name!.replace(/ /g, "_")}
                      />
                      <Text fontSize="xs">{tool.display_name}</Text>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default NodeAddMenu;
