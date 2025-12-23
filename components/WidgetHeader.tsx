import React from 'react';
import { useUI } from '@/context/UIContext';

interface WidgetHeaderProps {
    showNewChat?: boolean;
    onNewChat?: () => void;
    title?: string;
    avatarText?: string;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
    showNewChat = false,
    onNewChat,
    title,
    avatarText
}) => {
    const ui = useUI();
    const displayTitle = title || ui.headerTitle;
    const displayAvatar = avatarText || ui.headerIconText;
    const primaryColor = ui.primaryColor || '#2E3B8B';

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #20973b, #1d549f)',
                color: 'white',
                borderRadius: '30px 30px 0px 0px',
                minHeight: '72px'
            }}
        >
            <div className="flex items-center gap-3">
                <div
                    className="rounded-full bg-white flex items-center justify-center font-bold"
                    style={{
                        width: '40px',
                        height: '40px',
                        color: primaryColor,
                        fontSize: '14px'
                    }}
                >
                    {displayAvatar}
                </div>
                <span className="text-white font-semibold" style={{ fontSize: '20px' }}>{displayTitle}</span>
            </div>
            <div className="flex items-center gap-2">
                {showNewChat && onNewChat && (
                    <button
                        onClick={onNewChat}
                        className="text-white transition cursor-pointer"
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            borderRadius: '20px',
                            padding: '12px 14px',
                            fontSize: '12px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#1e3a8a';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.color = 'white';
                        }}
                    >
                        New Chat
                    </button>
                )}
                {/* Close icon - visual usage only, or communicating with parent window in future */}
                <button className="text-white/80 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        </div>
    );
};
