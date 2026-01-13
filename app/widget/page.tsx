'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWidgetBridge } from '@/hooks/useWidgetBridge';
import { ChatAgent } from '@/components/ChatAgent';
import { ChatProvider } from '@/context/ChatContext';
import { UIProvider, UIConfig } from '@/context/UIContext';
import { fetchCMSContext } from '@/lib/cms-context';
import { WidgetHeader } from '@/components/WidgetHeader';

interface WidgetConfig {
    theme: string;
    primaryColor: string;
    position: string;
    title: string;
}

type ViewState = 'LOADING' | 'ERROR' | 'CHAT';

function WidgetContent() {
    const searchParams = useSearchParams();
    const [viewState, setViewState] = useState<ViewState>('LOADING');
    const [config, setConfig] = useState<WidgetConfig | null>(null);

    // User context
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);

    const [uiConfig, setUiConfig] = useState<UIConfig | null>(null);

    const { context } = useWidgetBridge();

    useEffect(() => {
        const validateWidget = async () => {
            if (!context) return; // Wait for bridge context

            const key = context.app_unique_key;
            const id = context.app_id;

            // CMS Auto-Login Parameters from bridge
            const cmsName = context.user_name;
            const cmsEmail = context.user_email;
            const cmsTenantId = context.tenantId;
            const cmsCompany = context.company;

            if (!key || !id) {
                setViewState('ERROR');
                return;
            }

            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://106.51.109.172';
                const response = await fetch(`${API_BASE_URL}/api/widget/validate?key=${key}&id=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setConfig(data.config);

                    // Check if this is an Automated CMS Launch
                    if (cmsName && cmsEmail && cmsTenantId) {
                        // Auto-create session
                        const cmsUser = {
                            name: cmsName,
                            email: cmsEmail,
                            tenantId: cmsTenantId,
                            company: cmsCompany,
                            isCmsUser: true
                        };

                        // Store and Set User
                        localStorage.setItem('widget_user', JSON.stringify(cmsUser));
                        setUser(cmsUser as any);

                        // Fetch Context
                        try {
                            const context = await fetchCMSContext(cmsTenantId, cmsEmail);
                            localStorage.setItem('cms_context', JSON.stringify(context));
                        } catch (e) {
                            console.error('Failed to load CMS context', e);
                        }

                        // Transition to CHAT
                        setViewState('CHAT');
                        return;
                    }

                    // Standard Flow
                    let storedUserString = localStorage.getItem('widget_user');
                    let storedUser = storedUserString ? JSON.parse(storedUserString) : null;

                    if (!storedUser) {
                        // Auto-create Guest User to bypass registration
                        const guestId = Math.random().toString(36).substring(7);
                        storedUser = {
                            name: 'Guest',
                            email: `guest_${guestId}@example.com`,
                            isGuest: true
                        };
                        localStorage.setItem('widget_user', JSON.stringify(storedUser));
                    }

                    setUser(storedUser);

                    // Skip WELCOME/REGISTER and go directly to CHAT
                    setViewState('CHAT');

                } else {
                    setViewState('ERROR');
                }
            } catch (error) {
                console.error('Validation failed', error);
                setViewState('ERROR');
            }
        };

        validateWidget();
    }, [context]);

    const handleNewChat = () => {
        // Clear user session and create new guest user
        localStorage.removeItem('cms_context');

        // Reset message count but preserve user data cache for returning users
        localStorage.setItem('valid_widget_message_count', '0');

        const guestId = Math.random().toString(36).substring(7);
        const newUser = {
            name: 'Guest',
            email: `guest_${guestId}@example.com`,
            isGuest: true
        };
        localStorage.setItem('widget_user', JSON.stringify(newUser));
        setUser(newUser);

        // Force reload by briefly setting state (or rely on ChatAgent to detect user change if keys update context)
        // Since we are not unmounting, we might need a key on ChatProvider or similar.
        // For now, let's keep it simple: The ChatAgent relies on local storage or passed context.
        // But ChatAgent initializes on mount.
        // Let's force a remount of ChatProvider by toggling a key or state.
        setViewState('LOADING');
        setTimeout(() => setViewState('CHAT'), 0);
    };

    return (
        <UIProvider config={uiConfig}>
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'white',
                    overflow: 'hidden',
                    // borderRadius: '50px'  // Removed to avoid gap with iframe container
                }}
            >
                {viewState === 'LOADING' && (
                    <div className="flex items-center justify-center h-full bg-white">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                            <p className="text-gray-500 text-sm">Loading...</p>
                        </div>
                    </div>
                )}

                {viewState === 'ERROR' && (
                    <div className="flex items-center justify-center h-full bg-gray-50 text-red-500 p-4 text-center text-sm">
                        Access Denied. Invalid Widget Configuration.
                    </div>
                )}



                {viewState === 'CHAT' && (
                    <>
                        <ChatProvider>
                            <WidgetHeader showNewChat={true} onNewChat={handleNewChat} />
                            <div className="flex-1 overflow-hidden relative h-full flex flex-col">
                                <ChatAgent
                                    apiKey={context?.app_unique_key || ''}
                                    appId={context?.app_id || ''}
                                />
                            </div>
                        </ChatProvider>
                    </>
                )}
            </div>
        </UIProvider>
    );
}

export default function WidgetPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading...</div>}>
            <WidgetContent />
        </Suspense>
    );
}
