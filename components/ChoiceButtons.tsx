'use client';

import React, { useState } from 'react';
import { useUI } from '@/context/UIContext';

interface Choice {
    title: string;
    value: string;
}

interface ChoiceButtonsProps {
    choices: Choice[];
    onSelect: (value: string) => void;
}

export const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({ choices, onSelect }) => {
    const ui = useUI();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const primaryColor = ui.primaryColor || '#2E3B8B';

    // Icon mapping - use generic icons for choices
    const getIcon = (index: number) => {
        const icons = ['💬', '📋', '🔔', '🤖'];
        return icons[index % icons.length];
    };

    return (
        <div className="flex flex-col gap-3 mt-4">
            {choices.map((choice, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(choice.value)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="w-full flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all text-left group"
                    style={{
                        borderColor: hoveredIndex === index ? primaryColor : undefined,
                        boxShadow: hoveredIndex === index ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : undefined
                    }}
                >
                    <span
                        className="text-xl shrink-0 transition-transform duration-200"
                        style={{ transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)' }}
                    >
                        {getIcon(index)}
                    </span>
                    <span
                        className="text-sm text-gray-700 transition-colors"
                        style={{ color: hoveredIndex === index ? primaryColor : undefined }}
                    >
                        {choice.title}
                    </span>
                </button>
            ))}
        </div>
    );
};
