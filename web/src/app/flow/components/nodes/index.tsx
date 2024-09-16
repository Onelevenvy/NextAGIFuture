import EndNode from "./End/EndNode";
import LLMNode from "./LLM/LLMNode";
import StartNode from "./Start/StartNode";
import ToolNode from "./Tool/ToolNode";
import QuestionClassifierNode from "./QuestionClassifier/QuestionClassifierNode";

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  llm: LLMNode,
  tool: ToolNode,
  questionClassifier: QuestionClassifierNode,
};
