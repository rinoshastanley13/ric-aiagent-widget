
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Assistant Widget',
    description: 'Embeddable Chat Assistant',
};

export default function WidgetLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen w-screen bg-white overflow-hidden">
            {children}
        </div>
    );
}
