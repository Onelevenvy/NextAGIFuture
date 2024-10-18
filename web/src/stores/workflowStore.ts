import { create } from "zustand";

interface WorkflowState {
  activeNodeName: string | null;
  setActiveNodeName: (name: string | null) => void;
}

const useWorkflowStore = create<WorkflowState>((set) => ({
  activeNodeName: null,
  setActiveNodeName: (name) => set({ activeNodeName: name }),
}));

export default useWorkflowStore;
