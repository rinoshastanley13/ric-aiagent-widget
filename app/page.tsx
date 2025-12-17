'use client';

import { Header } from '@/components/Header';
import { UserMenu } from '@/components/UserMenu';
import { ChatAgent } from '@/components/ChatAgent';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <UserMenu />
        <ChatAgent />
      </div>
    </div>
  );
}