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
    onMessageUpdate: (message: Message) => void
  ) => {
    setIsStreaming(true);
    setError(null);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: Date.now().toString(),
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
                
                if (parsed.response) {
                  const text = parsed.response;
                  if (currentMessageRef.current) {
                    //console.log('Current content:', text);
                    //currentMessageRef.current.content += chunk;
                    currentMessageRef.current.content += text;
                    onMessageUpdate({ ...currentMessageRef.current });
                  }
                }
              }
            }
          } catch (err) {
            console.error('Error parsing chunk:', err);
          }
        }
      },
      // onComplete
/*
while (true) {
        
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            // Handle Server-Sent Events format (data: {...})
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6); // Remove 'data: ' prefix
              if (dataStr.trim()) {
                const parsed = JSON.parse(dataStr);
                
                if (parsed.response) {
                  const text = parsed.response;
                  setCurrentResponse(prev => prev + text);
                  fullResponse += text;
                }
*/



      () => {
        setIsStreaming(false);
        currentMessageRef.current = null;
      },
      // onError
      (error: Error) => {
        setIsStreaming(false);
        setError(error.message);
        currentMessageRef.current = null;
      }
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