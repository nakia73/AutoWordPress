import { create } from 'zustand';
import type { FocusTarget } from './focus-store';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    focusChange?: FocusTarget;
    actionTaken?: string;
    isError?: boolean;
  };
}

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;

  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, content: string) => void;
  appendToLastMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  clearMessages: () => void;
  removeMessage: (id: string) => void;
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,

  addMessage: (msg) => {
    const id = generateId();
    const newMessage: ChatMessage = {
      ...msg,
      id,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));

    return id;
  },

  updateMessage: (id, content) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content } : msg
      ),
    }));
  },

  appendToLastMessage: (content) => {
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        const lastIndex = messages.length - 1;
        messages[lastIndex] = {
          ...messages[lastIndex],
          content: messages[lastIndex].content + content,
        };
      }
      return { messages };
    });
  },

  setStreaming: (streaming) => {
    set({ isStreaming: streaming });
  },

  clearMessages: () => {
    set({ messages: [], isStreaming: false });
  },

  removeMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    }));
  },
}));
