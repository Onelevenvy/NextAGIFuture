// const config = {
//   id: "cd5c08d1-ff69-4188-b37a-8ddc5257a671",
//   name: "Flow Visualization",
//   nodes: [
//     {
//       id: "start-1",
//       type: "start",
//       position: {
//         x: 66,
//         y: 214,
//       },
//       data: {
//         label: "Start",
//       },
//     },
//     {
//       id: "llm-2",
//       type: "llm",
//       position: {
//         x: 435,
//         y: 225,
//       },
//       data: {
//         label: "LLM",
//         model: "glm-4",
//         temperature: 0.7,
//       },
//     },
//     {
//       id: "tool-3",
//       type: "tool",
//       position: {
//         x: 733,
//         y: 557,
//       },
//       data: {
//         label: "Tool",
//         tools: ["calculator"],
//       },
//     },
//     {
//       id: "end-4",
//       type: "end",
//       position: {
//         x: 954,
//         y: 307,
//       },
//       data: {
//         label: "End",
//       },
//     },
//   ],
//   edges: [
//     {
//       id: "reactflow__edge-start-1right-llm-2left",
//       source: "start-1",
//       target: "llm-2",
//       sourceHandle: "right",
//       targetHandle: "left",
//       type: "default",
//     },
//     {
//       id: "reactflow__edge-llm-2right-end-4left",
//       source: "llm-2",
//       target: "end-4",
//       sourceHandle: "right",
//       targetHandle: "left",
//       type: "smoothstep",
//     },
//     {
//       id: "reactflow__edge-llm-2right-tool-3left",
//       source: "llm-2",
//       target: "tool-3",
//       sourceHandle: "right",
//       targetHandle: "left",
//       type: "smoothstep",
//     },
//     {
//       id: "reactflow__edge-tool-3right-llm-2right",
//       source: "tool-3",
//       target: "llm-2",
//       sourceHandle: "right",
//       targetHandle: "right",
//       type: "default",
//     },
//   ],
//   metadata: {
//     entry_point: "llm-2",
//     start_connections: [
//       {
//         target: "llm-2",
//         type: "default",
//       },
//     ],
//     end_connections: [
//       {
//         source: "llm-2",
//         type: "smoothstep",
//       },
//     ],
//   },
// };
const config = {
    "id": "afc2672d-4981-417c-9857-dc2c882e824e",
    "name": "Flow Visualization",
    "nodes": [
      {
        "id": "start-1",
        "type": "start",
        "position": {
          "x": 108,
          "y": 199
        },
        "data": {
          "label": "Start"
        }
      },
      {
        "id": "llm-2",
        "type": "llm",
        "position": {
          "x": 485,
          "y": 230
        },
        "data": {
          "label": "LLM",
          "model": "glm-4",
          "temperature": 0.7
        }
      },
      {
        "id": "llm-3",
        "type": "llm",
        "position": {
          "x": 903,
          "y": 287
        },
        "data": {
          "label": "LLM",
          "model": "glm-4",
          "temperature": 0.7
        }
      },
      {
        "id": "llm-4",
        "type": "llm",
        "position": {
          "x": 1249.0744537815124,
          "y": 403.6915966386555
        },
        "data": {
          "label": "LLM",
          "model": "glm-4",
          "temperature": 0.7
        }
      },
      {
        "id": "end-5",
        "type": "end",
        "position": {
          "x": 1622.224033613445,
          "y": 439.4517647058824
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
        "id": "reactflow__edge-llm-2right-llm-3left",
        "source": "llm-2",
        "target": "llm-3",
        "sourceHandle": "right",
        "targetHandle": "left",
        "type": "default"
      },
      {
        "id": "reactflow__edge-llm-3right-llm-4left",
        "source": "llm-3",
        "target": "llm-4",
        "sourceHandle": "right",
        "targetHandle": "left",
        "type": "default"
      },
      {
        "id": "reactflow__edge-llm-4right-end-5left",
        "source": "llm-4",
        "target": "end-5",
        "sourceHandle": "right",
        "targetHandle": "left",
        "type": "default"
      }
    ],
    "metadata": {
      "entry_point": "llm-2",
      "start_connections": [
        {
          "target": "llm-2",
          "type": "default"
        }
      ],
      "end_connections": [
        {
          "source": "llm-4",
          "type": "default"
        }
      ]
    }
  }
export default config;
