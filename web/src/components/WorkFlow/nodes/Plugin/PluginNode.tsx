import React from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import { BaseNode } from "../Base/BaseNode";
import { nodeConfig } from "../nodeConfig";
import { useSkillsQuery } from "@/hooks/useSkillsQuery"; // 新增导入
import ToolsIcon from "@/components/Icons/Tools";
import { Box } from "@chakra-ui/react";

const { colorScheme } = nodeConfig.plugin;

const PluginNode: React.FC<NodeProps> = (props) => {
  const { data: skills } = useSkillsQuery(); // 获取工具信息
  // 获取工具名称
//   const toolName = skills?.data.find(skill => skill.name === props.data.toolName)?.display_name || props.data.toolName;
  const { icon: Icon, colorScheme } = nodeConfig.plugin;
  return (
    <BaseNode {...props} icon={<Icon />} colorScheme={colorScheme}>
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <Box style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff' }}>
        {/* <ToolsIcon tools_name={toolName.replace(/ /g, "_")} />  */}
        {/* <Box>{toolName}</Box>  */}
      </Box>
    </BaseNode>
  );
};

export default React.memo(PluginNode);