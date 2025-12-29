'use client';

import React from 'react';
import { Plus, FileText, Clock } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

// Mock data - replace with actual data from your backend
const mockPrompts = [
  { id: '1', title: 'Approval Requests', category: 'actions' },
  { id: '2', title: 'Pending Compliances', category: 'actions' },
  { id: '3', title: 'Dashboard', category: 'actions' },
];

const mockHistory = [
  { id: '1', title: 'GST Compliance Query', createdAt: new Date() },
  { id: '2', title: 'Corporate Tax Discussion', createdAt: new Date() },
];

  
export const UserMenu: React.FC = () => {
  const { state, dispatch } = useChat();

  const handleNewChat = () => {
    const newConversation = {
      id: Date.now().toString(),
      session_id: 'new',
      title: 'New Chat',
      createdAt: new Date(),
      messages: [],
    };
    dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
  };

  const handlePromptClick = (prompt: { title: string; content?: string }) => {
    // This would pre-fill the chat input
    console.log('Prompt selected:', prompt);
  };

  return (
    <div className={`bg-white/80 backdrop-blur-lg border-r border-gray-200/60 h-full flex flex-col transition-all duration-300 shadow-xl ${
      state.isSidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Top Section */}
      <div className="p-4 ">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center space-x-1">
            {!state.isSidebarCollapsed && (
              <button
                onClick={handleNewChat}
                className="px-15 py-2 rounded-sm bg-gray-400 hover:bg-gray-700 cursor-pointer text-white transition-colors text-sm font-medium"
                title="New Chat"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 border border-white-500 rounded-full text-white-700">+</span>&nbsp; New Chat
              </button>
            )}
            
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto ">
        {/* My Prompts Section */}
        {!state.isSidebarCollapsed && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">My Prompts</h3>
            <div className="space-y-2 ">
              {mockPrompts.map(prompt => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt)}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-200 transition-colors text-sm text-gray-700 flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="truncate">{prompt.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat History Section */}
        {!state.isSidebarCollapsed && (
          <div className="p-4 ">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Chat History</h3>
            <div className="space-y-2">
              {mockHistory.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => {
                    // Load conversation
                    console.log('Load chat:', chat.id);
                  }}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-200 transition-colors text-sm text-gray-700 flex items-center space-x-2"
                >
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="truncate flex-1">{chat.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed View */}
        {state.isSidebarCollapsed && (
          <div className="py-4 space-y-4">
            <button
              onClick={handleNewChat}
              className="w-full flex justify-center p-2 hover:bg-gray-200 transition-colors"
              title="New Chat"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              {mockPrompts.slice(0, 3).map(prompt => (
                <button
                  key={prompt.id}
                  title={prompt.title}
                  className="w-full flex justify-center p-2 hover:bg-gray-200 transition-colors"
                >
                  <FileText className="w-5 h-5 text-gray-500" />
                </button>
              ))}

              {mockHistory.map(chat => (
                <button
                  key={chat.id}
                  title={chat.title}
                  onClick={() => {
                    // Load conversation
                    console.log('Load chat:', chat.id);
                  }}
                  className="w-full flex justify-center p-2 hover:bg-gray-200 transition-colors"
                >
                  <Clock className="w-5 h-5 text-gray-500" />
                 
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};