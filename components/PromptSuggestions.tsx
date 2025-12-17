'use client';

import React from 'react';
import { PromptTemplate } from '@/types';

const promptCategories: { [key: string]: PromptTemplate[] } = {
  compliance: [
    { id: '1', title: 'Updates Applicable', category: 'compliance', content: 'In the context of Daily Updates from the regulatory bodies, list down all tax related \n amendments happened since 5 years.', icon: '📄' },
    { id: '2', title: 'Labor Laws Update', category: 'compliance', content: 'Explain GST Act provisions...', icon: '💰' },
    { id: '3', title: 'Corporate Tax Act', category: 'compliance', content: 'Corporate tax guidelines...', icon: '🏢' },
    { id: '4', title: 'Income Tax Act', category: 'compliance', content: 'Details about Income Tax Act...', icon: '💵' }, 
    { id: '5', title: 'Labor Laws', category: 'compliance', content: 'Overview of Labor Laws...', icon: '👷' },
  ],
  actions: [
    { id: '6', title: 'Daily Updates', category: 'actions', content: 'Refer all SEBI, RBI and other regulatory body sites. Pull out all compliances updates that are applicable for \n IT Industry and summary of amendments for 3 years.', icon: '🧾' },
    { id: '7', title: 'Pending Compliances', category: 'actions', content: 'Show pending compliances...', icon: '⏳' },
    { id: '8', title: 'Dashboard', category: 'actions', content: 'Show compliance dashboard...', icon: '📊' },
    { id: '9', title: 'Heatmap', category: 'actions', content: 'Display compliance heatmap...', icon: '🗺️' },
    { id: '10', title: 'Reminders', category: 'actions', content: 'List upcoming reminders...', icon: '⏰' },
    { id: '11', title: 'Notices', category: 'actions', content: 'Show recent notices...', icon: '📢' },
    { id: '12', title: 'Filings', category: 'actions', content: 'Access filing documents...', icon: '🗂️' },
  ],
  general: [
    { id: '13', title: 'GST Policy', category: 'general', content: 'Guide for GST policy...', icon: '🔧' },
    { id: '14', title: 'SOP for Corporate Tax', category: 'general', content: 'SOP drafting guide...', icon: '📝' },
    { id: '15', title: 'Income Tax Act 2023', category: 'general', content: 'Key changes overview...', icon: '📰' },
    { id: '16', title: 'Best ractices for LLC', category: 'general', content: 'Labor law best practices...', icon: '✅' },
    { id: '17', title: 'Tips for Leave Mgmt.', category: 'general', content: 'Leave management tips...', icon: '📅' },
    { id: '18', title: 'Compliance Heatmaps', category: 'general', content: 'Compliance heatmap insights...', icon: '🌡️' },
  ],
};

interface PromptSuggestionsProps {
  onPromptSelect: (prompt: PromptTemplate) => void;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onPromptSelect }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Compliance Prompts */}
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-white shadow-lg ring-2 ring-blue-100 ring-inset">
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {promptCategories.compliance.map(prompt => (
                <button
                  key={prompt.id}
                  onClick={() => onPromptSelect(prompt)}
                  className="flex-shrink-0 w-64 p-3 rounded-lg border border-blue-300 hover:border-blue-400 hover:bg-white transition-all duration-200 text-left group hover:shadow-md bg-blue-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-1">{prompt.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 text-base leading-tight">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {prompt.description || `Learn more about ${prompt.title}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-2 w-20 bg-gradient-to-l from-blue-50 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* My Actions */}
        <div className="bg-green-50 rounded-xl p-4 border-2 border-white shadow-lg ring-2 ring-blue-100 ring-inset">
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {promptCategories.actions.map(prompt => (
                <button
                  key={prompt.id}
                  onClick={() => onPromptSelect(prompt)}
                  className="flex-shrink-0 w-64 p-3 rounded-lg border border-green-300 hover:border-green-400 hover:bg-white transition-all duration-200 text-left group hover:shadow-md bg-green-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-1">{prompt.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 group-hover:text-green-600 text-base leading-tight">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {prompt.description || `Access ${prompt.title}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-2 w-20 bg-gradient-to-l from-green-50 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* General */}
        <div className="bg-yellow-50 rounded-xl p-4 border-2 border-white shadow-lg ring-2 ring-blue-100 ring-inset">
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {promptCategories.general.map(prompt => (
                <button
                  key={prompt.id}
                  onClick={() => onPromptSelect(prompt)}
                  className="flex-shrink-0 w-64 p-3 rounded-lg border border-yellow-300 hover:border-yellow-400 hover:bg-white transition-all duration-200 text-left group hover:shadow-md bg-yellow-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-1">{prompt.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 group-hover:text-yellow-600 text-base leading-tight">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {prompt.description || `Learn about ${prompt.title}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-2 w-20 bg-gradient-to-l from-yellow-50 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
};