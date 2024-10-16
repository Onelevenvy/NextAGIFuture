import type { NamedExoticComponent } from "react";
import type { NodeProps } from "reactflow";
import EndNode from "./End/EndNode";
import LLMNode from "./LLM/LLMNode";
import StartNode from "./Start/StartNode";
import ToolNode from "./Tool/ToolNode";
import PluginNode from "./Plugin/PluginNode";
import AnswerNode from "./Answer/AnswerNode";
import RetrievalNode from "./Retrieval/RetrievalNode";
import RetrievalToolNode from "./RetrievalTool/RetrievalToolNode";
import { type NodeType, nodeConfig } from "./nodeConfig";

const nodeComponents: Record<NodeType, NamedExoticComponent<NodeProps>> = {
  start: StartNode,
  end: EndNode,
  llm: LLMNode,
  tool: ToolNode,
  plugin: PluginNode,
  answer: AnswerNode,
  retrieval: RetrievalNode,
  toolretrieval: RetrievalToolNode,
};

export const nodeTypes = Object.fromEntries(
  Object.keys(nodeConfig).map((key) => [key, nodeComponents[key as NodeType]])
) as Record<NodeType, NamedExoticComponent<NodeProps>>;
