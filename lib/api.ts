import { FileAttachment, Conversation } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:8000';

export class ChatAPI {
  private static async handleResponse(response: Response) {
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response;
  }

  static async streamChatResponse(
    message: string,
    files: FileAttachment[] = [],
    onChunk: (chunk: string) => void,
    onComplete: (sessionId: string, threadId: string) => void,
    onError: (error: Error) => void,
    email: string,
    sessionId: string | null,
    threadId: string | null,
    isNewChat: boolean = false,
    apiKey: string,
    provider: string = 'botpress'
  ): Promise<void> {
    try {
      const payload = {
        message: message,
        email: email,
        session_id: sessionId === 'new' ? null : sessionId,
        thread_id: threadId === 'new' ? null : threadId,
        is_new_chat: isNewChat,
        provider: provider
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let lastSessionId = sessionId || '';
      let lastThreadId = threadId || '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        // Parse chunk to extract session/thread IDs if possible
        try {
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.substring(6));
              if (data.session_id) lastSessionId = data.session_id;
              if (data.thread_id) lastThreadId = data.thread_id;
            }
          }
        } catch (e) {
          // Ignore parse errors for partial chunks
        }

        onChunk(chunk);
      }

      onComplete(lastSessionId, lastThreadId);
    } catch (error) {
      onError(error as Error);
    }
  }

  static async getThreads(sessionId: string, apiKey: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/threads`, {
      headers: {
        'X-API-KEY': apiKey
      }
    });
    await this.handleResponse(response);
    const data = await response.json();
    return data.threads;
  }

  static async getThreadMessages(threadId: string, apiKey: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/chat/threads/${threadId}/messages`, {
      headers: {
        'X-API-KEY': apiKey
      }
    });
    await this.handleResponse(response);
    return response.json();
  }

  static async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/chat/conversations`);
    await this.handleResponse(response);
    return response.json();
  }

  static async deleteConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    await this.handleResponse(response);
  }
}