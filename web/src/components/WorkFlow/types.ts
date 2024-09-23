import { Node, Edge, NodeTypes, DefaultEdgeOptions } from 'reactflow';

export interface NodeData {
  label: string;
  customName?: string;
  onChange?: (key: string, value: any) => void;
  model?: string;
  temperature?: number;
  tool?: string[];
  [key: string]: any;
}

export interface CustomNode extends Node {
  data: NodeData;
}

export interface FlowVisualizerProps {
  initialNodes: CustomNode[];
  initialEdges: Edge[];
  nodeTypes: NodeTypes;
  defaultEdgeOptions?: DefaultEdgeOptions;
  teamId: number;
}