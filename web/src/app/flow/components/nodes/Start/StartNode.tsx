import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { FaPlay } from "react-icons/fa";
import { BaseNode } from "../Base/BaseNode";

const StartNode: React.FC<NodeProps> = (props) => (
  <BaseNode {...props} icon={<FaPlay />} colorScheme="green">
    <Handle type="source" position={Position.Right} id="right" />
  </BaseNode>
);

export default StartNode;
