import React from 'react';

interface WidgetHeaderProps {
    showNewChat?: boolean;
    onNewChat?: () => void;
    title?: string;
    avatarText?: string;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
    showNewChat = false,
    onNewChat,
    title = 'Compliance AI Assistant',
    avatarText = 'RC'
}) => {
    return (
        <div className="bg-[#2E3B8B] px-4 py-3 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#2E3B8B] font-bold text-xs">
                    {avatarText}
                </div>
                <span className="text-white font-semibold text-sm">{title}</span>
            </div>
            <div className="flex items-center gap-2">
                {showNewChat && onNewChat && (
                    <button
                        onClick={onNewChat}
                        className="text-white text-xs border border-white/30 rounded-full px-3 py-1 hover:bg-white/10 transition"
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
