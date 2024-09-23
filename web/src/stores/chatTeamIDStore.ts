// store.ts
import { create } from "zustand";

interface ChatTeamIdStore {
  teamId: number;
  setTeamId: (teamId: number) => void;
}

const useChatTeamIdStore = create<ChatTeamIdStore>((set) => ({
  teamId: 1,
  setTeamId: (teamId) => set(() => ({ teamId })),
}));

export default useChatTeamIdStore;
