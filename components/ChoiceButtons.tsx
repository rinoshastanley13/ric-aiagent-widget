'use client';

import React, { useState } from 'react';
import { useUI } from '@/context/UIContext';

export interface Choice {
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

    const handleClick = (choice: Choice) => {
        onSelect(choice.value);
    };

    return (
        <div
            style={{
                display: 'grid',
                gap: '12px',
                marginTop: '16px'
            }}
        >
            {choices.map((choice, index) => (
                <button
                    key={index}
                    onClick={() => handleClick(choice)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                        padding: '14px 18px',
                        background: 'linear-gradient(180deg, #ffffff, #f6f8fb)',
                        border: hoveredIndex === index ? '1px solid #20973b' : '1px solid #e3e7ee',
                        borderRadius: '2px',
                        color: '#1f2937',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textAlign: 'left',
                        transition: 'all 0.3s ease',
                        lineHeight: 1.5,
                        boxShadow: hoveredIndex === index
                            ? '0 10px 24px rgba(32, 151, 59, 0.18)'
                            : '0 2px 4px rgba(0, 0, 0, 0.05)',
                        transform: hoveredIndex === index ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                >
                    {choice.title}
                </button>
            ))}
        </div>
    );
};
