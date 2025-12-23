import React from 'react';
import { useUI } from '@/context/UIContext';

interface ChatInputSimpleProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled?: boolean;
    placeholder?: string;
}

export const ChatInputSimple: React.FC<ChatInputSimpleProps> = ({
    value,
    onChange,
    onSend,
    disabled = false,
    placeholder = 'Ask your query'
}) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !disabled) {
                onSend();
            }
        }
    };

    return (
        <div
            style={{
                padding: '16px 20px',
                background: 'white',
                borderTop: '1px solid #e2e8f0',
                borderRadius: '0px 0px 30px 30px'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '24px',
                    padding: '8px 12px',
                    transition: 'border-color 0.3s ease'
                }}
            >
                <button
                    style={{
                        width: '32px',
                        height: '32px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontSize: '20px',
                        transition: 'color 0.3s ease'
                    }}
                    title="Attach file"
                >
                    +
                </button>

                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    disabled={disabled}
                    style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '14px',
                        color: '#1e293b'
                    }}
                />

                <button
                    onClick={onSend}
                    disabled={disabled || !value.trim()}
                    style={{
                        width: '36px',
                        height: '36px',
                        background: disabled || !value.trim() ? '#cbd5e1' : '#1e3a8a',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        transition: 'all 0.3s ease',
                        fontSize: '18px'
                    }}
                >
                    ↑
                </button>
            </div>
        </div>
    );
};
