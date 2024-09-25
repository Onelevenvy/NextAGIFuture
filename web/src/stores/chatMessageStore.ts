import type { ChatResponse } from "@/client";
import { create } from "zustand";

interface ChatMessageState {
  messages: ChatResponse[];
  setMessages: (
    update: ChatResponse[] | ((prevMessages: ChatResponse[]) => ChatResponse[]),
  ) => void;
}

const useChatMessageStore = create<ChatMessageState>((set) => ({
  messages: [],
  setMessages: (update) =>
    set((state) => ({
      messages: typeof update === "function" ? update(state.messages) : update,
    })),
}));

export default useChatMessageStore;
