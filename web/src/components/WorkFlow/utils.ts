import { Node } from 'reactflow';

export const calculateEdgeCenter = (sourceNode: Node, targetNode: Node): { x: number, y: number } => {
  const sourceX = sourceNode.position.x + (sourceNode.width ?? 0) / 2;
  const sourceY = sourceNode.position.y + (sourceNode.height ?? 0) / 2;
  const targetX = targetNode.position.x + (targetNode.width ?? 0) / 2;
  const targetY = targetNode.position.y + (targetNode.height ?? 0) / 2;

  return {
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2
  };
};