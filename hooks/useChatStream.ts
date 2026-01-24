import { useState, useCallback, useRef } from 'react';
import { Message, FileAttachment } from '@/types';
import { ChatAPI } from '@/lib/api';

export const useChatStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentMessageRef = useRef<Message | null>(null);
  const needsAddRef = useRef<boolean>(false); // Track if message needs to be added first

  const streamMessage = useCallback(async (
    userMessage: string,
    files: FileAttachment[] = [],
    onMessageUpdate: (message: Message) => void,
    email: string,
    sessionId: string | null,
    threadId: string | null,
    isNewChat: boolean = false,
    apiKey: string,
    provider: string = 'botpress',
    onIdsUpdate?: (sessionId: string, threadId: string) => void,
    messageId?: string,
    appId?: string,
    onProviderSwitch?: (newProvider: string) => void,
    userName?: string,
    userDesignation?: string,
    isSupportTicket?: boolean
  ) => {
    setIsStreaming(true);
    setError(null);

    // Create assistant message placeholder with provided or generated ID
    const assistantMessage: Message = {
      id: messageId || Date.now().toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };

    currentMessageRef.current = assistantMessage;
    needsAddRef.current = false; // Initial message is already added by ChatAgent
    onMessageUpdate(assistantMessage);

    await ChatAPI.streamChatResponse(
      userMessage,
      files,
      // onChunk
      (chunk: string) => {
        const lines = chunk.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            // Handle Server-Sent Events format (data: {...})
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6); // Remove 'data: ' prefix
              if (dataStr.trim()) {
                const parsed = JSON.parse(dataStr);
                if (!parsed) continue;

                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                let shouldUpdate = false;

                if (parsed.response) {
                  const text = parsed.response;

                  // Check if the response contains the __NEXT_MESSAGE__ marker
                  if (text.includes('__NEXT_MESSAGE__')) {
                    console.log('🔔 [useChatStream] DETECTED __NEXT_MESSAGE__ MARKER!', text);

                    // Split on the marker to separate messages
                    const parts = text.split('__NEXT_MESSAGE__');
                    const contentBeforeMarker = parts[0];
                    const contentAfterMarker = parts[1] || '';

                    // Add content before marker to current message if any
                    if (contentBeforeMarker && currentMessageRef.current) {
                      currentMessageRef.current.content += contentBeforeMarker;
                      // Force update the completed first message
                      onMessageUpdate({ ...currentMessageRef.current });
                    }

                    // Create a new message for the next response
                    const newMessage: Message = {
                      id: (Date.now() + Math.random()).toString(),
                      content: contentAfterMarker, // Start with content after marker if any
                      role: 'assistant',
                      timestamp: new Date(),
                    };

                    currentMessageRef.current = newMessage;
                    needsAddRef.current = true; // Flag that this message needs to be added
                    console.log('🔔 [useChatStream] Created new message object:', newMessage.id);
                    // Don't call onMessageUpdate yet - wait for next chunk to add it
                    shouldUpdate = false; // We'll handle it on next chunk
                  } else {
                    // Normal content append
                    if (currentMessageRef.current) {
                      currentMessageRef.current.content += text;
                      shouldUpdate = true;
                    }
                  }
                }

                // Extract choices if present
                if (parsed.choices && Array.isArray(parsed.choices)) {
                  if (currentMessageRef.current) {
                    currentMessageRef.current.choices = parsed.choices;
                    shouldUpdate = true;
                  }
                }

                // Extract acts if present
                if (parsed.acts) {
                  console.log('🚀 [useChatStream] FRONTEND RECEIVED ACTS:', parsed.acts);
                  if (currentMessageRef.current) {
                    currentMessageRef.current.acts = parsed.acts;
                    shouldUpdate = true;
                  }
                }

                // Extract dailyUpdates if present
                if (parsed.dailyUpdates) {
                  console.log('🚀 [useChatStream] FRONTEND RECEIVED DAILY UPDATES:', parsed.dailyUpdates);
                  if (currentMessageRef.current) {
                    currentMessageRef.current.dailyUpdates = parsed.dailyUpdates;
                    shouldUpdate = true;
                  }
                }

                // Only call onMessageUpdate once per chunk after processing everything
                if (shouldUpdate && currentMessageRef.current) {
                  // If this message needs to be added first (new message after marker)
                  if (needsAddRef.current) {
                    console.log('🔔 [useChatStream] Adding new message to conversation:', currentMessageRef.current.id);
                    needsAddRef.current = false; // Clear flag after adding
                  }
                  onMessageUpdate({ ...currentMessageRef.current });
                }

                if ((parsed.session_id || parsed.thread_id) && onIdsUpdate) {
                  onIdsUpdate(parsed.session_id || '', parsed.thread_id || '');
                }
              }
            }
            // Handle __SWITCH_PROVIDER__ marker
            else if (line.includes('__SWITCH_PROVIDER__') && line.includes('__END_SWITCH__')) {
              const startMarker = '__SWITCH_PROVIDER__';
              const endMarker = '__END_SWITCH__';
              const startIdx = line.indexOf(startMarker) + startMarker.length;
              const endIdx = line.indexOf(endMarker);
              const newProvider = line.substring(startIdx, endIdx);

              if (newProvider && onProviderSwitch) {
                console.log(`Switching provider to: ${newProvider}`);
                onProviderSwitch(newProvider);
              }
            }
          } catch (err) {
            console.error('Error parsing chunk:', err);
          }
        }
      },
      // onComplete
      (finalSessionId: string, finalThreadId: string) => {
        setIsStreaming(false);
        currentMessageRef.current = null;
        if (onIdsUpdate) {
          onIdsUpdate(finalSessionId, finalThreadId);
        }
      },
      // onError
      (error: Error) => {
        setIsStreaming(false);
        setError(error.message);
        currentMessageRef.current = null;
      },
      email,
      sessionId,
      threadId,
      isNewChat,
      apiKey,
      provider,
      appId,
      userName,
      userDesignation,
      isSupportTicket
    );
  }, []);

  const cancelStream = useCallback(() => {
    // Implementation for canceling the stream
    setIsStreaming(false);
    currentMessageRef.current = null;
  }, []);

  return {
    streamMessage,
    isStreaming,
    error,
    cancelStream,
  };
};