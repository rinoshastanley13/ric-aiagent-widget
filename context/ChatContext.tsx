'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ChatState, Conversation, Message, User, PromptTemplate } from '@/types';

type ChatAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: Conversation | null }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: string; messageId: string; content: string } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'SHOW_PROMPT_SUGGESTIONS'; payload: boolean }; // Add this

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  isStreaming: false,
  user: null,
  isSidebarCollapsed: false,
  showPromptSuggestions: false, // Add this
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        currentConversation: action.payload,
        showPromptSuggestions: true, // Show suggestions when new conversation is added
      };
    
    case 'SET_CURRENT_CONVERSATION':
      return { ...state, currentConversation: action.payload };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? { ...conv, messages: [...conv.messages, action.payload.message] }
            : conv
        ),
        currentConversation: 
          state.currentConversation?.id === action.payload.conversationId
            ? {
                ...state.currentConversation,
                messages: [...state.currentConversation.messages, action.payload.message],
              }
            : state.currentConversation,
      };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === action.payload.messageId
                    ? { ...msg, content: action.payload.content }
                    : msg
                ),
              }
            : conv
        ),
        currentConversation: 
          state.currentConversation?.id === action.payload.conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(msg =>
                  msg.id === action.payload.messageId
                    ? { ...msg, content: action.payload.content }
                    : msg
                ),
              }
            : state.currentConversation,
      };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarCollapsed: !state.isSidebarCollapsed };
    
    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        currentConversation: 
          state.currentConversation?.id === action.payload ? null : state.currentConversation,
      };
    
    default:
      return state;
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};