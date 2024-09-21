"use client";
import React, { useCallback, useMemo, useState, KeyboardEvent } from "react";
import { v4 } from "uuid";
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
  IconButton,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { nodeConfig, NodeType } from "./nodes/nodeConfig";

interface NodeData {
  label: string;
  customName: string; // 新增：用于存储自定义名称
  onChange?: (key: string, value: any) => void;
  model?: string;
  temperature?: number;
  tool?: string[];
  [key: string]: any; // 添加索引签名
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string | null;
  }>({ x: 0, y: 0, nodeId: null });

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const nodesWithSelection = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        border: node.id === selectedNodeId ? "2px solid #2970ff" : "none",
        borderRadius: "8px",
      },
    }));
  }, [nodes, selectedNodeId]);

  const getNodePropertiesComponent = (node: Node | null) => {
    if (!node) return null;

    const nodeType = node.type as NodeType;
    const PropertiesComponent = nodeConfig[nodeType]?.properties;

    return PropertiesComponent ? (
      <PropertiesComponent node={node} onNodeDataChange={onNodeDataChange} />
    ) : null;
  };

  const isValidConnection = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      const sourceType = sourceNode.type as NodeType;
      const targetType = targetNode.type as NodeType;

      const sourceAllowedConnections =
        nodeConfig[sourceType].allowedConnections;
      const targetAllowedConnections =
        nodeConfig[targetType].allowedConnections;

      // 检查源节点是否允许从指定的 handle 连出
      if (
        connection.sourceHandle &&
        !sourceAllowedConnections.sources.includes(connection.sourceHandle)
      ) {
        return false;
      }
      // 检查目标节点是否允许从指定的 handle 连入
      if (
        connection.targetHandle &&
        !targetAllowedConnections.targets.includes(connection.targetHandle)
      ) {
        return false;
      }
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
            if (key === "customName") {
              // 检查新名称是否已存在
              const isNameExists = nds.some(
                (n) => n.id !== nodeId && n.data.customName === value
              );
              if (isNameExists) {
                // 如果名称已存在，不更新并可能显示一个错误消息
                console.error("节点名称已存在");
                return node;
              }
            }
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
            const newType = e.type === "default" ? "smoothstep" : "default";
            return {
              ...e,
              type: newType,
              animated: newType !== "default",
              style: {
                strokeDasharray: newType === "default" ? "none" : "5,5",
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

  const generateUniqueName = useCallback(
    (baseLabel: string) => {
      const existingNames = nodes.map((node) => node.data.customName);
      let counter = 1;
      let newName = baseLabel;
      while (existingNames.includes(newName)) {
        counter++;
        newName = `${baseLabel}${counter}`;
      }
      return newName;
    },
    [nodes]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;
      if (typeof type === "undefined" || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const baseLabel = `${nodeConfig[type].display}`;
      const uniqueName = generateUniqueName(baseLabel);
      const newNode: CustomNode = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: {
          label: baseLabel,
          customName: uniqueName,
          onChange: (key: string, value: any) =>
            onNodeDataChange(`${type}-${nodes.length + 1}`, key, value),
          ...nodeConfig[type].initialData,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, reactFlowInstance, setNodes, onNodeDataChange, generateUniqueName]
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

    const entryPointId = startEdge ? startEdge.target : null;
    const config = {
      id: v4(),
      name: "Flow Visualization",
      nodes: nodes.map((node) => {
        const nodeType = node.type as NodeType;
        const initialData = nodeConfig[nodeType].initialData || {};
        const nodeData: Record<string, any> = {
          label: node.data.label,
        };

        Object.keys(initialData).forEach((key) => {
          if (node.data[key as keyof NodeData] !== undefined) {
            nodeData[key] = node.data[key as keyof NodeData];
          }
        });

        return {
          id: node.id,
          type: node.type,
          position: node.position,
          data: nodeData,
        };
      }),
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
    // 这里您可以实现将配置保存到文件或发送到服务器的逻辑
  };

  // 使用 useMemo 来记忆化 nodeTypes 和 defaultEdgeOptions
  const memoizedNodeTypes = useMemo(() => nodeTypes, [nodeTypes]);
  const memoizedDefaultEdgeOptions = useMemo(
    () => defaultEdgeOptions,
    [defaultEdgeOptions]
  );
  const { zoom } = useViewport();

  const ZoomDisplay = () => (
    <Panel position="bottom-right">{Math.round(zoom * 100)}%</Panel>
  );

  const closePropertiesPanel = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

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
          nodes={nodesWithSelection}
          edges={edges.map((edge) => ({
            ...edge,
            style: {
              ...edge.style,
              strokeDasharray: edge.type === "default" ? "none" : "5,5",
            },
          }))}
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
              color: "#2970ff",
            },
            style: { strokeWidth: 2 },
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
      {selectedNodeId && (
        <Box
          position="relative"
          width="250px"
          borderLeft="1px solid #ccc"
          p={4}
        >
          <IconButton
            aria-label="Close properties panel"
            icon={<CloseIcon />}
            size="sm"
            position="absolute"
            right={2}
            top={2}
            onClick={closePropertiesPanel}
          />
          {getNodePropertiesComponent(
            nodes.find((n) => n.id === selectedNodeId) || null
          )}
        </Box>
      )}
      <Button onClick={saveConfig} position="absolute" top={4} right={4}>
        保存配置
      </Button>
    </Box>
  );
};

export default FlowVisualizer;
