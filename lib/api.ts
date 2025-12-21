import { FileAttachment, Conversation } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://122.172.82.155';

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
    onComplete: () => void,
    onError: (error: Error) => void,
    email: string,
    sessionId: string,
    isNewChat: boolean = false
  ): Promise<void> {
    try {
      const payload = {
        message: message,
        email: email,
        session_id: sessionId === 'new' ? null : sessionId, // backend expects null for new or 'new' string. 
        is_new_chat: isNewChat,
        provider: 'botpress'
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-API-KEY': 'test_secret_key_123',
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        onChunk(chunk);
      }

      onComplete();
    } catch (error) {
      onError(error as Error);
    }
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