import { FaPlay, FaRobot, FaStop, FaTools } from "react-icons/fa";
import { TfiGithub } from "react-icons/tfi";
import EndNodeProperties from "./End/Properties";
import LLMNodeProperties from "./LLM/LLMNodeProperties";
import QuestionClassifierProperties from "./QuestionClassifier/Properties";
import StartNodeProperties from "./Start/Properties";
import ToolNodeProperties from "./Tool/Properties";
import PluginNodeProperties from "./Plugin/PluginNodeProperties";

interface NodeConfigItem {
  display: string;
  icon: React.ComponentType;
  colorScheme: string;
  properties: React.ComponentType<any>;
  allowedConnections: {
    sources: string[];
    targets: string[];
  };
  initialData?: Record<string, any>;
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
    initialData: {
      model: "glm-4-flash",
      temperature: 0.1,
      systemMessage: null,
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
    initialData: {
      tools: ["Open Weather"],
    },
  },
  questionClassifier: {
    display: "Q-Router",
    icon: FaRobot,
    colorScheme: "orange",
    properties: QuestionClassifierProperties,
    allowedConnections: {
      sources: ["left", "right"],
      targets: ["left", "right"],
    },
  },
  plugin: {
    display: "Plugin",
    icon: TfiGithub,
    colorScheme: "gray",
    properties: PluginNodeProperties,
    initialData: {
      toolName: "",
      args: {},
    },
    allowedConnections: {
      sources: ["right"],
      targets: ["left"],
    },
  },
};

export type NodeType = keyof typeof nodeConfig;
