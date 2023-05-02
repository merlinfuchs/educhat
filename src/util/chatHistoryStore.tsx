import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HistoryMessage {
  role: "user" | "bot";
  message: string;
}

interface ChatHistoryStore {
  messages: HistoryMessage[];
  addMessage: (message: HistoryMessage) => void;
  clearMessages: () => void;
}

export const useChatHistoryStore = create<ChatHistoryStore>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      clearMessages: () => set({ messages: [] }),
    }),
    { name: "chat-history", version: 1 }
  )
);
