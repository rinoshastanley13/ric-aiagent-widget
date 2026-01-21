'use client';

import React, { useState, useEffect } from 'react';

interface LeadFormData {
    company_name: string;
    contact_person_name: string;
    email: string;
    mobile_number: string;
}

interface LeadGenFormProps {
    onSubmit?: (data: LeadFormData) => void;
    onSkip?: () => void;
}

const STORAGE_KEY = 'lead_form_data';

export const LeadGenForm: React.FC<LeadGenFormProps> = ({ onSubmit, onSkip }) => {
    const [formData, setFormData] = useState<LeadFormData>({
        company_name: '',
        contact_person_name: '',
        email: '',
        mobile_number: '',
    });

    const [errors, setErrors] = useState<Partial<LeadFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load data from localStorage on mount
    useEffect(() => {
        const loadCachedData = () => {
            try {
                // First try to get from lead_form_data
                const cachedData = localStorage.getItem(STORAGE_KEY);
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    setFormData(parsed);
                    return;
                }

                // Second: Check for VALID_WIDGET_ID user data (name and email from first two messages)
                const validWidgetData = localStorage.getItem('valid_widget_user_data');
                if (validWidgetData) {
                    const userData = JSON.parse(validWidgetData);
                    setFormData((prev) => ({
                        ...prev,
                        contact_person_name: userData.name || '',
                        email: userData.email || '',
                    }));
                    console.log('[LeadGenForm] Prepopulated from VALID_WIDGET_ID data:', userData);
                    return;
                }

                // Fallback: get user data from widget_user
                const widgetUserData = localStorage.getItem('widget_user');
                if (widgetUserData) {
                    const user = JSON.parse(widgetUserData);
                    setFormData((prev) => ({
                        ...prev,
                        contact_person_name: user.name || '',
                        email: user.email || '',
                    }));
                }
            } catch (error) {
                console.error('Error loading cached form data:', error);
            }
        };

        loadCachedData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof LeadFormData]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<LeadFormData> = {};

        if (!formData.company_name.trim()) {
            newErrors.company_name = 'Company name is required';
        }

        if (!formData.contact_person_name.trim()) {
            newErrors.contact_person_name = 'Contact person name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

            // Submit to backend
            const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;
            const response = await fetch(`${apiUrl}/api/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            // Call parent callback
            if (onSubmit) {
                onSubmit(formData);
            }
        } catch (error) {
            console.error('Error submitting lead form:', error);
            alert('Failed to submit form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        if (onSkip) {
            onSkip();
        }
    };

    return (
        <div
            style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                maxWidth: '680px',
                margin: '0 auto',
            }}
        >

            {/* Form Content */}
            <div style={{ padding: '32px 24px' }}>
                {/* Company Name */}
                <div style={{ marginBottom: '24px' }}>
                    <label
                        style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#4a5568',
                            marginBottom: '8px',
                        }}
                    >
                        Company Name <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder="Enter your registered company name"
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#2d3748',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            background: '#f7fafc',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#3182ce';
                            e.currentTarget.style.background = 'white';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = '#f7fafc';
                        }}
                    />
                    {errors.company_name && (
                        <p style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                            {errors.company_name}
                        </p>
                    )}
                </div>

                {/* Contact Person Name */}
                <div style={{ marginBottom: '24px' }}>
                    <label
                        style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#4a5568',
                            marginBottom: '8px',
                        }}
                    >
                        Contact Person Name <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <input
                        type="text"
                        name="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#2d3748',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            background: '#f7fafc',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#3182ce';
                            e.currentTarget.style.background = 'white';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = '#f7fafc';
                        }}
                    />
                    {errors.contact_person_name && (
                        <p style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                            {errors.contact_person_name}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div style={{ marginBottom: '24px' }}>
                    <label
                        style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#4a5568',
                            marginBottom: '8px',
                        }}
                    >
                        Email <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#2d3748',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            background: '#f7fafc',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#3182ce';
                            e.currentTarget.style.background = 'white';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = '#f7fafc';
                        }}
                    />
                    {errors.email && (
                        <p style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Mobile Number */}
                <div style={{ marginBottom: '32px' }}>
                    <label
                        style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#4a5568',
                            marginBottom: '8px',
                        }}
                    >
                        Mobile Number
                    </label>
                    <input
                        type="tel"
                        name="mobile_number"
                        value={formData.mobile_number}
                        onChange={handleChange}
                        placeholder="Enter your mobile number"
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#2d3748',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            background: '#f7fafc',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#3182ce';
                            e.currentTarget.style.background = 'white';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = '#f7fafc';
                        }}
                    />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: '#2d3748',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: isSubmitting ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!isSubmitting) {
                                e.currentTarget.style.background = '#1a202c';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#2d3748';
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>✓</span>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>

                    <button
                        onClick={handleSkip}
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: '#667389',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: isSubmitting ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!isSubmitting) {
                                e.currentTarget.style.background = '#4a5568';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#667389';
                        }}
                    >
                        Skip for Now
                    </button>
                </div>
            </div>
        </div>
    );
};
