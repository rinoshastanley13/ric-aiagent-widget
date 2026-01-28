'use client';

import React, { useState } from 'react';

const INDIAN_STATES = [
    'Karnataka',
    'Maharashtra',
    'Kerala',
    'Telangana',
    'Andhra Pradesh',
    'Tamil Nadu',
    'Gujarat',
    'Rajasthan',
    'Uttar Pradesh',
    'Madhya Pradesh',
    'West Bengal',
    'Bihar',
    'Odisha',
    'Punjab',
    'Haryana',
    'Delhi',
    'Jharkhand',
    'Chhattisgarh',
    'Uttarakhand',
    'Himachal Pradesh',
    'Assam',
    'Tripura',
    'Meghalaya',
    'Manipur',
    'Nagaland',
    'Goa',
    'Arunachal Pradesh',
    'Mizoram',
    'Sikkim'
];

interface StatesSelectorProps {
    onSelect: (state: string) => void;
    disabled?: boolean; // Added disabled prop
}

export const StatesSelector: React.FC<StatesSelectorProps> = ({ onSelect, disabled = false }) => {
    const [showAll, setShowAll] = useState(false);
    const [hoveredState, setHoveredState] = useState<string | null>(null);

    const displayedStates = showAll ? INDIAN_STATES : INDIAN_STATES.slice(0, 5);

    const handleStateClick = (state: string) => {
        if (!disabled) {
            onSelect(state);
        }
    };

    return (
        <div
            style={{
                marginTop: '16px',
                opacity: disabled ? 0.6 : 1, // Visual indication
                pointerEvents: disabled ? 'none' : 'auto' // Prevent interactions
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                }}
            >
                {displayedStates.map((state) => (
                    <button
                        key={state}
                        onClick={() => handleStateClick(state)}
                        onMouseEnter={() => !disabled && setHoveredState(state)}
                        onMouseLeave={() => !disabled && setHoveredState(null)}
                        disabled={disabled}
                        style={{
                            padding: '14px 18px',
                            background: hoveredState === state && !disabled
                                ? 'linear-gradient(180deg, #f0f9ff, #e0f2fe)'
                                : 'linear-gradient(180deg, #ffffff, #f6f8fb)',
                            border: hoveredState === state && !disabled
                                ? '1px solid #20973b'
                                : '1px solid #e3e7ee',
                            borderRadius: '8px',
                            color: '#1f2937',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            textAlign: 'left',
                            transition: 'all 0.3s ease',
                            boxShadow: hoveredState === state && !disabled
                                ? '0 10px 24px rgba(32, 151, 59, 0.18)'
                                : '0 2px 4px rgba(0, 0, 0, 0.05)',
                            transform: hoveredState === state && !disabled ? 'translateY(-2px)' : 'translateY(0)',
                        }}
                    >
                        {state}
                    </button>
                ))}

                {!showAll && (
                    <button
                        onClick={() => setShowAll(true)}
                        onMouseEnter={() => !disabled && setHoveredState('more')}
                        onMouseLeave={() => !disabled && setHoveredState(null)}
                        disabled={disabled}
                        style={{
                            padding: '14px 18px',
                            background: hoveredState === 'more' && !disabled
                                ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)'
                                : 'linear-gradient(135deg, #374151, #4b5563)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            boxShadow: hoveredState === 'more' && !disabled
                                ? '0 10px 24px rgba(30, 58, 138, 0.3)'
                                : '0 4px 12px rgba(55, 65, 81, 0.2)',
                            transform: hoveredState === 'more' && !disabled ? 'translateY(-2px)' : 'translateY(0)',
                        }}
                    >
                        + More States
                    </button>
                )}
            </div>
        </div>
    );
};
