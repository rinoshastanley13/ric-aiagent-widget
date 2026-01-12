import React from 'react';
import { useUI } from '@/context/UIContext';
import { User, Bot } from 'lucide-react';
import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import { ChoiceButtons } from './ChoiceButtons';

interface MessageBubbleSimpleProps {
    message: Message;
    isStreaming?: boolean;
    onChoiceSelect?: (value: string, title: string) => void;
}

export const MessageBubbleSimple: React.FC<MessageBubbleSimpleProps> = ({
    message,
    isStreaming = false,
    onChoiceSelect
}) => {
    const isUser = message.role === 'user';

    return (
        <div
            style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                animation: 'fadeIn 0.3s ease'
            }}
            className={isUser ? 'user' : 'bot'}
        >
            <div
                style={{
                    maxWidth: '90%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    lineHeight: 1.5,
                    fontSize: '14px',
                    color: 'white',
                    ...(isUser ? {
                        background: 'linear-gradient(90deg, #22c55e, #1d549f)',
                        borderBottomRightRadius: '4px',
                    } : {
                        background: 'white',
                        color: '#2f3a4a',
                        border: '1px solid #c1c2c4',
                        borderBottomLeftRadius: '4px',
                        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
                    })
                }}
            >
                {isUser ? (
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {message.content}
                    </div>
                ) : (
                    <>
                        <ReactMarkdown>{message.content}</ReactMarkdown>

                        {/* Choice Buttons */}
                        {!isUser && message.choices && message.choices.length > 0 && onChoiceSelect && (
                            <div style={{ marginTop: '16px' }}>
                                <ChoiceButtons
                                    choices={message.choices}
                                    onSelect={onChoiceSelect}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
