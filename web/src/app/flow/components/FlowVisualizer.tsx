import React, { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  NodeTypes,
  DefaultEdgeOptions,
} from "reactflow";
import "reactflow/dist/style.css";

export interface FlowVisualizerProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  nodeTypes: NodeTypes;
  defaultEdgeOptions?: DefaultEdgeOptions;
}

const FlowVisualizer: React.FC<FlowVisualizerProps> = ({
  initialNodes,
  initialEdges,
  nodeTypes,
  defaultEdgeOptions,
}) => {
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
  const [edges, setEdges] = React.useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      connectionLineType={ConnectionLineType.SmoothStep}
    >
      <Controls />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
};

export default FlowVisualizer;