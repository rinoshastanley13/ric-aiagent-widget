
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const widgetId = searchParams.get('id');

    if (!key && !widgetId) {
        return NextResponse.json({ error: 'Missing API Key' }, { status: 400 });
    }

    try {
        // Call FastAPI backend to validate widget key
        const fastApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;
        let validateUrl = `${fastApiUrl}/api/widget/validate?key=${encodeURIComponent(key || '')}`;

        if (widgetId) {
            validateUrl += `&widgetId=${encodeURIComponent(widgetId)}`;
        }

        const response = await fetch(validateUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Invalid API Key' }));
            return NextResponse.json(
                { error: errorData.detail || errorData.error || 'Invalid API Key' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // 3. Check Origin (Domain Authorization) - can be done here or in FastAPI
        const origin = request.headers.get('origin') || request.headers.get('referer');
        const allowedOrigins = data.config?.allowedOrigins || ['*'];

        // Simple origin check (in prod use strict regex)
        if (allowedOrigins[0] !== '*') {
            if (!origin || !allowedOrigins.some((allowed: string) => origin.includes(allowed))) {
                console.log(`Blocked origin: ${origin} for tenant ${data.tenant?.name}`);
                return NextResponse.json({ error: 'Domain not authorized' }, { status: 403 });
            }
        }

        // 4. Success - return the validated data from FastAPI
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        return NextResponse.json(data, { headers });

    } catch (error) {
        console.error('Error validating widget key:', error);
        return NextResponse.json(
            { error: 'Validation service unavailable' },
            { status: 503 }
        );
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
