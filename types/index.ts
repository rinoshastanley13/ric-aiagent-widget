export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
  bio?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'compliance' | 'actions' | 'general';
  content: string;
  icon: string;
  description?: string; // Add this line
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isStreaming: boolean;
  user: User | null;
  isSidebarCollapsed: boolean;
  showPromptSuggestions: boolean;
}