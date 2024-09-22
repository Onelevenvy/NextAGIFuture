
const configsss1 = {
  id: "c01b7af2-04a5-40ac-9df0-97a442f943c1",
  name: "Flow Visualization",
  nodes: [
    {
      id: "start-1",
      type: "start",
      position: {
        x: 67,
        y: 148,
      },
      data: {
        label: "Start",
      },
    },
    {
      id: "llm-2",
      type: "llm",
      position: {
        x: 396,
        y: 178,
      },
      data: {
        label: "LLM",
        model: "glm-4",
        temperature: 0.7,
      },
    },
    {
      id: "llm-3",
      type: "llm",
      position: {
        x: 776,
        y: 256,
      },
      data: {
        label: "LLM",
        model: "glm-4",
        temperature: 0.7,
      },
    },
    {
      id: "tool-4",
      type: "tool",
      position: {
        x: 932,
        y: 128,
      },
      data: {
        label: "Tool",
        tools: ["calculator"],
      },
    },
    {
      id: "end-5",
      type: "end",
      position: {
        x: 1107,
        y: 473,
      },
      data: {
        label: "End",
      },
    },
  ],
  edges: [
    {
      id: "reactflow__edge-start-1right-llm-2left",
      source: "start-1",
      target: "llm-2",
      sourceHandle: "right",
      targetHandle: "left",
      type: "default",
    },
    {
      id: "reactflow__edge-llm-2right-llm-3left",
      source: "llm-2",
      target: "llm-3",
      sourceHandle: "right",
      targetHandle: "left",
      type: "default",
    },
    {
      id: "reactflow__edge-llm-3right-tool-4left",
      source: "llm-3",
      target: "tool-4",
      sourceHandle: "right",
      targetHandle: "left",
      type: "smoothstep",
    },
    {
      id: "reactflow__edge-tool-4right-llm-3right",
      source: "tool-4",
      target: "llm-3",
      sourceHandle: "right",
      targetHandle: "right",
      type: "default",
    },
    {
      id: "reactflow__edge-llm-3right-end-5left",
      source: "llm-3",
      target: "end-5",
      sourceHandle: "right",
      targetHandle: "left",
      type: "smoothstep",
    },
  ],
  metadata: {
    entry_point: "llm-2",
    start_connections: [
      {
        target: "llm-2",
        type: "default",
      },
    ],
    end_connections: [
      {
        source: "llm-3",
        type: "smoothstep",
      },
    ],
  },
};
export  {configsss1};
const configsss={
  "id": "26f834ee-b8cd-46ad-b655-fd20ba27d8ba",
  "name": "Flow Visualization",
  "nodes": [
      {
          "id": "start-1",
          "type": "start",
          "position": {
              "x": 88,
              "y": 172
          },
          "data": {
              "label": "Start"
          }
      },
      {
          "id": "llm-2",
          "type": "llm",
          "position": {
              "x": 452,
              "y": 182
          },
          "data": {
              "label": "LLM",
              "model": "glm-4-flash",
              "temperature": 0.7
          }
      },
      {
          "id": "tool-3",
          "type": "tool",
          "position": {
              "x": 766,
              "y": 484
          },
          "data": {
              "label": "Tool",
              "tools": ["calculator"]
          }
      },
      {
          "id": "tool-4",
          "type": "tool",
          "position": {
              "x": 847,
              "y": 116
          },
          "data": {
              "label": "Tool",
              "tools": ["tavilysearch", "wikipedia"]
          }
      },
      {
          "id": "end-5",
          "type": "end",
          "position": {
              "x": 1216,
              "y": 287
          },
          "data": {
              "label": "End"
          }
      }
  ],
  "edges": [
      {
          "id": "reactflow__edge-start-1right-llm-2left",
          "source": "start-1",
          "target": "llm-2",
          "sourceHandle": "right",
          "targetHandle": "left",
          "type": "default"
      },
      {
          "id": "reactflow__edge-llm-2right-tool-3left",
          "source": "llm-2",
          "target": "tool-3",
          "sourceHandle": "right",
          "targetHandle": "left",
          "type": "smoothstep"
      },
      {
          "id": "reactflow__edge-llm-2right-tool-4left",
          "source": "llm-2",
          "target": "tool-4",
          "sourceHandle": "right",
          "targetHandle": "left",
          "type": "smoothstep"
      },
      {
          "id": "reactflow__edge-llm-2right-end-5left",
          "source": "llm-2",
          "target": "end-5",
          "sourceHandle": "right",
          "targetHandle": "left",
          "type": "smoothstep"
      },
      {
          "id": "reactflow__edge-tool-3right-llm-2right",
          "source": "tool-3",
          "target": "llm-2",
          "sourceHandle": "right",
          "targetHandle": "right",
          "type": "default"
      },
      {
          "id": "reactflow__edge-tool-4right-llm-2right",
          "source": "tool-4",
          "target": "llm-2",
          "sourceHandle": "right",
          "targetHandle": "right",
          "type": "default"
      }
  ],
  "metadata": {
      "entry_point": "llm-2",
      "start_connections": [{
          "target": "llm-2",
          "type": "default"
      }],
      "end_connections": [{
          "source": "llm-2",
          "type": "smoothstep"
      }]
  }
}


export default configsss;