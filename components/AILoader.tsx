'use client';

import React from 'react';
import { Bot } from 'lucide-react';

export const AILoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in duration-700">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
        <div className="relative bg-white p-4 rounded-full shadow-sm border border-blue-50">
          <Bot className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="h-2 w-24 bg-gray-100 rounded-full mx-auto animate-pulse"></div>
        <div className="h-2 w-32 bg-gray-50 rounded-full mx-auto animate-pulse delay-75"></div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 font-medium tracking-wide uppercase">
        Ricago AI Assistant
      </p>
    </div>
  );
};
