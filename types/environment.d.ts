declare namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_CHAT_API_URL: string;
        NODE_ENV: 'development' | 'production' | 'test';
        [key: string]: string | undefined;
    }
}

declare var process: {
    env: NodeJS.ProcessEnv;
}
