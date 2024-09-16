import EndNode from "./End/EndNode";
import LLMNode from "./LLM/LLMNode";
import StartNode from "./Start/StartNode";
import ToolNode from "./Tool/ToolNode";


export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  llm: LLMNode,
  tool: ToolNode,
};