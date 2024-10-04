import { Node } from 'reactflow';

export const getEdgeParams = (source: Node, target: Node) => {
  const sourceCenter = {
    x: source.position.x + (source.width || 0) / 2,
    y: source.position.y + (source.height || 0) / 2,
  };

  const targetCenter = {
    x: target.position.x + (target.width || 0) / 2,
    y: target.position.y + (target.height || 0) / 2,
  };

  const sx = sourceCenter.x;
  const sy = sourceCenter.y;
  const tx = targetCenter.x;
  const ty = targetCenter.y;

  return {
    sx,
    sy,
    tx,
    ty,
  };
};