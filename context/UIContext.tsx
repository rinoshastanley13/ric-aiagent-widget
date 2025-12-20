'use client';

import React, { createContext, useContext, ReactNode } from 'react';

export interface UIConfig {
    primaryColor?: string;
    headerColor?: string;
    headerTitle?: string;
    headerIconText?: string;
    botName?: string;
    // Button specific styles
    button?: {
        backgroundColor?: string;
        textColor?: string;
        borderRadius?: string;
    };
}

// Default configuration matches the current hardcoded design
const defaultConfig: UIConfig = {
    primaryColor: '#2E3B8B',
    headerColor: '#2E3B8B',
    headerTitle: 'Compliance AI Assistant',
    headerIconText: 'RC',
    botName: 'Compliance AI Assistant',
    button: {
        backgroundColor: '#FFFFFF', // Default card/button background
        textColor: '#374151',
        borderRadius: '0.75rem', // rounded-xl
    },
};

const UIContext = createContext<UIConfig>(defaultConfig);

export const UIProvider = ({ children, config }: { children: ReactNode; config?: UIConfig | null }) => {
    // Merge provided config with defaults (shallow merge for root, deep merge for nested objects if needed)
    // For simplicity, we'll do a basic merge here.
    const mergedConfig: UIConfig = {
        ...defaultConfig,
        ...config,
        // Ensure nested objects are also merged correctly
        button: {
            ...defaultConfig.button,
            ...(config?.button || {}),
        },
    };

    return <UIContext.Provider value={mergedConfig}>{children}</UIContext.Provider>;
};

export const useUI = () => useContext(UIContext);
