"use client";
import { useEffect, useState } from "react";

export type WidgetContext = {
    user_name?: string;
    user_email?: string;
    app_id?: string;
    app_unique_key?: string;
    tenantId?: string;
    company?: string;
};

export function useWidgetBridge() {
    const [context, setContext] = useState<WidgetContext | null>(null);

    useEffect(() => {
        console.log("🟢 Widget mounted, sending READY");
        // Signal to parent window that iframe is ready
        // We send this periodically? No, just once on mount usually works if the listener is ready.
        // However, if the iframe loads faster than the parent script attaches listener...
        // The parent script creates the iframe, so it should attach listener immediately.
        window.parent.postMessage({ type: "WIDGET_READY" }, "*");

        const handler = (event: MessageEvent) => {
            // Listen for initialization data from parent
            if (event.data?.type === "INIT_WIDGET") {
                console.log("📩 Widget got context:", event.data.payload);
                setContext(event.data.payload);
            }
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    return { context };
}
