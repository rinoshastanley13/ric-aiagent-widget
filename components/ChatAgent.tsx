'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { PromptSuggestions } from './PromptSuggestions';
import { useChat } from '@/context/ChatContext';
import { useChatStream } from '@/hooks/useChatStream';
import { Message, FileAttachment, PromptTemplate } from '@/types';

interface ChatAgentProps {
  apiKey: string;
  provider?: string;
}

export const ChatAgent: React.FC<ChatAgentProps> = ({ apiKey, provider = 'botpress' }) => {
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

        // Create new conversation (local placeholder)
        const localConversationId = Date.now().toString();
        const newConversation = {
          id: localConversationId,
          session_id: state.currentSessionId || '',
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
          payload: { conversationId: localConversationId, message: initialAssistantMessage },
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
                  conversationId: localConversationId,
                  messageId: assistantMessageId,
                  content: assistantMessage.content,
                  choices: assistantMessage.choices,
                },
              });
            },
            userEmail,
            state.currentSessionId,
            'new', // Use 'new' for threadId within session
            true, // isNewChat (new thread)
            apiKey,
            provider,
            (newSessionId, newThreadId) => {
              dispatch({
                type: 'SET_IDS',
                payload: {
                  sessionId: newSessionId,
                  threadId: newThreadId,
                  conversationId: localConversationId
                }
              });
            },
            assistantMessageId
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
  }, [state.user?.email, currentConversation, hasUserSentMessage, dispatch, streamMessage, state.currentSessionId]);


  const handleSendMessage = useCallback(async (content: string, files: FileAttachment[] = []) => {
    if (!content.trim()) return;

    setHasUserSentMessage(true);

    // Get User Email
    let userEmail = state.user?.email;
    if (!userEmail) {
      try {
        const stored = localStorage.getItem('widget_user');
        if (stored) userEmail = JSON.parse(stored).email;
      } catch (e) { }
    }

    if (!userEmail) {
      console.error("No user email found, cannot send message");
      return;
    }

    let localConversationId = currentConversation?.id;
    let isNewChat = false;

    // Create new conversation if none exists
    if (!currentConversation) {
      localConversationId = Date.now().toString();
      isNewChat = true;
      const newConversation = {
        id: localConversationId,
        session_id: state.currentSessionId || '',
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        createdAt: new Date(),
        messages: [],
      };
      dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
    } else {
      localConversationId = currentConversation.id;
    }

    const backendSessionId = state.currentSessionId;
    // If currentConversation.id matches state.currentThreadId, it's an existing thread
    const backendThreadId = currentConversation?.id === state.currentThreadId ? state.currentThreadId : 'new';

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
      payload: { conversationId: localConversationId!, message: userMessage },
    });

    // Create initial assistant message
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
      payload: { conversationId: localConversationId!, message: initialAssistantMessage },
    });

    // Stream assistant response
    try {
      await streamMessage(
        content,
        files,
        (assistantMessage: Message) => {
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              conversationId: localConversationId!,
              messageId: assistantMessageId,
              content: assistantMessage.content,
              choices: assistantMessage.choices,
            },
          });
        },
        userEmail,
        backendSessionId,
        backendThreadId,
        isNewChat,
        apiKey,
        provider,
        (newSessionId, newThreadId) => {
           dispatch({
            type: 'SET_IDS',
            payload: {
              sessionId: newSessionId,
              threadId: newThreadId,
              conversationId: localConversationId!
            }
          });
        },
        assistantMessageId
      );
    } catch (err) {
      console.error('Error streaming message:', err);
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          conversationId: localConversationId!,
          messageId: assistantMessageId,
          content: 'Sorry, I encountered an error. Please try again.',
        },
      });
    }
  }, [currentConversation, dispatch, streamMessage, state.currentSessionId, state.currentThreadId, state.user?.email]);

  const handleChoiceSelect = useCallback(async (value: string, messageId: string) => {
    await handleSendMessage(value);

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
    setInputValue(prompt.content);
  }, []);

  const hasMessages = currentConversation?.messages && currentConversation.messages.length > 0;
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