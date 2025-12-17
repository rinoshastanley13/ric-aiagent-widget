export interface TenantConfig {
    id: string;
    name: string;
    active: boolean;
    secretKey?: string; // Loaded from env
    allowedOrigins: string[];
}

export const AUTH_CONFIG = {
    tenants: {
        'ric-tenant': {
            id: 'T001',
            name: 'Ricago Website',
            active: true,
            secretKey: process.env.WIDGET_KEY_RIC_WEBSITE,
            allowedOrigins: ['*']
        },
        'cms-tenant': {
            id: 'T002',
            name: 'Client CMS',
            active: true,
            secretKey: process.env.WIDGET_KEY_CMS,
            allowedOrigins: ['*']
        },
        'apphub-tenant': {
            id: 'T003',
            name: 'App Hub',
            active: false,
            secretKey: process.env.WIDGET_KEY_APPHUB,
            allowedOrigins: ['*']
        },
        'unknown-tenant': {
            id: 'T004',
            name: 'Blocked Domain',
            active: true,
            // No key configured for blocked/unknown
            allowedOrigins: ['https://blocked.com']
        }
    } as Record<string, TenantConfig>
};

export function getTenantByKey(key: string): TenantConfig | undefined {
    // In a real DB scenario, this would be a query
    // Here we scan the config values
    return Object.values(AUTH_CONFIG.tenants).find(t => t.secretKey === key);
}
