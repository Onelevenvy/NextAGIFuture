import { Box, Input, Text, VStack, Button } from "@chakra-ui/react";
import type React from "react";
import { ToolsService } from "@/client/services/ToolsService"; // 新增导入
import { useSkillsQuery } from "@/hooks/useSkillsQuery"; // 新增导入
import { useState } from "react";

interface PluginNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const PluginNodeProperties: React.FC<PluginNodePropertiesProps> = ({
  node,
  onNodeDataChange,
}) => {
  const { data: skills } = useSkillsQuery(); // 获取工具信息
  // 根据 node.data.toolName 匹配工具
  const tool = skills?.data.find(
    (skill) => skill.display_name === node.data.toolName
  ); // 获取当前工具
  const [loading, setLoading] = useState(false); // 加载状态

  const handleInvoke = async () => {
    setLoading(true);
    try {
      const response = await ToolsService.invokeTools({
        toolName: node.data.toolName,
        requestBody: node.data.args,
      });
      console.log("Invoke Result:", response); // 处理调用结果
    } catch (err) {
      console.error("Error invoking tool", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">Input param:</Text>
      </Box>
      {tool?.input_parameters &&
        Object.entries(tool.input_parameters).map(([key, value]) => (
          <Box key={key}>
            <Text fontWeight="bold">{key}:</Text>
            <Input
              value={node.data.args[key] || ""}
              onChange={(e) =>
                onNodeDataChange(node.id, "args", {
                  ...node.data.args,
                  [key]: e.target.value,
                })
              }
              placeholder={`Enter ${key}`}
            />
          </Box>
        ))}
      <Button onClick={handleInvoke} isLoading={loading}>
        Run Tool
      </Button>
    </VStack>
  );
};

export default PluginNodeProperties;
