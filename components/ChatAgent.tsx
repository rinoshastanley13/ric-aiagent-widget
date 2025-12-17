'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { PromptSuggestions } from './PromptSuggestions';
import { useChat } from '@/context/ChatContext';
import { useChatStream } from '@/hooks/useChatStream';
import { Message, FileAttachment, PromptTemplate } from '@/types';

export const ChatAgent: React.FC = () => {
  const { state, dispatch } = useChat();
  const { streamMessage, isStreaming, error } = useChatStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);

  const currentConversation = state.currentConversation;
  const [inputValue, setInputValue] = useState('');

  // Memoize scrollToBottom to prevent recreating on every render
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Separate effects to prevent infinite loops
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, scrollToBottom]); // Only scroll when messages change

  // Reset state when conversation changes (not when messages change)
  useEffect(() => {
    setHasUserSentMessage(false);
    setInputValue('');
  }, [currentConversation?.id]); // Only reset when conversation ID changes

  const handleSendMessage = useCallback(async (content: string, files: FileAttachment[] = []) => {
    if (!content.trim()) return;

    setHasUserSentMessage(true);

    let conversationId = currentConversation?.id;
    
    // Create new conversation if none exists
    if (!currentConversation) {
      conversationId = Date.now().toString();
      const newConversation = {
        id: conversationId,
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        createdAt: new Date(),
        messages: [],
      };
      dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
    } else {
      conversationId = currentConversation.id;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      files,
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId: conversationId!, message: userMessage },
    });

    // Create initial assistant message with empty content
    const assistantMessageId = Date.now().toString() + '-assistant';
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      content: '', // Start with empty content
      role: 'assistant',
      timestamp: new Date(),
      files: [],
    };

    // Add the initial assistant message immediately
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId: conversationId!, message: initialAssistantMessage },
    });

    // Stream assistant response
    try {
      await streamMessage(
        content, 
        files, 
        (assistantMessage: Message) => {
          // Update the assistant message content as it streams
          
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              conversationId: conversationId!,
              messageId: assistantMessageId,
              content: assistantMessage.content,
            },
          });
        }
      );
    } catch (err) {
      console.error('Error streaming message:', err);
      // Update with error message
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          conversationId: conversationId!,
          messageId: assistantMessageId,
          content: 'Sorry, I encountered an error. Please try again.',
        },
      });
    }
  }, [currentConversation, dispatch, streamMessage]);

  const handlePromptSelect = useCallback((prompt: PromptTemplate) => {
    console.log('Prompt selected:', prompt);
    // Set the prompt content to ChatInput by calling handleSendMessage
    //handleSendMessage(prompt.content);
    setInputValue(prompt.content);
  }, []);

  // Safe check for messages
  const hasMessages = currentConversation?.messages && currentConversation.messages.length > 0;
  
  // Show messages if user has sent a message OR if we have existing messages
  const shouldShowMessages = hasUserSentMessage || hasMessages;

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {!shouldShowMessages ? (
          <PromptSuggestions onPromptSelect={handlePromptSelect} />
        ) : (
          <div className="max-w-4xl mx-auto py-6 px-4">
            {/* Render all messages */}
            {currentConversation?.messages?.map((message, index) => (
              <MessageBubble 
                key={message.id || index}
                message={message}
                isStreaming={isStreaming && message.role === 'assistant' && index === currentConversation.messages.length - 1}
              />
            ))}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-300/10 rounded-t-2xl relative">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isStreaming}
            inputValue={inputValue}
            onInputChange={setInputValue}
          />
      </div>

      {/* Footer */}
      <footer className="bg-white py-2 shadow-lg ring-1 ring-blue-100 ring-inset">
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium">
            Powered by <span className="text-blue-600">Basha@AIProxy</span>
          </p>
        </div>
      </footer>
    </div>
  );
};