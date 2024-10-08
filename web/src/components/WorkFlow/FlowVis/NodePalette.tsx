import { Box } from "@chakra-ui/react";
import type React from "react";
import NodeMenu from "./NodeMenu";
import { type NodeType } from "../nodes/nodeConfig";

const NodePalette: React.FC = () => {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    isPlugin: boolean
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ tool: nodeType, type: isPlugin ? "plugin" : nodeType })
    );
    event.dataTransfer.effectAllowed = "move";
    console.log(`Dragging type: ${nodeType}`);
  };

  const handleNodeSelect = (nodeType: NodeType | string, isPlugin: boolean) => {
    // 创建一个可拖拽的元素
    const dragElement = document.createElement("div");
    dragElement.style.position = "absolute";
    dragElement.style.top = "-1000px";
    dragElement.setAttribute("draggable", "true");

    // 添加拖拽事件监听器
    dragElement.addEventListener("dragstart", (event) => {
      // 使用类型断言来解决类型不匹配的问题
      onDragStart(
        event as unknown as React.DragEvent<HTMLDivElement>,
        nodeType as string,
        isPlugin
      );
    });

    // 将元素添加到 DOM，触发拖拽，然后移除
    document.body.appendChild(dragElement);
    dragElement.draggable = true;
    dragElement.dispatchEvent(new MouseEvent("mousedown"));
    dragElement.dispatchEvent(new MouseEvent("dragstart"));

    // 使用 setTimeout 确保拖拽已经开始后再移除元素
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);
  };

  return (
    <Box
      width="200px"
      padding={4}
      bg={"#fcfcfd"}
      borderTopLeftRadius={"lg"}
      maxH={"full"}
      h="full"
    >
      <NodeMenu onNodeSelect={handleNodeSelect} showStartEnd={false} />
    </Box>
  );
};

export default NodePalette;
