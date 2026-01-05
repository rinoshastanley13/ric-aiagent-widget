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
    <div className="bg-white p-0 w-full">
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

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* File Attachment Button */}
        <button
          type="button"
          onClick={handleFileAttach}
          className="text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Attach file"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Text Input Container */}
        <div
          className="flex-1"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '2px',
            padding: '10px 12px',
            transition: 'border-color 0.3s ease'
          }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "AI is thinking..." : "Ask your query"}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none disabled:cursor-not-allowed"
            style={{
              border: 'none',
              fontSize: '14px',
              color: '#1e293b',
              minHeight: '24px',
              maxHeight: '144px',
              overflowY: textareaRows >= 6 ? 'auto' : 'hidden'
            }}
          />

          {/* Progress spinner when processing */}
          {disabled && (
            <div className="flex-shrink-0">
              <div className="border-2 border-blue-500 border-t-transparent rounded-full w-5 h-5 animate-spin"></div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 rounded-full flex items-center justify-center transition-all"
          style={{
            width: '48px',
            height: '48px',
            background: disabled || !message.trim() ? '#cbd5e1' : '#1e3a8a',
            border: 'none',
            color: 'white',
            cursor: disabled || !message.trim() ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            if (!disabled && message.trim()) {
              e.currentTarget.style.background = '#1e40af';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && message.trim()) {
              e.currentTarget.style.background = '#1e3a8a';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <span style={{ fontSize: '24px', lineHeight: 1 }}>↑</span>
        </button>
      </form>
    </div>
  );
};