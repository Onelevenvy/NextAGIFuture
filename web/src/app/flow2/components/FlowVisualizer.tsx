"use client";
import React, { useCallback, useMemo, useState, KeyboardEvent } from "react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyEdgeChanges,
  applyNodeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
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
  isNode,
  getConnectedEdges,
} from "reactflow";
import "reactflow/dist/style.css";
import NodeProperties from "./NodeProperties";
import NodePalette from "./NodePalette";
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

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
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      // start 节点只能从 bottom 连出
      if (sourceNode.type === "start" && connection.sourceHandle !== "right")
        return false;

      // end 节点只能从 top 连入
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
            const newType = e.type === "default" ? "conditional" : "default";
            return {
              ...e,
              type: newType,
              animated: newType === "conditional",
              style: {
                strokeDasharray: newType === "conditional" ? "5,5" : "none",
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

      const position = reactFlowInstance.project({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: { label: `${type} node` },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, reactFlowInstance, setNodes]
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
        entry_point: nodes.find((node) => node.type === "start")?.id || "",
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

  return (
    <Box display="flex" height="100%" onKeyDown={onKeyDown} tabIndex={0}>
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
          fitView
          connectionLineType={ConnectionLineType.SmoothStep}
          onDragOver={onDragOver}
          onDrop={onDrop}
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Controls />
          <Background color="#aaa" gap={16} />
          <MiniMap />
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
      <NodeProperties node={selectedNode} />
      <Button onClick={saveConfig} position="absolute" top={4} right={4}>
        保存配置
      </Button>
    </Box>
  );
};

export default FlowVisualizer;
