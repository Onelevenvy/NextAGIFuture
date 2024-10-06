import { FaPlay, FaRobot, FaStop, FaTools } from "react-icons/fa";
import EndNodeProperties from "./End/Properties";
import LLMNodeProperties from "./LLM/Properties";
import QuestionClassifierProperties from "./QuestionClassifier/Properties";
import StartNodeProperties from "./Start/Properties";
import ToolNodeProperties from "./Tool/Properties";
import PluginNodeProperties from "./Plugin/PluginNodeProperties"

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
    icon: FaRobot, // 你需要定义一个图标
    colorScheme: "blue",
    properties: PluginNodeProperties, // 如果有特定的属性面板
    initialData: {
      toolName: "", // 工具名称
      args: {}, // 参数
    },
    allowedConnections: {
      sources: ["right"],
      targets: ["left"],
    },
  },
};

export type NodeType = keyof typeof nodeConfig;
