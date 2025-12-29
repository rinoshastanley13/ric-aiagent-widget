import { useState, useCallback, useRef } from 'react';
import { Message, FileAttachment } from '@/types';
import { ChatAPI } from '@/lib/api';

export const useChatStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentMessageRef = useRef<Message | null>(null);

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
    messageId?: string
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

                let shouldUpdate = false;

                if (parsed.response) {
                  const text = parsed.response;
                  if (currentMessageRef.current) {
                    currentMessageRef.current.content += text;
                    shouldUpdate = true;
                  }
                }

                // Extract choices if present
                if (parsed.choices && Array.isArray(parsed.choices)) {
                  if (currentMessageRef.current) {
                    currentMessageRef.current.choices = parsed.choices;
                    shouldUpdate = true;
                  }
                }

                // Only call onMessageUpdate once per chunk after processing everything
                if (shouldUpdate && currentMessageRef.current) {
                  onMessageUpdate({ ...currentMessageRef.current });
                }

                if ((parsed.session_id || parsed.thread_id) && onIdsUpdate) {
                  onIdsUpdate(parsed.session_id || '', parsed.thread_id || '');
                }
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
      provider
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