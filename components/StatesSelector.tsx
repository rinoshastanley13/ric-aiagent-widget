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
}

export const StatesSelector: React.FC<StatesSelectorProps> = ({ onSelect }) => {
    const [showAll, setShowAll] = useState(false);
    const [hoveredState, setHoveredState] = useState<string | null>(null);

    const displayedStates = showAll ? INDIAN_STATES : INDIAN_STATES.slice(0, 5);

    const handleStateClick = (state: string) => {
        onSelect(state);
    };

    return (
        <div style={{ marginTop: '16px' }}>
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
                        onMouseEnter={() => setHoveredState(state)}
                        onMouseLeave={() => setHoveredState(null)}
                        style={{
                            padding: '14px 18px',
                            background: hoveredState === state
                                ? 'linear-gradient(180deg, #f0f9ff, #e0f2fe)'
                                : 'linear-gradient(180deg, #ffffff, #f6f8fb)',
                            border: hoveredState === state
                                ? '1px solid #20973b'
                                : '1px solid #e3e7ee',
                            borderRadius: '8px',
                            color: '#1f2937',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            textAlign: 'left',
                            transition: 'all 0.3s ease',
                            boxShadow: hoveredState === state
                                ? '0 10px 24px rgba(32, 151, 59, 0.18)'
                                : '0 2px 4px rgba(0, 0, 0, 0.05)',
                            transform: hoveredState === state ? 'translateY(-2px)' : 'translateY(0)',
                        }}
                    >
                        {state}
                    </button>
                ))}

                {!showAll && (
                    <button
                        onClick={() => setShowAll(true)}
                        onMouseEnter={() => setHoveredState('more')}
                        onMouseLeave={() => setHoveredState(null)}
                        style={{
                            padding: '14px 18px',
                            background: hoveredState === 'more'
                                ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)'
                                : 'linear-gradient(135deg, #374151, #4b5563)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            boxShadow: hoveredState === 'more'
                                ? '0 10px 24px rgba(30, 58, 138, 0.3)'
                                : '0 4px 12px rgba(55, 65, 81, 0.2)',
                            transform: hoveredState === 'more' ? 'translateY(-2px)' : 'translateY(0)',
                        }}
                    >
                        + More States
                    </button>
                )}
            </div>
        </div>
    );
};
