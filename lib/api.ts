import { Message, FileAttachment } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL;

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
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('message', message);
      
      // Add files if any
      files.forEach(file => {
        // Convert FileAttachment to actual File objects if needed
        // This assumes files are already uploaded and we have references
      });

      const payload = {
        //model: modelName,
        prompt: message,
        stream: true
      };

      const response = await fetch(`${API_BASE_URL}/aiagents/chat`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-API-KEY': 'QUlQcm94eXNTZXJ2ZXJfRW1haWxfQVBJX0tleTpBbGxhaDc4NiM=',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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