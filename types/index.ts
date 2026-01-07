export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: FileAttachment[];
  choices?: Array<{ title: string; value: string }>;
  acts?: ActsData;
}

export interface ActsData {
  total: number;
  filters: {
    state: string;
    industry: string;
    employee_size: string;
  };
  acts: Array<{
    id: number;
    legislative_area: string;
    central_acts: string;
    state_acts: string;
    [key: string]: any;
  }>;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
}

export interface Conversation {
  id: string; // Map to thread_id
  thread_id?: string;
  session_id: string;
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
  description?: string;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentThreadId: string | null;
  currentSessionId: string | null;
  currentProvider: string;
  isStreaming: boolean;
  user: User | null;
  isSidebarCollapsed: boolean;
  showPromptSuggestions: boolean;
}