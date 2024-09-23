import { create } from "zustand";
import { GraphsService } from "@/client/services/GraphsService";
import { ApiError, GraphsOut } from "@/client";

interface GraphState {
  graphs: any; // 替换为实际的 graphs 类型
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  hasAttemptedFetch: boolean;
  fetchGraphs: (teamId: number) => Promise<void>;
  createDefaultGraph: (teamId: number) => Promise<void>;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  graphs: null,
  isLoading: false,
  isError: false,
  error: null,
  hasAttemptedFetch: false,
  fetchGraphs: async (teamId: number) => {
    if (get().hasAttemptedFetch) return;
    set({ isLoading: true, hasAttemptedFetch: true });
    try {
      const response = await GraphsService.readGraphs({ teamId });
      set({ graphs: response, isLoading: false, isError: false, error: null });
    } catch (error) {
      set({ isLoading: false, isError: true, error: error as ApiError });
    }
  },
  createDefaultGraph: async (teamId: number) => {
    try {
      const defaultConfig = {
        id: "b48a5f20-5d99-4b2e-972d-cb811a208e2a",
        name: "Flow Visualization",
        nodes: [
          {
            id: "start",
            type: "start",
            position: { x: 88, y: 172 },
            data: { label: "Start" },
          },
          {
            id: "end",
            type: "end",
            position: { x: 891.4025316455695, y: 221.5569620253164 },
            data: { label: "End" },
          },
          {
            id: "llm",
            type: "llm",
            position: { x: 500.04430379746833, y: 219.95189873417723 },
            data: { label: "LLM", model: "glm-4-flash", temperature: 0.1 },
          },
        ],
        edges: [
          {
            id: "reactflow__edge-start-1right-llm-3left",
            source: "start",
            target: "llm",
            sourceHandle: "right",
            targetHandle: "left",
            type: "default",
          },
          {
            id: "reactflow__edge-llm-3right-end-5left",
            source: "llm",
            target: "end",
            sourceHandle: "right",
            targetHandle: "left",
            type: "default",
          },
        ],
        metadata: {
          entry_point: "llm",
          start_connections: [{ target: "llm", type: "default" }],
          end_connections: [{ source: "llm", type: "default" }],
        },
      };
      const validJsonConfig = JSON.parse(JSON.stringify(defaultConfig));
      const uniqueName = `DefaultGraph_${teamId}_${Date.now()}`;
      await GraphsService.createGraph({
        teamId: Number(teamId),
        requestBody: {
          name: uniqueName,
          description: "自动创建的默认图表",
          config: validJsonConfig,
          created_at: new Date().toISOString(),
        },
      });
      await get().fetchGraphs(teamId);
    } catch (error) {
      set({ isError: true, error: error as ApiError });
    }
  },
}));
