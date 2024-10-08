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
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { nodeConfig, type NodeType } from "../nodes/nodeConfig";
import { useSkillsQuery } from "@/hooks/useSkillsQuery";
import ToolsIcon from "../../Icons/Tools";

interface NodeMenuProps {
  onNodeSelect: (nodeType: NodeType | string, isPlugin: boolean) => void;
  showStartEnd?: boolean;
}

const NodeMenu: React.FC<NodeMenuProps> = ({
  onNodeSelect,
  showStartEnd = false,
}) => {
  const { data: tools, isLoading, isError } = useSkillsQuery();

  return (
    <Box bg="white" borderRadius="md" boxShadow="md" p={2} width="200px">
      <Tabs variant="enclosed" isLazy>
        <TabList>
          <Tab>Nodes</Tab>
          <Tab>Plugins</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={2} align="stretch">
              {Object.entries(nodeConfig).map(
                ([nodeType, { display, icon: Icon, colorScheme }]) =>
                  (showStartEnd ||
                    (nodeType !== "start" && nodeType !== "end")) &&
                  nodeType !== "plugin" && (
                    <Box
                      key={nodeType}
                      border="1px solid #ddd"
                      borderRadius="md"
                      padding={2}
                      cursor="pointer"
                      onClick={() => onNodeSelect(nodeType, false)}
                      _hover={{ bg: "gray.100" }}
                    >
                      <IconButton
                        aria-label={display}
                        icon={<Icon />}
                        colorScheme={colorScheme}
                        size="xs"
                        mr={2}
                      />
                      <Text display="inline">{display}</Text>
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
                tools!.data.map((tool) => (
                  <Box
                    key={tool.display_name}
                    border="1px solid #ddd"
                    borderRadius="md"
                    padding={2}
                    cursor="pointer"
                    onClick={() => onNodeSelect(tool.display_name!, true)}
                    _hover={{ bg: "gray.100" }}
                  >
                    <HStack spacing={2}>
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

export default NodeMenu;
