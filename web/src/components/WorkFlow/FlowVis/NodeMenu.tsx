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
import { nodeConfig, type NodeType } from "../Nodes/nodeConfig";
import { useSkillsQuery } from "@/hooks/useSkillsQuery";
import ToolsIcon from "../../Icons/Tools";

interface NodeMenuProps {
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    isPlugin: boolean
  ) => void;
  showStartEnd?: boolean;
  onNodeSelect?: (nodeType: NodeType | string, isPlugin: boolean) => void;
}

const NodeMenu: React.FC<NodeMenuProps> = ({
  onDragStart,
  onNodeSelect,
  showStartEnd = false,
}) => {
  const { data: tools, isLoading, isError } = useSkillsQuery();

  const handleNodeAction = (
    event: React.MouseEvent | React.DragEvent<HTMLDivElement>,
    nodeType: string,
    isPlugin: boolean
  ) => {
    if (event.type === "dragstart" && "dataTransfer" in event) {
      // 确保事件是 DragEvent
      const dragEvent = event as React.DragEvent<HTMLDivElement>;
      dragEvent.dataTransfer.setData(
        "application/reactflow",
        JSON.stringify({ tool: nodeType, type: isPlugin ? "plugin" : nodeType })
      );
    } else if (onNodeSelect) {
      onNodeSelect(nodeType, isPlugin);
    }
  };

  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      p={2}
      width="200px"
      h="100%"
    >
      <Tabs isLazy>
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
                      overflow={"auto"}
                      border="1px solid #ddd"
                      borderRadius="md"
                      padding={2}
                      cursor="move"
                      draggable
                      onDragStart={(event) =>
                        handleNodeAction(event, nodeType, false)
                      }
                      onClick={(event) =>
                        handleNodeAction(event, nodeType, false)
                      }
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
                tools?.data.map((tool) => (
                  <Box
                    key={tool.display_name}
                    border="1px solid #ddd"
                    borderRadius="md"
                    padding={2}
                    cursor="move"
                    draggable
                    onDragStart={(event) =>
                      handleNodeAction(event, tool.name, true)
                    }
                    onClick={(event) =>
                      handleNodeAction(event, tool.name, true)
                    }
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
