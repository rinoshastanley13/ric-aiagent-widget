
export interface CMSContext {
    userId: string;
    role: string;
    permissions: string[];
    department: string;
    location: string;
    recentActivities: string[];
    // Add other attributes as needed (up to 10 as requested)
}

export async function fetchCMSContext(tenantId: string, email: string): Promise<CMSContext> {
    // In a real app, this would call the CMS API using the tenant's credentials
    // For now, we mock the response based on the input

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency

    return {
        userId: `cms-${Math.floor(Math.random() * 10000)}`,
        role: email.includes('admin') ? 'Administrator' : 'Viewer',
        permissions: ['read_docs', 'search_compliance'],
        department: 'Legal',
        location: 'New York',
        recentActivities: ['viewed_policy_A', 'searched_gdpr']
    };
}
