'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatAgent } from '@/components/ChatAgent';
import { ChatProvider } from '@/context/ChatContext';
import { WidgetWelcome } from '@/components/WidgetWelcome';
import { fetchCMSContext } from '@/lib/cms-context';
import { WidgetHeader } from '@/components/WidgetHeader';

interface WidgetConfig {
    theme: string;
    primaryColor: string;
    position: string;
    title: string;
}

type ViewState = 'LOADING' | 'ERROR' | 'WELCOME' | 'REGISTER' | 'CHAT';

function WidgetContent() {
    const searchParams = useSearchParams();
    const [viewState, setViewState] = useState<ViewState>('LOADING');
    const [config, setConfig] = useState<WidgetConfig | null>(null);

    // Registration form state
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');

    // User context
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);

    useEffect(() => {
        const validateWidget = async () => {
            const key = searchParams.get('key');
            const id = searchParams.get('id');

            // CMS Auto-Login Parameters
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

                        // Transition to CHAT
                        setViewState('CHAT');
                        return;
                    }

                    // Standard Flow
                    const storedUser = localStorage.getItem('widget_user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }

                    // Always start at WELCOME screen as per design req
                    setViewState('WELCOME');

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
        // Only the last option "Ask AI Assistant about compliance" should go to chat
        if (option === "Ask AI Assistant about compliance") {
            if (user) {
                setViewState('CHAT');
            } else {
                setViewState('REGISTER');
            }
        } else {
            // Placeholder for other options
            alert("This feature is coming soon!");
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/widget/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formName, email: formEmail })
            });

            if (response.ok) {
                const data = await response.json();
                const userData = data.user;
                localStorage.setItem('widget_user', JSON.stringify(userData));
                setUser(userData);
                setViewState('CHAT');
            }
        } catch (err) {
            console.error('Registration failed');
        }
    };

    if (viewState === 'LOADING') {
        return <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>;
    }

    if (viewState === 'ERROR') {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50 text-red-500 p-4 text-center text-sm">
                Access Denied. Invalid Widget Configuration.
            </div>
        );
    }

    if (viewState === 'WELCOME') {
        return <WidgetWelcome onOptionSelect={handleOptionSelect} />;
    }

    if (viewState === 'REGISTER') {
        return (
            <div className="flex flex-col h-full bg-white p-6 justify-center">
                <h2 className="text-xl font-bold mb-2 text-gray-800">Welcome</h2>
                <p className="text-sm text-gray-600 mb-6">Please enter your details to start chatting.</p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                        <input
                            required
                            type="text"
                            value={formName}
                            onChange={e => setFormName(e.target.value)}
                            className="w-full text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                        <input
                            required
                            type="email"
                            value={formEmail}
                            onChange={e => setFormEmail(e.target.value)}
                            className="w-full text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="john@example.com"
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#2E3B8B] text-white rounded-md py-2 text-sm font-semibold hover:bg-blue-800 transition">
                        Start Chat
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewState('WELCOME')}
                        className="w-full text-gray-500 text-xs hover:underline mt-2"
                    >
                        Back
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-white">
            <WidgetHeader showNewChat={true} onNewChat={() => setViewState('WELCOME')} />

            <div className="flex-1 overflow-hidden relative">
                <ChatProvider>
                    <div className="h-full flex flex-col">
                        <ChatAgent />
                    </div>
                </ChatProvider>
            </div>
        </div>
    );
}

export default function WidgetPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading...</div>}>
            <WidgetContent />
        </Suspense>
    );
}
