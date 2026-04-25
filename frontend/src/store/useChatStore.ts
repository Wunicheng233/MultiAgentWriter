import { create } from 'zustand'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
}

interface ChatState {
  messages: ChatMessage[]
  isTyping: boolean
  inputText: string
  addMessage: (message: ChatMessage) => void
  setIsTyping: (typing: boolean) => void
  setInputText: (text: string) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  inputText: '',
  addMessage: (message) =>
    set((state) => {
      // Prevent duplicate messages by ID
      if (state.messages.some((m) => m.id === message.id)) {
        console.warn(`Message with ID ${message.id} already exists`)
        return state
      }
      return {
        messages: [...state.messages, message],
      }
    }),
  setIsTyping: (typing) => set({ isTyping: typing }),
  setInputText: (text) => set({ inputText: text }),
  clearMessages: () => set({ messages: [] }),
}))
