import React, { useState } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import { BaseNode } from "../Base/BaseNode";
import { nodeConfig } from "../nodeConfig";
import { ToolsService } from "@/client/services/ToolsService";
import { useQuery } from "react-query";
import ToolsIcon from "@/components/Icons/Tools";


const { colorScheme } = nodeConfig.plugin;

const PluginNode: React.FC<NodeProps> = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toolName } = props.data; // 从 props 中获取工具名称

  const handleInvoke = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ToolsService.invokeTools({
        toolName: props.data.toolName, // 从节点数据中获取工具名称
        requestBody: props.data.args, // 从节点数据中获取参数
      });
      console.log(response); // 处理响应
    } catch (err) {
      setError("Error invoking tool");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseNode {...props} colorScheme={colorScheme}>
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff' }}>
        <ToolsIcon tools_name={toolName.replace(/ /g, "_")} /> {/* 根据工具名称显示图标 */}
        <button onClick={handleInvoke} disabled={loading}>
          {loading ? "Invoking..." : "Invoke Tool"}
        </button>
        {error && <div>{error}</div>}
        <div>{toolName}</div> {/* 显示工具名称 */}
      </div>
    </BaseNode>
  );
};

export default React.memo(PluginNode);