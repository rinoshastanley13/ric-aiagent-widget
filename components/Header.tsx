'use client';

import React, { useState } from 'react';
import { User, LogIn, UserPlus } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { ChevronLeft, ChevronRight, Plus, FileText, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  const { state, dispatch } = useChat();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleUserIconClick = () => {
    if (state.user) {
      // Show profile dropdown
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleNewChat = () => {
    const newConversation = {
      id: Date.now().toString(),
      session_id: 'new',
      title: '+',
      createdAt: new Date(),
      messages: [],
    };
    dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
  };

  return (
    <header className="bg-gray-100 py-2 px-2 flex justify-between items-center border-b border-gray-300 border-2 shadow-lg ring-2 ring-blue-100 ring-inset">
      <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-bold">AI</span>
      </div>
      {!state.isSidebarCollapsed && (
        <div className="flex items-center space-x-3">
          <span className="font-bold text-blue-900">&nbsp;AIProxys</span>
        </div>
      )}
      
      <div className={`flex justify-end space-x-3 ${!state.isSidebarCollapsed ? 'w-34' : 'w-12'}`}>
        <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="w-10 h-8 flex items-center justify-center rounded-lg text-white bg-gray-500 hover:bg-gray-700 cursor-pointer hover:text-white transition-colors"
          >
            
            {state.isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white hover:text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white hover:text-white" />
            )}
            
        </button>
        
      </div>

      {/* Title */}
      <div className="flex-grow-[9] flex justify-center">
        <h1 className="text-2xl font-semibold text-blue-900 text-center">
          What&apos;s in your mind today?
        </h1>
      </div>
      <div className="flex items-center space-x-1">
            {/* Top Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            
            
            <div className="flex items-center space-x-1">
              
            </div>
          </div>
        </div>
      </div>

      {/* User Icon */}
      <div className="flex-grow-[1] flex justify-end">
        <button
          onClick={handleUserIconClick}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-700 cursor-pointer hover:text-white transition-colors"
        >
          <User className="w-6 h-6 text-gray-600 hover:text-white" />
        </button>
      </div>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Login</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID</label>
                <input
                  id="userId"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setIsRegisterModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  Register
                </button>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    <LogIn className="w-4 h-4 inline mr-1" />
                    Login
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Register</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  id = "name"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Email or Phone *</label>
                <input
                  id = "contact"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700">Organization Name</label>
                <input
                  id = "organization"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Short Description</label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};