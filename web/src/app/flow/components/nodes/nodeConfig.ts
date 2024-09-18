import { FaPlay, FaStop, FaRobot, FaTools } from "react-icons/fa";
import QuestionClassifierProperties from "./QuestionClassifier/Properties";
import ToolNodeProperties from "./Tool/Properties";
import LLMNodeProperties from "./LLM/Properties";
import EndNodeProperties from "./End/Properties";
import StartNodeProperties from "./Start/Properties";

interface NodeConfigItem {
  display: string;
  icon: React.ComponentType;
  colorScheme: string;
  properties: React.ComponentType<any>;
  allowedConnections: {
    sources: string[];
    targets: string[];
  };
}

export const nodeConfig: Record<string, NodeConfigItem> = {
  start: {
    display: "Start",
    icon: FaPlay,
    colorScheme: "green",
    properties: StartNodeProperties,
    allowedConnections: {
      sources: ["right"],
      targets: [],
    },
  },
  end: {
    display: "End",
    icon: FaStop,
    colorScheme: "red",
    properties: EndNodeProperties,
    allowedConnections: {
      sources: [],
      targets: ["left"],
    },
  },
  llm: {
    display: "LLM",
    icon: FaRobot,
    colorScheme: "blue",
    properties: LLMNodeProperties,
    allowedConnections: {
      sources: ["left", "right"],
      targets: ["left", "right"],
    },
  },
  tool: {
    display: "Tool",
    icon: FaTools,
    colorScheme: "purple",
    properties: ToolNodeProperties,
    allowedConnections: {
      sources: ["left", "right"],
      targets: ["left", "right"],
    },
  },
  questionClassifier: {
    display: "问题分类器",
    icon: FaRobot,
    colorScheme: "orange",
    properties: QuestionClassifierProperties,
    allowedConnections: {
      sources: ["left", "right"],
      targets: ["left", "right"],
    },
  },
};

export type NodeType = keyof typeof nodeConfig;
