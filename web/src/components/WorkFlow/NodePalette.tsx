import { Box, HStack, IconButton, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack } from "@chakra-ui/react";
import type React from "react";
import { nodeConfig, type NodeType } from "./nodes/nodeConfig"; // 确保导入 NodeType
import { useSkillsQuery } from "@/hooks/useSkillsQuery"; // 导入获取技能的钩子
import { FaTools } from "react-icons/fa";
import ToolsIcon from "../Icons/Tools";

const NodePalette: React.FC = () => {
  const { data: tools, isLoading, isError } = useSkillsQuery(); // 获取工具列表

  const onDragStart = (event: React.DragEvent, tool: any, type: string) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify({ tool, type })); // 传递工具的完整信息和类型
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Box
      width="150px"
      padding={4}
      bg={"#fcfcfd"}
      borderTopLeftRadius={"lg"}
      maxH={"full"}
      h="full"
    >
      <Tabs variant="enclosed" isLazy>
        <TabList>
          <Tab>Nodes</Tab>
          <Tab>Plugins</Tab> {/* 新增的选项卡 */}
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {Object.entries(nodeConfig).map(([nodeType, { display, icon: Icon, colorScheme }]) => (
                // 过滤掉 plugin 类型的节点
                nodeType !== 'plugin' && (
                  <Box
                    key={nodeType}
                    border="1px solid #ddd"
                    borderRadius="md"
                    padding={2}
                    textAlign="left"
                    cursor="move"
                    draggable
                    onDragStart={(event) => onDragStart(event, nodeType, 'node')} // 传递节点类型
                  >
                    <IconButton
                      aria-label={display}
                      icon={<Icon />}
                      colorScheme={colorScheme}
                      size="xs"
                    />
                    <Text display="inline" ml={2}>
                      {display}
                    </Text>
                  </Box>
                )
              ))}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {isLoading ? (
                <Text>Loading tools...</Text>
              ) : isError ? (
                <Text>Error loading tools: {}</Text>
              ) : (
                tools?.data.map((tool) => (
                  <Box
                    key={tool.display_name}
                    border="1px solid #ddd"
                    borderRadius="md"
                    padding={2}
                    textAlign="left"
                    cursor="move"
                    draggable
                    onDragStart={(event) => onDragStart(event, tool, 'plugin')} // 传递工具对象和类型
                  >
                    <HStack spacing={"2"}>
                      <ToolsIcon
                        tools_name={tool.display_name!.replace(/ /g, "_")}
                        ml="2"
                      />
                      <Text fontSize={"3xs"}>{tool.display_name}</Text>
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

export default NodePalette;
