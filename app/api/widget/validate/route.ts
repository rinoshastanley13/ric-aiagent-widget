
import { NextRequest, NextResponse } from 'next/server';
import { getTenantByKey } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const widgetId = searchParams.get('id');

    if (!key) {
        return NextResponse.json({ error: 'Missing API Key' }, { status: 400 });
    }

    // 1. Find Tenant by Key (using secure config)
    const tenant = getTenantByKey(key);

    if (!tenant) {
        return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
    }

    // 2. Check if Tenant is Active
    if (!tenant.active) {
        return NextResponse.json({ error: 'Tenant access revoked' }, { status: 403 });
    }

    // 3. Check Origin (Domain Authorization)
    const origin = request.headers.get('origin') || request.headers.get('referer');
    // In development (direct browser nav), origin might be null or localhost. 
    // For strict security, we'd block null, but for this demo we allow it or check if it matches.

    // Simple origin check (in prod use strict regex)
    if (tenant.allowedOrigins[0] !== '*') {
        if (!origin || !tenant.allowedOrigins.some(allowed => origin.includes(allowed))) {
            console.log(`Blocked origin: ${origin} for tenant ${tenant.name}`);
            return NextResponse.json({ error: 'Domain not authorized' }, { status: 403 });
        }
    }

    // 4. Success
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return NextResponse.json({
        valid: true,
        tenant: {
            id: tenant.id,
            name: tenant.name
        },
        config: {
            theme: 'light',
            primaryColor: '#2563eb', // blue-600
            position: 'bottom-right',
            title: `${tenant.name} Assistant`
        }
    }, { headers });
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
