import React from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import { BaseNode } from "../Base/BaseNode";
import { nodeConfig } from "../nodeConfig";
import { useSkillsQuery } from "@/hooks/useSkillsQuery"; // 新增导入
import ToolsIcon from "@/components/Icons/Tools";

const { colorScheme } = nodeConfig.plugin;

const PluginNode: React.FC<NodeProps> = (props) => {
  const { data: skills } = useSkillsQuery(); // 获取工具信息
  // 获取工具名称
  const toolName = skills?.data.find(skill => skill.name === props.data.toolName)?.display_name || props.data.toolName;

  return (
    <BaseNode {...props} colorScheme={colorScheme}>
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff' }}>
        <ToolsIcon tools_name={toolName.replace(/ /g, "_")} /> {/* 根据工具名称显示图标 */}
        <div>{toolName}</div> {/* 显示工具名称 */}
      </div>
    </BaseNode>
  );
};

export default React.memo(PluginNode);