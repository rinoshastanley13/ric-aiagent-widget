'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { AILoader } from './AILoader';
import { useChat } from '@/context/ChatContext';
import { useChatStream } from '@/hooks/useChatStream';
import { Message, FileAttachment, PromptTemplate } from '@/types';

interface ChatAgentProps {
  apiKey: string;
  appId?: string;
  provider?: string; // Optional, defaults to context provider
}

export const ChatAgent: React.FC<ChatAgentProps> = ({ apiKey, appId, provider: propProvider }) => {
  const { state, dispatch } = useChat();
  const { streamMessage, isStreaming, error } = useChatStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);

  const currentConversation = state.currentConversation;
  const [inputValue, setInputValue] = useState('');

  // Track message count for VALID_WIDGET_ID to capture name and email
  const isValidWidget = appId === 'VALID_WIDGET_ID';
  const [userMessageCount, setUserMessageCount] = useState(() => {
    if (isValidWidget) {
      const stored = localStorage.getItem('valid_widget_message_count');
      return stored ? parseInt(stored, 10) : 0;
    }
    return 0;
  });

  // Handler for when backend signals provider switch
  const handleProviderSwitch = useCallback((newProvider: string) => {
    console.log(`Provider switch requested: ${state.currentProvider} -> ${newProvider}`);

    // Add a system message indicating the switch
    if (currentConversation) {
      const transitionMessage: Message = {
        id: Date.now().toString() + '-system',
        content: '🤖 Switching to AI Assistant mode...',
        role: 'assistant',
        timestamp: new Date(),
        files: [],
      };

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { conversationId: currentConversation.id, message: transitionMessage },
      });
    }

    // Update provider in context
    dispatch({ type: 'SET_PROVIDER', payload: newProvider });
  }, [currentConversation, dispatch, state.currentProvider]);

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
                  acts: assistantMessage.acts,
                  dailyUpdates: assistantMessage.dailyUpdates,
                },
              });
            },
            userEmail,
            state.currentSessionId,
            'new', // Use 'new' for threadId within session
            true, // isNewChat (new thread)
            apiKey,
            propProvider || state.currentProvider,
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
            assistantMessageId,
            appId,
            handleProviderSwitch
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


  const handleSendMessage = useCallback(async (content: string, files: FileAttachment[] = [], overrideProvider?: string) => {
    if (!content.trim()) return;

    // Debug: Log which provider we're using
    const effectiveProvider = overrideProvider || propProvider || state.currentProvider;
    console.log(`[ChatAgent] Sending message with provider: ${effectiveProvider} (override: ${overrideProvider}, prop: ${propProvider}, state: ${state.currentProvider})`);

    // Special handling for VALID_WIDGET_ID: capture first two messages as name and email
    if (isValidWidget && userMessageCount < 2) {
      const currentCount = userMessageCount;

      if (currentCount === 0) {
        // First message is the name
        const userData = { name: content.trim() };
        localStorage.setItem('valid_widget_user_data', JSON.stringify(userData));
        console.log('[VALID_WIDGET_ID] Saved name:', content.trim());

        // Increment counter
        const newCount = 1;
        setUserMessageCount(newCount);
        localStorage.setItem('valid_widget_message_count', newCount.toString());
      } else if (currentCount === 1) {
        // Second message is the email
        const storedData = localStorage.getItem('valid_widget_user_data');
        const userData = storedData ? JSON.parse(storedData) : {};
        userData.email = content.trim();
        localStorage.setItem('valid_widget_user_data', JSON.stringify(userData));
        console.log('[VALID_WIDGET_ID] Saved email:', content.trim());

        // Increment counter
        const newCount = 2;
        setUserMessageCount(newCount);
        localStorage.setItem('valid_widget_message_count', newCount.toString());
      }
    }

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

    // Use the thread_id stored in the conversation, or fallback to global state, or 'new'
    const backendThreadId = currentConversation?.thread_id || state.currentThreadId || 'new';

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
          if (assistantMessage.acts) console.log('🚀 [ChatAgent] Dispatching UPDATE_MESSAGE with acts:', assistantMessage.acts);
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              conversationId: localConversationId!,
              messageId: assistantMessageId,
              content: assistantMessage.content,
              choices: assistantMessage.choices,
              acts: assistantMessage.acts,
              dailyUpdates: assistantMessage.dailyUpdates,
            },
          });
        },
        userEmail,
        backendSessionId,
        backendThreadId,
        isNewChat,
        apiKey,
        overrideProvider || propProvider || state.currentProvider,
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
        assistantMessageId,
        appId,
        handleProviderSwitch
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
  }, [currentConversation, dispatch, streamMessage, state.currentSessionId, state.currentThreadId, state.user?.email, state.currentProvider, propProvider, handleProviderSwitch, isValidWidget, userMessageCount]);

  const handleChoiceSelect = useCallback(async (value: string, title: string, messageId: string) => {
    // Check if this is an AI Assistant choice
    const isAIAssistantChoice = ['AI_ASSISTANT', 'ASK_AI', 'ASK_RICA', 'TALK_AI'].includes(
      value.toUpperCase()
    );

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
        title: title.slice(0, 50) + (title.length > 50 ? '...' : ''),
        createdAt: new Date(),
        messages: [],
      };
      dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
    } else {
      localConversationId = currentConversation.id;
    }

    const backendSessionId = state.currentSessionId;
    const backendThreadId = currentConversation?.thread_id || state.currentThreadId || 'new';

    // Add user message with TITLE displayed in UI
    const userMessage: Message = {
      id: Date.now().toString(),
      content: title, // Display the title in the UI
      role: 'user',
      timestamp: new Date(),
      files: [],
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

    if (isAIAssistantChoice) {
      console.log('AI Assistant choice detected, switching provider to openai');
      // Switch provider immediately
      dispatch({ type: 'SET_PROVIDER', payload: 'openai' });
      // Small delay to let UI update
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Stream assistant response - send VALUE to backend but title was shown to user
    try {
      await streamMessage(
        value, // Send the VALUE to Botpress, not the title
        [],
        (assistantMessage: Message) => {
          if (assistantMessage.acts) console.log('🚀 [ChatAgent] Dispatching UPDATE_MESSAGE with acts:', assistantMessage.acts);
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              conversationId: localConversationId!,
              messageId: assistantMessageId,
              content: assistantMessage.content,
              choices: assistantMessage.choices,
              acts: assistantMessage.acts,
              dailyUpdates: assistantMessage.dailyUpdates,
            },
          });
        },
        userEmail,
        backendSessionId,
        backendThreadId,
        isNewChat,
        apiKey,
        isAIAssistantChoice ? 'openai' : (propProvider || state.currentProvider),
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
        assistantMessageId,
        appId,
        handleProviderSwitch
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
  }, [currentConversation, dispatch, streamMessage, state.user?.email, state.currentSessionId, state.currentThreadId, state.currentProvider, propProvider, apiKey, appId, handleProviderSwitch]);

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
        borderRadius: '0px'
      }}
    >
      <div
        className="hide-scrollbar flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8fafc] rounded-none"
      >
        {!shouldShowMessages ? (
          <AILoader />
        ) : (
          <div>
            {currentConversation?.messages?.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message}
                isStreaming={isStreaming && message.role === 'assistant' && index === currentConversation.messages.length - 1}
                onChoiceSelect={(value, title) => handleChoiceSelect(value, title, message.id)}
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
          borderRadius: '0px'
        }}
      >
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
          inputValue={inputValue}
          onInputChange={setInputValue}
        />
      </div>
    </div >
  );
};