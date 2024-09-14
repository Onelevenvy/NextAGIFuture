import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

const CustomNode: React.FC<NodeProps> = ({ data, type }) => (
  <div
    style={{
      border: "1px solid #777",
      padding: "10px",
      borderRadius: "3px",
      background: "white",
      minWidth: "150px",
      textAlign: "center",
      position: "relative",
    }}
  >
    {type !== "start" && (
      <>
        <Handle type="target" position={Position.Top} id="top" />
        {/* <Handle type="target" position={Position.Left} id="left" />
        <Handle type="target" position={Position.Right} id="right" /> */}
        <Handle type="target" position={Position.Bottom} id="bottom" />
      </>
    )}
    <div>{data.label}</div>

    {type !== "end" && (
      <>
        <Handle type="source" position={Position.Top} id="top" />
        {/* <Handle type="source" position={Position.Left} id="left" />
        <Handle type="source" position={Position.Right} id="right" /> */}
        <Handle type="source" position={Position.Bottom} id="bottom" />
      </>
    )}
  </div>
);

export const nodeTypes = {
  start: CustomNode,
  end: CustomNode,
  llm: CustomNode,
  tool: CustomNode,
};
