config_with_2_tool_router = {
    "id": "26f834ee-b8cd-46ad-b655-fd20ba27d8ba",
    "name": "Flow Visualization",
    "nodes": [
        {
            "id": "start-1",
            "type": "start",
            "position": {"x": 88, "y": 172},
            "data": {"label": "Start"},
        },
        {
            "id": "llm-2",
            "type": "llm",
            "position": {"x": 452, "y": 182},
            "data": {
                "label": "LLM",
                "model": "glm-4",
                "temperature": 0.7,
            },
        },
        {
            "id": "tool-3",
            "type": "tool",
            "position": {"x": 766, "y": 484},
            "data": {"label": "Tool", "tools": ["calculator"]},
        },
        {
            "id": "tool-4",
            "type": "tool",
            "position": {"x": 847, "y": 116},
            "data": {"label": "Tool", "tools": ["tavilysearch"]},
        },
        {
            "id": "end-5",
            "type": "end",
            "position": {"x": 1216, "y": 287},
            "data": {"label": "End"},
        },
    ],
    "edges": [
        {
            "id": "reactflow__edge-start-1right-llm-2left",
            "source": "start-1",
            "target": "llm-2",
            "sourceHandle": "right",
            "targetHandle": "left",
            "type": "default",
        },
        {
            "id": "reactflow__edge-llm-2right-tool-3left",
            "source": "llm-2",
            "target": "tool-3",
            "sourceHandle": "right",
            "targetHandle": "left",
            "type": "smoothstep",
        },
        {
            "id": "reactflow__edge-llm-2right-tool-4left",
            "source": "llm-2",
            "target": "tool-4",
            "sourceHandle": "right",
            "targetHandle": "left",
            "type": "smoothstep",
        },
        {
            "id": "reactflow__edge-llm-2right-end-5left",
            "source": "llm-2",
            "target": "end-5",
            "sourceHandle": "right",
            "targetHandle": "left",
            "type": "smoothstep",
        },
        {
            "id": "reactflow__edge-tool-3right-llm-2right",
            "source": "tool-3",
            "target": "llm-2",
            "sourceHandle": "right",
            "targetHandle": "right",
            "type": "default",
        },
        {
            "id": "reactflow__edge-tool-4right-llm-2right",
            "source": "tool-4",
            "target": "llm-2",
            "sourceHandle": "right",
            "targetHandle": "right",
            "type": "default",
        },
    ],
    "metadata": {
        "entry_point": "llm-2",
        "start_connections": [{"target": "llm-2", "type": "default"}],
        "end_connections": [{"source": "llm-2", "type": "smoothstep"}],
    },
}


config_with_tools = {
    "id": "b136b7fe-3ddb-4ced-8b64-cc8065c566a2",
    "name": "Flow Visualization",
    "nodes": [
        {
            "id": "llm-1",
            "type": "llm",
            "position": {"x": 361, "y": 178},
            "data": {
                "label": "LLM",
                "model": "glm-4",
                "temperature": 0.7,
            },
        },
        {
            "id": "tool-2",
            "type": "tool",
            "position": {"x": 558, "y": 368},
            "data": {
                "label": "Tool",
                "tools": ["calculator", "tavilysearch"],
            },
        },
        {
            "id": "start-3",
            "type": "start",
            "position": {"x": 117, "y": 233},
            "data": {"label": "Start"},
        },
        {
            "id": "end-4",
            "type": "end",
            "position": {"x": 775, "y": 133},
            "data": {"label": "End"},
        },
    ],
    "edges": [
        {
            "id": "reactflow__edge-start-3right-llm-1left",
            "source": "start-3",
            "target": "llm-1",
            "sourceHandle": "right",
            "targetHandle": "left",
            "type": "default",
        },
        {
            "id": "reactflow__edge-llm-1right-tool-2left",
            "source": "llm-1",
            "target": "tool-2",
            "sourceHandle": "right",
            "targetHandle": "left",
            "type": "smoothstep",
        },
        {
            "id": "reactflow__edge-llm-1right-end-4left",
            "source": "llm-1",
            "target": "end-4",
            "sourceHandle": "right",
            "targetHandle": "left",
            "type": "smoothstep",
        },
        {
            "id": "reactflow__edge-tool-2right-llm-1right",
            "source": "tool-2",
            "target": "llm-1",
            "sourceHandle": "right",
            "targetHandle": "right",
            "type": "default",
        },
    ],
    "metadata": {
        "entry_point": "llm-1",
        "start_connections": [{"target": "llm-1", "type": "default"}],
        "end_connections": [{"source": "llm-1", "type": "smoothstep"}],
    },
}

config_with_no_tools = {
    "id": "4613d429-88bb-4fe5-9b45-b5a5d3795dbf",
    "name": "Flow Visualization",
    "nodes": [
        {
            "id": "start-1",
            "type": "start",
            "position": {"x": 103, "y": 138},
            "data": {"label": "Start"},
        },
        {
            "id": "llm-2",
            "type": "llm",
            "position": {"x": 562, "y": 166},
            "data": {"label": "LLM", "model": "glm-4", "temperature": 0.7},
        },
        {
            "id": "end-3",
            "type": "end",
            "position": {"x": 1058, "y": 224},
            "data": {"label": "End"},
        },
    ],
    "edges": [
        {
            "id": "reactflow__edge-start-1right-llm-2left",
            "source": "start-1",
            "target": "llm-2",
            "sourceHandle": "right",
            "targetHandle": "left",
            "type": "default",
        },
        {
            "id": "reactflow__edge-llm-2right-end-3left",
            "source": "llm-2",
            "target": "end-3",
            "sourceHandle": "right",
            "targetHandle": "left",
            "type": "default",
        },
    ],
    "metadata": {
        "entry_point": "llm-2",
        "start_connections": [{"target": "llm-2", "type": "default"}],
        "end_connections": [{"source": "llm-2", "type": "default"}],
    },
}

config_with_3_llm ={
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