import type { ConnectionLineComponentProps } from "reactflow";
import { getSmoothStepPath } from "reactflow";

const ConnectionLine = ({
  fromX,
  fromY,
  toX,
  toY,
}: ConnectionLineComponentProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    borderRadius: 10, // Adjust the border radius for the smooth step curve
  });

  return (
    <g>
      <path
        fill="none"
        stroke={"#009688"}
        strokeWidth={2}
        className="animated"
        d={edgePath}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={2}
        stroke={"#009688"}
        strokeWidth={10}
      />
    </g>
  );
};

export default ConnectionLine;
