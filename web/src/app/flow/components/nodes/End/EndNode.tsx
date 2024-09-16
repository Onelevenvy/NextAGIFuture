import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { FaStop } from "react-icons/fa";
import { BaseNode } from "../Base/BaseNode";

const EndNode: React.FC<NodeProps> = (props) => (
  <BaseNode {...props} icon={<FaStop />} colorScheme="red">
    <Handle type="target" position={Position.Left} id="left" />
  </BaseNode>
);

export default EndNode;
