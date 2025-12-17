'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Plus, Brain, Search } from 'lucide-react';
import { FileAttachment } from '@/types';
import { useChatStream } from '@/hooks/useChatStream';
import { useChat } from '@/context/ChatContext';

interface ChatInputProps {
  onSendMessage: (message: string, files: FileAttachment[]) => void;
  disabled?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
    onSendMessage, 
    disabled = false,
    inputValue,
    onInputChange
  }) => {
  const [message, setMessage] = useState(inputValue || '');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isDeepThink, setIsDeepThink] = useState(false);
  const [isSearch, setIsSearch] = useState(true);
  const [textareaRows, setTextareaRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { state } = useChat();

  // Sync the external inputValue with internal state
  useEffect(() => {
    if (inputValue !== undefined) {
      setMessage(inputValue);
      
      // Also update textarea height when external value changes
      if (textareaRef.current && inputValue) {
        const lineCount = inputValue.split('\n').length;
        const newRows = Math.min(Math.max(lineCount, 1), 6);
        setTextareaRows(newRows);
        
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 144) + 'px';
      }
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message, files);
      setMessage(''); // Clear message after sending
      setFiles([]); // Clear files after sending
      setTextareaRows(1); // Reset to 1 row
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = '48px';
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    /*
      const newValue = e.target.value;
      setMessage(newValue);
      
      // Call the external onChange handler if provided
      if (onInputChange) {
        onInputChange(newValue);
      }
    */
    setMessage(e.target.value);
    
    // Calculate the number of lines
    const lineCount = e.target.value.split('\n').length;
    // Limit to maximum 6 rows
    const newRows = Math.min(Math.max(lineCount, 1), 6);
    setTextareaRows(newRows);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 144) + 'px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileAttach = () => {
    // File attachment implementation
    console.log('File attach clicked');
  };

  return (
    <div className="bg-white p-3 w-250 mx-auto">
      {/* File Attachments */}
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50"
            >
              <span className="text-sm text-blue-700">{file.name}</span>
              <button
                onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                className="text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex space-x-2 items-center justify-center">
        {/* File Attachment Button */}
        <button
          type="button"
          onClick={handleFileAttach}
          className="p-2 text-gray-500 hover:text-white hover:rounded-full hover:bg-gray-400 transition-colors flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <div className="textarea-container relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "AI is thinking..." : "Type your message..."}
              disabled={disabled}
              rows={textareaRows}
              className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 hover:bg-white px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              style={{
                minHeight: '48px',
                maxHeight: '144px',
                paddingRight: disabled ? '40px' : '16px',
                overflowY: textareaRows >= 6 ? 'auto' : 'hidden'
              }}
            />
            
            {/* Progress spinner when processing */}
            {disabled && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="spinner border-2 border-blue-500 border-t-transparent rounded-full w-5 h-5 animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          style={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.7 : 1
          }}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};