"use client";
import React, { useCallback, useMemo, useState, KeyboardEvent } from "react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ConnectionLineType,
  NodeTypes,
  DefaultEdgeOptions,
  addEdge,
  Connection,
  useReactFlow,
  MarkerType,
  useEdgesState,
  useNodesState,
  Panel,
  useViewport,
} from "reactflow";
import "reactflow/dist/style.css";

import NodePalette from "./NodePalette";
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import LLMNodeProperties from "./nodes/LLM/Properties";
import ToolNodeProperties from "./nodes/Tool/Properties";
import StartNodeProperties from "./nodes/Start/Properties";
import EndNodeProperties from "./nodes/End/Properties";
import QuestionClassifierProperties from "./nodes/QuestionClassifier/Properties";


interface NodeData {
  label: string;
  onChange: (key: string, value: any) => void;
  model?: string;
  temperature?: number;
  tool?: string;
}

interface CustomNode extends Node {
  data: NodeData;
}

export interface FlowVisualizerProps {
  initialNodes: CustomNode[];
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string | null;
  }>({ x: 0, y: 0, nodeId: null });
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const getNodePropertiesComponent = (node: Node | null) => {
    if (!node) return null;

    switch (node.type) {
      case "llm":
        return (
          <LLMNodeProperties node={node} onNodeDataChange={onNodeDataChange} />
        );
      case "tool":
        return (
          <ToolNodeProperties node={node} onNodeDataChange={onNodeDataChange} />
        );
        case "questionClassifier":
          return (
            <QuestionClassifierProperties node={node} onNodeDataChange={onNodeDataChange} />
          );
      case "start":
        return (
          <StartNodeProperties
            node={node}
            onNodeDataChange={onNodeDataChange}
          />
        );
      case "end":
        return (
          <EndNodeProperties node={node} onNodeDataChange={onNodeDataChange} />
        );
      default:
        return null;
    }
  };

  const isValidConnection = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      // start 节点只能从 right 连出
      if (sourceNode.type === "start" && connection.sourceHandle !== "right")
        return false;

      // end 节点只能从 left 连入
      if (targetNode.type === "end" && connection.targetHandle !== "left")
        return false;

      // 防止自连接
      if (connection.source === connection.target) return false;

      // 防止重复连接
      const existingEdge = edges.find(
        (edge) =>
          edge.source === connection.source && edge.target === connection.target
      );
      if (existingEdge) return false;

      // 允许所有其他连接
      return true;
    },
    [nodes, edges]
  );
  const onNodeDataChange = useCallback(
    (nodeId: string, key: string, value: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                [key]: value,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );
  const onConnect = useCallback(
    (connection: Connection) => {
      if (isValidConnection(connection)) {
        const newEdge = {
          ...connection,
          type: "default",
          animated: false,
          style: { strokeDasharray: "none" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#000",
          },
        };
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [setEdges, isValidConnection]
  );

  const toggleEdgeType = useCallback(
    (edge: Edge) => {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === edge.id) {
            const newType = e.type === "default" ? "bezier" : "default";
            return {
              ...e,
              type: newType,
              animated: newType === "bezier",
              style: {
                strokeDasharray: newType === "bezier" ? "5,5" : "none",
              },
            };
          }
          return e;
        })
      );
    },
    [setEdges]
  );
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      toggleEdgeType(edge);
    },
    [toggleEdgeType]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "e" || event.key === "E") {
        const selectedEdges = edges.filter((e) => e.selected);
        selectedEdges.forEach(toggleEdgeType);
      }
    },
    [edges, toggleEdgeType]
  );
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: CustomNode = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: {
          label: `${type.toUpperCase()} `,
          onChange: (key: string, value: any) =>
            onNodeDataChange(`${type}-${nodes.length + 1}`, key, value),
        },
      };
      // 为不同类型的节点添加特定的初始数据
      switch (type) {
        case "llm":
          newNode.data.model = "gpt-3.5-turbo";
          newNode.data.temperature = 0.7;
          break;
        case "tool":
          newNode.data.tool = "calculator";
          break;
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, reactFlowInstance, setNodes, onNodeDataChange]
  );
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu({ x: 0, y: 0, nodeId: null });
  }, []);

  const deleteNode = useCallback(() => {
    if (contextMenu.nodeId) {
      setNodes((nds) => nds.filter((node) => node.id !== contextMenu.nodeId));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== contextMenu.nodeId &&
            edge.target !== contextMenu.nodeId
        )
      );
    }
    closeContextMenu();
  }, [contextMenu.nodeId, setNodes, setEdges, closeContextMenu]);

  const saveConfig = () => {
    const startEdge = edges.find((edge) => {
      const sourceNode = nodes.find(
        (node) => node.id === edge.source && node.type === "start"
      );
      return sourceNode !== undefined;
    });

    const entryPointId = startEdge ? startEdge.target : null; // Get the target ID of the first 'start' edge
    const config = {
      name: "Flow Visualization",
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label,
          // Add other necessary data fields
        },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || "bottom",
        targetHandle: edge.targetHandle || "top",
        type: edge.type,
      })),
      metadata: {
        entry_point: entryPointId,
        start_connections: edges
          .filter((edge) =>
            nodes.find(
              (node) => node.id === edge.source && node.type === "start"
            )
          )
          .map((edge) => ({
            target: edge.target,
            type: edge.type,
          })),
        end_connections: edges
          .filter((edge) =>
            nodes.find((node) => node.id === edge.target && node.type === "end")
          )
          .map((edge) => ({
            source: edge.source,
            type: edge.type,
          })),
      },
    };
    console.log(JSON.stringify(config, null, 2));
    // Here you can implement saving the config to a file or sending it to a server
  };

  // 使用 useMemo 来记忆化 nodeTypes 和 defaultEdgeOptions
  const memoizedNodeTypes = useMemo(() => nodeTypes, [nodeTypes]);
  const memoizedDefaultEdgeOptions = useMemo(
    () => defaultEdgeOptions,
    [defaultEdgeOptions]
  );
  const { zoom } = useViewport();

  const ZoomDisplay = () => (
    <Panel position="bottom-left">缩放: {Math.round(zoom * 100)}%</Panel>
  );

  return (
    <Box
      display="flex"
      height="100%"
      onKeyDown={onKeyDown}
      tabIndex={0}
      bg={"#f0f2f7"}
    >
      <NodePalette />
      <Box flex={1} position="relative">
        <ReactFlow
          onNodeClick={onNodeClick}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onEdgeContextMenu={onEdgeContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          nodeTypes={memoizedNodeTypes}
          defaultEdgeOptions={{
            ...memoizedDefaultEdgeOptions,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: "#000",
            },
          }}
          // fitView
          connectionLineType={ConnectionLineType.SmoothStep}
          onDragOver={onDragOver}
          onDrop={onDrop}
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Controls />
          <Background
            color="#f2f2f2"
            gap={16}
            style={{ background: "#f1f1f1" }}
          />

          <MiniMap />
          <ZoomDisplay />
        </ReactFlow>
        {contextMenu.nodeId && (
          <Menu isOpen={true} onClose={closeContextMenu}>
            <MenuButton as={Button} style={{ display: "none" }} />
            <MenuList
              style={{
                position: "absolute",
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`,
              }}
            >
              <MenuItem onClick={deleteNode}>删除节点</MenuItem>
            </MenuList>
          </Menu>
        )}
      </Box>
      {getNodePropertiesComponent(selectedNode)}
      <Button onClick={saveConfig} position="absolute" top={4} right={4}>
        保存配置
      </Button>
    </Box>
  );
};

export default FlowVisualizer;
