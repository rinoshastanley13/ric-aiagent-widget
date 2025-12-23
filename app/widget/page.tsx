'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

    useEffect(() => {
        const validateWidget = async () => {
            const key = searchParams.get('key');
            const id = searchParams.get('id');
            const uiParam = searchParams.get('ui');

            // Parse UI Config
            if (uiParam) {
                try {
                    const parsed = JSON.parse(decodeURIComponent(uiParam));
                    setUiConfig(parsed);
                } catch (e) {
                    console.error('Failed to parse UI config', e);
                }
            }

            // CMS Auto-Login Parameters (optional)
            const cmsName = searchParams.get('name');
            const cmsEmail = searchParams.get('email');
            const cmsTenantId = searchParams.get('tenantId');
            const cmsCompany = searchParams.get('companyName');

            if (!key || !id) {
                setViewState('ERROR');
                return;
            }

            try {
                const response = await fetch(`/api/widget/validate?key=${key}&id=${id}`);
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
                    } else {
                        // Create anonymous user session
                        const anonymousUser = {
                            name: 'Guest',
                            email: `guest_${Date.now()}@anonymous.local`,
                            isAnonymous: true
                        };
                        localStorage.setItem('widget_user', JSON.stringify(anonymousUser));
                        setUser(anonymousUser as any);
                    }

                    // Always go directly to CHAT
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
    }, [searchParams]);

    const handleOptionSelect = (option: string) => {
        // All options now go directly to chat since no registration needed
        setViewState('CHAT');
    };

    const handleNewChat = () => {
        // Create new anonymous user session for fresh chat
        const anonymousUser = {
            name: 'Guest',
            email: `guest_${Date.now()}@anonymous.local`,
            isAnonymous: true
        };
        localStorage.setItem('widget_user', JSON.stringify(anonymousUser));
        setUser(anonymousUser as any);

        // Clear CMS context if exists
        localStorage.removeItem('cms_context');

        // Force page reload to completely reset state and trigger fresh backend welcome message
        window.location.reload();
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
                    borderRadius: '50px'  // Rounded container like HTML
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
                        <WidgetHeader showNewChat={true} onNewChat={handleNewChat} />
                        <div className="flex-1 overflow-hidden relative">
                            <ChatProvider>
                                <div className="h-full flex flex-col">
                                    <ChatAgent />
                                </div>
                            </ChatProvider>
                        </div>
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
