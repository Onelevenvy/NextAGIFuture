"use client";
import type React from "react";
import { type KeyboardEvent, useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  ConnectionLineType,
  type Connection,
  useReactFlow,
  MarkerType,
  Panel,
  useViewport,
  EdgeLabelRenderer,
} from "reactflow";
import { FaPlus } from "react-icons/fa";
import { useContextMenu } from "@/hooks/graphs/useContextMenu";
import { useFlowState } from "@/hooks/graphs/useFlowState";
import { useGraphConfig } from "@/hooks/graphs/useUpdateGraphConfig";
import {
  Box,
  Button,
  CloseButton,
  Image,
  Kbd,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { MdBuild, MdOutlineHelp } from "react-icons/md";
import { VscTriangleRight } from "react-icons/vsc";
import "reactflow/dist/style.css";
import DebugPreview from "../Teams/DebugPreview";
import NodePalette from "./NodePalette";
import BaseProperties from "./nodes/Base/Properties";
import { type NodeType, nodeConfig } from "./nodes/nodeConfig";
import type { CustomNode, FlowVisualizerProps } from "./types";
import { calculateEdgeCenter } from './utils';


const FlowVisualizer: React.FC<FlowVisualizerProps> = ({
  nodeTypes,
  defaultEdgeOptions,
  teamId,
  graphData,
}) => {
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    selectedNodeId,
    setSelectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDataChange,
    nameError,
  } = useFlowState(
    graphData?.data[0]?.config?.nodes,
    graphData?.data[0]?.config?.edges
  );

  const { contextMenu, onNodeContextMenu, closeContextMenu } = useContextMenu();
  const buttonColor = useColorModeValue("ui.main", "ui.main");
  const reactFlowInstance = useReactFlow();

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      setSelectedEdge(null); // 取消选中的边
    },
    [setSelectedNodeId]
  );

  const nodesWithSelection = useMemo(() => {
    return nodes?.map((node) => ({
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
    const { icon: Icon, colorScheme } = nodeConfig[nodeType];
    return (
      <BaseProperties
        icon={<Icon />}
        colorScheme={colorScheme}
        nodeName={node.data.label}
        onNameChange={(newName: string) =>
          onNodeDataChange(node.id, "label", newName)
        }
        nameError={nameError}
      >
        {PropertiesComponent && (
          <PropertiesComponent
            node={node}
            onNodeDataChange={onNodeDataChange}
          />
        )}
      </BaseProperties>
    );
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
                strokeWidth: 2,
                stroke: newType === "default" ? "#5e5a6a" : "#517359",
                strokeDasharray: newType === "default" ? "none" : "10,5",
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
      const existingNames = nodes.map((node) => node.data.label);
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
      const toolData = event.dataTransfer.getData("application/reactflow");
      if (!toolData) return;

      const tool = JSON.parse(toolData); // 解析工具数据
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: CustomNode = {
        id: `${tool.name}-${nodes.length + 1}`, // 确保每个节点唯一
        type: "plugin", // 确保类型为 plugin
        position,
        data: {
          label: tool.display_name, // 使用工具的显示名称
          toolName: tool.display_name, // 使用工具的名称
          args: {}, // 初始化参数
          ...tool.initialData, // 如果有初始数据
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, reactFlowInstance, setNodes]
  );
  const closePropertiesPanel = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

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
    closePropertiesPanel();
  }, [
    contextMenu.nodeId,
    setNodes,
    setEdges,
    closeContextMenu,
    closePropertiesPanel,
  ]);

  const {
    id: graphId,
    name: graphName,
    description: graphDescription,
  } = graphData?.data[0] || {};

  const { onSave, isLoading: isSaving } = useGraphConfig(
    teamId,
    graphId,
    graphName,
    graphDescription,
    nodes,
    edges
  );

  const memoizedNodeTypes = useMemo(() => ({
    ...nodeTypes,
  }), [nodeTypes]);
  const memoizedDefaultEdgeOptions = useMemo(
    () => defaultEdgeOptions,
    [defaultEdgeOptions]
  );
  const { zoom } = useViewport();

  const ZoomDisplay = () => (
    <Panel position="bottom-right">{Math.round(zoom * 100)}%</Panel>
  );

  const [isShortcutPanelVisible, setShortcutPanelVisible] = useState(false);

  const toggleShortcutPanel = () => {
    setShortcutPanelVisible((prev) => !prev);
  };

  const hideShortcutPanel = () => {
    setShortcutPanelVisible(false);
  };

  const [showDebugPreview, setShowDebugPreview] = useState(false);

  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      setSelectedEdge(edge);

      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);
      if (sourceNode && targetNode) {
        const centerPoint = calculateEdgeCenter(sourceNode, targetNode);
        setMenuPosition(centerPoint);
      }
    },
    [nodes]
  );

  const handleAddNodeClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setShowNodeMenu(true);
  }, []);

  const addNodeToEdge = useCallback(
    (nodeType: NodeType) => {
      if (!selectedEdge) return;

      const sourceNode = nodes.find((node) => node.id === selectedEdge.source);
      const targetNode = nodes.find((node) => node.id === selectedEdge.target);
      if (!sourceNode || !targetNode) return;

      const newNodeId = `${nodeType}-${nodes.length + 1}`;
      const centerX = (sourceNode.position.x + targetNode.position.x) / 2;
      const centerY = (sourceNode.position.y + targetNode.position.y) / 2;

      const newNode: CustomNode = {
        id: newNodeId,
        type: nodeType,
        position: { x: centerX, y: centerY },
        data: {
          label: generateUniqueName(nodeConfig[nodeType].display),
          customName: generateUniqueName(nodeConfig[nodeType].display),
          onChange: (key: string, value: any) =>
            onNodeDataChange(newNodeId, key, value),
          ...nodeConfig[nodeType].initialData,
        },
      };

      const newEdge1: Edge = {
        id: `e${selectedEdge.source}-${newNodeId}`,
        source: selectedEdge.source,
        target: newNodeId,
        sourceHandle: "right",
        targetHandle: "left",
        type: selectedEdge.type,
      };

      const newEdge2: Edge = {
        id: `e${newNodeId}-${selectedEdge.target}`,
        source: newNodeId,
        target: selectedEdge.target,
        sourceHandle: "right",
        targetHandle: "left",
        type: selectedEdge.type,
      };

      setNodes((nds) => nds.concat(newNode));
      setEdges((eds) =>
        eds.filter((e) => e.id !== selectedEdge.id).concat(newEdge1, newEdge2)
      );
      setSelectedEdge(null);
      setShowNodeMenu(false);
    },
    [
      selectedEdge,
      nodes,
      setNodes,
      setEdges,
      onNodeDataChange,
      generateUniqueName,
    ]
  );

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null);
    setShowNodeMenu(false);
    setSelectedNodeId(null); // 取消选中的节点
  }, [setSelectedNodeId]);

  return (
    <Box
      display="flex"
      h="100%"
      maxH={"full"}
      onKeyDown={onKeyDown}
      tabIndex={0}
      bg={"#f0f2f7"}
      border={"1px solid #d1d5db"}
      borderRadius={"lg"}
      boxShadow={"md"}
    >
      <Box h="full" maxH={"full"}>
        <NodePalette />
      </Box>
      <Box flex={1} position="relative">
        <ReactFlow
          onNodeClick={onNodeClick}
          nodes={nodesWithSelection}
          edges={edges?.map((edge) => ({
            ...edge,
            style: {
              ...edge.style,
              strokeWidth: 2, // Increased thickness
              stroke: edge.selected
                ? "#2970ff"
                : edge.type === "default"
                  ? "#5e5a6a"
                  : "#517359", // Blue for solid, Red for dashed
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
              color: "#2970ff", // Keep the arrow color blue
            },
            style: { strokeWidth: 2 }, // I
          }}
          connectionLineType={ConnectionLineType.SmoothStep}
          onDragOver={onDragOver}
          onDrop={onDrop}
          deleteKeyCode={["Backspace", "Delete"]}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
        >
          <Controls />

          <Background gap={16} style={{ background: "#f0f2f7" }} />
          <MiniMap />

          <Panel position="top-left">
            <MdOutlineHelp
              onMouseEnter={toggleShortcutPanel}
              onMouseLeave={hideShortcutPanel}
              cursor="pointer"
            />
            {isShortcutPanelVisible && (
              <Box bg="white" p={2} borderRadius="md" boxShadow="md">
                Shortcut:
                <br /> Change edges type:<Kbd>E</Kbd>
                <br />
                Delete:<Kbd>Backspace</Kbd> <Kbd>Delete</Kbd>
                <br />
                Info:
                <br /> solid line: Normal edge
                <br />
                dashed line: Conditional edge
              </Box>
            )}
          </Panel>
          <ZoomDisplay />
          <EdgeLabelRenderer>
            {selectedEdge && (
              <div
                style={{
                  position: "absolute",
                  transform: `translate(-50%, -50%) translate(${menuPosition.x}px, ${menuPosition.y}px)`,
                  pointerEvents: "all",
                  zIndex: 1000,
                }}
              >
                <IconButton
                  aria-label="Add node"
                  icon={<FaPlus />}
                  size="xs"
                  colorScheme="blue"
                  onClick={handleAddNodeClick}
                  isRound={true} // 使按钮变成圆形
                  _hover={{ bg: "blue.500" }} // 悬停时的样式
                  _active={{ bg: "blue.600" }} // 点击时的样式
                />
              </div>
            )}
          </EdgeLabelRenderer>
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
              <MenuItem onClick={deleteNode}>Delete Node</MenuItem>
            </MenuList>
          </Menu>
        )}
      </Box>

      <Box position={"absolute"} right={"20px"} top={"8px"}>
        <Button
          mr={5}
          bg={"white"}
          borderRadius={"lg"}
          border={"1px solid #d1d5db"}
          onClick={() => setShowDebugPreview(true)}
          _hover={{ backgroundColor: "#eff4ff" }}
          rightIcon={<VscTriangleRight color={"#155aef"} size={"12px"} />}
          size={"sm"}
        >
          <Text color={"#155aef"}>Debug</Text>
        </Button>
        <Button
          bg={buttonColor}
          borderRadius={"lg"}
          onClick={onSave}
          isLoading={isSaving}
          loadingText="Saving..."
          _hover={{ backgroundColor: "#1c86ee" }}
          rightIcon={<MdBuild color={"white"} size={"12px"} />}
          size={"sm"}
        >
          <Text color={"white"}>Deploy</Text>
        </Button>
      </Box>

      {selectedNodeId && (
        <Box
          position="relative"
          w="330"
          minW={"330"}
          maxW={"330"}
          bg={"#fcfcfd"}
          p={4}
          borderRadius={"lg"}
          boxShadow="md"
          mr={"5px"}
          my={1}
        >
          <CloseButton
            onClick={closePropertiesPanel}
            position="absolute"
            right={2}
            top={2}
            size={"md"}
          />

          {getNodePropertiesComponent(
            nodes.find((n) => n.id === selectedNodeId) || null
          )}
        </Box>
      )}
      {showDebugPreview && (
        <Box
          position="relative"
          w="350"
          minW={"350"}
          maxW={"350"}
          bg={"white"}
          p={4}
          borderRadius={"lg"}
          boxShadow="md"
          my={1}
          mr={2}
        >
          <CloseButton
            onClick={() => setShowDebugPreview(false)}
            position="absolute"
            right={2}
            top={2}
            size={"md"}
          />
          <DebugPreview
            teamId={teamId}
            triggerSubmit={() => {}}
            useDeployButton={false}
          />
        </Box>
      )}
      {showNodeMenu && (
        <Box
          position="fixed"
          left={`${menuPosition.x}px`}
          top={`${menuPosition.y}px`}
          zIndex={1000}
          bg="white"
          borderRadius="md"
          boxShadow="md"
          p={2}
        >
          <VStack spacing={2} align="stretch">
            {Object.entries(nodeConfig).map(
              ([nodeType, { display, icon: Icon, colorScheme }]) => (
                <Box
                  key={nodeType}
                  border="1px solid #ddd"
                  borderRadius="md"
                  padding={2}
                  cursor="pointer"
                  onClick={() => addNodeToEdge(nodeType as NodeType)}
                  _hover={{ bg: "gray.100" }}
                >
                  <IconButton
                    aria-label={display}
                    icon={<Icon />}
                    colorScheme={colorScheme}
                    size="xs"
                    mr={2}
                  />
                  <Text display="inline">{display}</Text>
                </Box>
              )
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default FlowVisualizer;