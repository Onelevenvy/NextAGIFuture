import type { NamedExoticComponent } from "react";
import type { NodeProps } from "reactflow";
import EndNode from "./End/EndNode";
import LLMNode from "./LLM/LLMNode";
import QuestionClassifierNode from "./QuestionClassifier/QuestionClassifierNode";
import StartNode from "./Start/StartNode";
import ToolNode from "./Tool/ToolNode";
import { type NodeType, nodeConfig } from "./nodeConfig";

const nodeComponents: Record<NodeType, NamedExoticComponent<NodeProps>> = {
  start: StartNode,
  end: EndNode,
  llm: LLMNode,
  tool: ToolNode,
  questionClassifier: QuestionClassifierNode,
};

export const nodeTypes = Object.fromEntries(
  Object.keys(nodeConfig).map((key) => [key, nodeComponents[key as NodeType]]),
) as Record<NodeType, NamedExoticComponent<NodeProps>>;
