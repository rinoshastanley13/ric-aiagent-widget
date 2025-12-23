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
  const backendSessionIds = useRef<Record<string, string>>({});

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

  // Auto-trigger welcome message when chat first opens (after registration)
  useEffect(() => {
    // Only trigger if we have a user, no conversation yet, and haven't sent a message
    const hasUser = state.user?.email || localStorage.getItem('widget_user');
    const noConversation = !currentConversation;
    const noMessages = !hasUserSentMessage;

    if (hasUser && noConversation && noMessages) {
      const initWelcome = async () => {
        // Get user email
        let userEmail = state.user?.email;
        if (!userEmail) {
          try {
            const stored = localStorage.getItem('widget_user');
            if (stored) userEmail = JSON.parse(stored).email;
          } catch (e) { }
        }

        if (!userEmail) return;

        // Create new conversation
        const conversationId = Date.now().toString();
        const newConversation = {
          id: conversationId,
          title: 'New Chat',
          createdAt: new Date(),
          messages: [],
        };
        dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });

        // Create assistant message placeholder
        const assistantMessageId = Date.now().toString() + '-assistant';
        const initialAssistantMessage: Message = {
          id: assistantMessageId,
          content: '',
          role: 'assistant',
          timestamp: new Date(),
          files: [],
        };

        dispatch({
          type: 'ADD_MESSAGE',
          payload: { conversationId: conversationId, message: initialAssistantMessage },
        });

        // Stream welcome response
        try {
          await streamMessage(
            "Hello",
            [],
            (assistantMessage: Message) => {
              dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                  conversationId: conversationId,
                  messageId: assistantMessageId,
                  content: assistantMessage.content,
                  choices: assistantMessage.choices,
                },
              });
            },
            userEmail,
            'new',
            true,
            (newSessionId: string) => {
              backendSessionIds.current[conversationId] = newSessionId;
            },
            assistantMessageId // Pass the messageId to useChatStream
          );
        } catch (e) {
          console.error("Welcome message failed", e);
        }
      };

      const timer = setTimeout(() => {
        initWelcome();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [state.user?.email, currentConversation, hasUserSentMessage, dispatch, streamMessage]);


  const handleSendMessage = useCallback(async (content: string, files: FileAttachment[] = []) => {
    if (!content.trim()) return;

    setHasUserSentMessage(true);

    // Get User Email
    let userEmail = state.user?.email;
    if (!userEmail) {
      // Fallback to local storage if context not yet populated (though page.tsx handles this)
      try {
        const stored = localStorage.getItem('widget_user');
        if (stored) userEmail = JSON.parse(stored).email;
      } catch (e) { }
    }

    if (!userEmail) {
      console.error("No user email found, cannot send message");
      // Optionally dispatch an error or force registration
      return;
    }

    let conversationId = currentConversation?.id;
    let isNewChat = false;

    // Create new conversation if none exists
    if (!currentConversation) {
      conversationId = Date.now().toString();
      isNewChat = true;
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

    // Determine Backend Session ID
    const backendId = backendSessionIds.current[conversationId!] || 'new'; // Use 'new' if not mapped yet

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
              choices: assistantMessage.choices,
            },
          });
        },
        userEmail,
        backendId,
        isNewChat,
        (newSessionId: string) => {
          // Callback when backend returns session ID
          if (conversationId) {
            backendSessionIds.current[conversationId] = newSessionId;
          }
        },
        assistantMessageId // Pass the messageId so useChatStream uses the same ID
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

  const handleChoiceSelect = useCallback(async (value: string, messageId: string) => {
    // Send the selected choice as a user message
    await handleSendMessage(value);

    // Clear choices from the message to hide buttons
    if (currentConversation) {
      const msg = currentConversation.messages.find(m => m.id === messageId);
      if (msg) {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            conversationId: currentConversation.id,
            messageId: messageId,
            content: msg.content,
          },
        });
      }
    }
  }, [currentConversation, dispatch, handleSendMessage]);

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
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#f8fafc',
        borderRadius: '30px'
      }}
    >
      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          background: '#f8fafc',
          borderRadius: '30px'
        }}
        className="hide-scrollbar"
      >
        {!shouldShowMessages ? (
          <PromptSuggestions onPromptSelect={handlePromptSelect} />
        ) : (
          <div>
            {/* Render all messages */}
            {currentConversation?.messages?.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message}
                isStreaming={isStreaming && message.role === 'assistant' && index === currentConversation.messages.length - 1}
                onChoiceSelect={(value) => handleChoiceSelect(value, message.id)}
              />
            ))}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div
        style={{
          padding: '16px 20px',
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          borderRadius: '0px 0px 30px 30px'
        }}
      >
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
          inputValue={inputValue}
          onInputChange={setInputValue}
        />
      </div>
    </div>
  );
};