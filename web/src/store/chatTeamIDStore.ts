// store.ts
import { create } from "zustand";

interface ChatTeamIdStore {
  teamId: string | null;
  setTeamId: (teamId: string | null) => void;
}

const useChatTeamIdStore = create<ChatTeamIdStore>((set) => ({
  teamId: null,
  setTeamId: (teamId) => set(() => ({ teamId })),
}));

export default useChatTeamIdStore;
