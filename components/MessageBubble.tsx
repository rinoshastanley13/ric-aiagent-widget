'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot } from 'lucide-react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Message } from '@/types';
import { FileText } from "lucide-react";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; // Add this import
import DOMPurify from 'dompurify';
import { ChoiceButtons } from './ChoiceButtons';
import { ActsList } from './ActsList';
import { LeadGenForm } from './LeadGenForm';
import { DailyUpdatesCard } from './DailyUpdatesCard';
import { StatesSelector } from './StatesSelector';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  feedback?: 'thumbsUp' | 'thumbsDown' | null;
  onChoiceSelect?: (value: string, title: string) => void;
  allowHtml?: boolean;
}


const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  isStreaming = false,
  onChoiceSelect,
  allowHtml = false
}) => {
  if (message.acts) console.log('🚀 [MessageBubble] Rendering acts for message:', message.id, message.acts);
  const isUser = message.role === 'user';

  // Add state for feedback in your component
  const [feedback, setFeedback] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showStatesSelector, setShowStatesSelector] = useState(false);

  // Check if this message should show the lead form
  useEffect(() => {
    const shouldShowForm =
      message.leadFormTrigger ||
      message.content.toLowerCase().includes('ric_leadgenform') ||
      message.content.toLowerCase().includes('lead gen form');

    setShowLeadForm(shouldShowForm);
  }, [message.content, message.leadFormTrigger]);

  // Check if this message should show the states selector
  useEffect(() => {
    const shouldShowStates = message.content.toLowerCase().includes('ric_states');
    setShowStatesSelector(shouldShowStates);
  }, [message.content]);

  // Check if message contains technical triggers that should be hidden
  const shouldHideMessageContent = () => {
    const content = message.content.toLowerCase();
    const technicalTriggers = [
      'ric_leadgenform',
      'lead gen form',
      'switch_provider',
      '__end_switch',
      'ric_states'
    ];

    return technicalTriggers.some(trigger => content.includes(trigger));
  };

  const handleFeedback = (type: 'thumbsUp' | 'thumbsDown') => {
    setFeedback(type);
    // You can also send this feedback to your backend
    console.log(`User gave ${type} feedback for message:`, message.id);
  };

  const handleLeadFormSubmit = (data: any) => {
    console.log('Lead form submitted:', data);
    setShowLeadForm(false);
  };

  const handleLeadFormSkip = () => {
    console.log('Lead form skipped');
    setShowLeadForm(false);
  };

  // Function to detect if content contains HTML
  const containsHTML = (content: string) => {
    //return /<[^>]*>/.test(content);

    // Check for common HTML patterns
    /*
    const htmlPatterns = [
      // Opening tags (with optional attributes)
      /<([a-z][a-z0-9]*)\b[^>]*>/i,
      // Closing tags
      /<\/([a-z][a-z0-9]*)\b[^>]*>/i,
      // Self-closing tags
      /<([a-z][a-z0-9]*)\b[^>]*\/>/i,
      // HTML comments
      /<!--[\s\S]*?-->/,
      // HTML entities (though these might appear in plain text too)
      /&[a-z]+;/i,
      // DOCTYPE declaration
      /<!DOCTYPE\s+html/i
    ];

    // Check for any HTML pattern
    return htmlPatterns.some(pattern => pattern.test(content));
    */
    return false;
  };

  // Shadow DOM Component
  const ShadowDOMRenderer = ({ html }: { html: string }) => {
    const shadowHostRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useLayoutEffect(() => {
      if (shadowHostRef.current && !shadowHostRef.current.shadowRoot) {
        const shadowRoot = shadowHostRef.current.attachShadow({ mode: 'open' });

        // Add basic styles for better appearance
        const style = document.createElement('style');
        style.textContent = `
          :host {
            display: block;
            width: 100%;
            min-height: 200px;
          }
          body, html {
            margin: 0;
            padding: 0;
            font-family: system-ui, sans-serif;
            height: 100%;
          }
          * {
            box-sizing: border-box;
          }
        `;

        shadowRoot.appendChild(style);

        // Create a container for the content
        const container = document.createElement('div');
        container.innerHTML = html;
        shadowRoot.appendChild(container);

        // Mark as loaded to trigger any animations/transitions
        setTimeout(() => setIsLoaded(true), 50);
      }
    }, [html]);

    return (
      <div
        ref={shadowHostRef}
        className={`w-full min-h-[200px] transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
      />
    );
  };

  // Function to render HTML content safely
  const renderHTMLContent = (content: string) => {
    // Only verify HTML if explicitly allowed
    if (allowHtml && containsHTML(content)) {
      const sanitizedContent = DOMPurify.sanitize(content, {
        ADD_TAGS: ['iframe', 'script'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
      });

      return (
        <div className="html-content-container my-4 p-4 border border-gray-300 rounded-lg bg-white">
          <div className="text-xs text-gray-500 mb-2 font-medium">
            HTML Content Preview
          </div>
          <div className="relative min-h-[200px]">
            <ShadowDOMRenderer html={sanitizedContent} />
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom components for ReactMarkdown with enhanced styling - Memoized to prevent re-renders
  const MarkdownComponents = React.useMemo(() => ({
    // Code blocks with syntax highlighting
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeContent = String(children).replace(/\n$/, '');

      if (!inline && language) {
        return (
          <div className="code-block my-4 rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-gray-500">
            <div className="code-header bg-gray-800 text-gray-200 px-4 py-2 text-sm font-mono flex justify-between items-center">
              <span className="font-semibold">{language}</span>
              <button
                className="text-xs bg-gray-700 hover:bg-gray-600 cursor-pointer px-2 py-1 rounded transition-colors duration-200"
                onClick={() => navigator.clipboard.writeText(codeContent)}
              >
                Copy
              </button>
            </div>
            <pre className="m-0 p-4 overflow-x-auto">
              <code
                className={`block text-sm font-mono text-gray-100 leading-relaxed whitespace-pre ${className || ''}`}
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
                {...props}
              >
                {codeContent}
              </code>
            </pre>
          </div>
        );
      }

      return (
        <code
          className="inline-code bg-gray-800 text-gray-500 px-2 py-1 rounded text-sm font-mono border border-gray-600"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
          }}
          {...props}
        >
          {children}
        </code>
      );
    },

    // Preformatted text
    pre: ({ children }: any) => <div className="my-3">{children}</div>,

    // Blockquotes
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-3 italic text-gray-700 rounded-r">
        {children}
      </blockquote>
    ),

    // Tables with proper styling
    // Tables with proper alignment and styling
    // Enhanced tables with better styling
    table: ({ children }: any) => (
      <div className="table-container rounded-sm my-6 overflow-x-auto  border border-gray-200/80 shadow-lg bg-white/95 backdrop-blur-sm">

        <table className="markdown-table min-w-full ">
          {children}
        </table>
      </div>
    ),

    th: ({ children }: any) => (
      <th className="table-header px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-300/60">

        {children}
      </th>
    ),

    td: ({ children }: any) => (
      <td className="table-cell px-6 py-4 text-sm text-gray-600 leading-6 border-b border-gray-100/50">
        {children}
      </td>
    ),

    tr: ({ children }: any) => (
      <tr className="hover:bg-blue-50/30 transition-all duration-200 even:bg-gray-100/50">
        {children}
      </tr>
    ),

    thead: ({ children }: any) => (
      <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30">
        {children}
      </thead>
    ),

    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-gray-100/30">
        {children}
      </tbody>
    ),

    // Lists
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside text-sm my-3 space-y-1 ml-4">
        {children}
      </ul>
    ),

    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside my-3 text-sm space-y-1 ml-4">
        {children}
      </ol>
    ),

    li: ({ children }: any) => (
      <li className="text-gray-700 text-sm leading-relaxed">
        {children}
      </li>
    ),

    // Headings
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold my-4 text-gray-900 border-b border-gray-200 pb-2">
        {children}
      </h1>
    ),

    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold my-3 text-gray-900 border-b border-gray-200 pb-1">
        {children}
      </h2>
    ),

    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold my-2 text-gray-900">
        {children}
      </h3>
    ),

    h4: ({ children }: any) => (
      <h4 className="text-md font-semibold my-2 text-gray-800">
        {children}
      </h4>
    ),

    // Paragraphs
    p: ({ children }: any) => (
      <p className="my-2 text-gray-700 text-sm leading-relaxed">
        {children}
      </p>
    ),

    // Links
    a: ({ href, children }: any) => (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 text-sm underline transition-colors duration-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    // Strong/bold
    strong: ({ children }: any) => (
      <strong className="font-semibold text-sm text-gray-900">
        {children}
      </strong>
    ),

    // Emphasis/italic
    em: ({ children }: any) => (
      <em className="italic tex-sm text-gray-800">
        {children}
      </em>
    ),

    // Horizontal rule
    hr: () => (
      <hr className="my-6 border-gray-300" />
    ),
  }), [isUser]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[90%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`} style={{ gap: '0px' }}>
        {/* Avatar - Hidden for cleaner look matching HTML */}

        {/* Message Content */}
        <div
          className={`p-3 max-w-full ${isStreaming ? 'ring-2 ring-blue-200' : ''}`}
          style={isUser ? {
            background: 'linear-gradient(90deg, #22c55e, #1d549f)',
            color: 'white',
            borderRadius: '12px',
            borderBottomRightRadius: '0px',
            fontSize: '14px',
            lineHeight: '1.5'
          } : {
            background: 'white',
            color: '#2f3a4a',
            border: '1px solid #c1c2c4',
            borderRadius: '12px',
            borderBottomLeftRadius: '0px',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        >

          {/* Streaming indicator - Only show when thinking (no content yet) */}
          {isStreaming && !isUser && !message.content && (
            <div className="flex items-center mb-3 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}

          {/* File attachments */}
          {message.files && message.files.length > 0 && (
            <div className="mb-4 space-y-2">
              {message.files.map(file => (
                <div
                  key={file.id}
                  className="inline-flex items-center px-3 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {file.name}
                </div>
              ))}
            </div>
          )}

          {/* Message content */}
          {!shouldHideMessageContent() && (
            <div className={`prose max-w-none ${isUser ? 'prose-invert' : 'prose-gray'} prose-sm md:prose-base`}>
              {isUser ? (
                <div className="whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </div>
              ) : (
                <>
                  {/* Try to render as HTML first, fallback to markdown */}
                  {renderHTMLContent(message.content) || (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]} // Add rehypeRaw here
                      components={MarkdownComponents}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </>
              )}
            </div>
          )}



          {/* Acts List - Show before choice buttons */}
          {!isUser && message.acts && (
            <ActsList data={message.acts} />
          )}

          {/* Daily Updates Card - Show before choice buttons */}
          {!isUser && message.dailyUpdates && (
            <DailyUpdatesCard data={message.dailyUpdates} />
          )}

          {/* Choice Buttons */}
          {!isUser && message.choices && message.choices.length > 0 && onChoiceSelect && (
            <ChoiceButtons
              choices={message.choices!}
              onSelect={onChoiceSelect}
            />
          )}

          {/* States Selector */}
          {!isUser && showStatesSelector && onChoiceSelect && (
            <StatesSelector
              onSelect={(state) => onChoiceSelect(state, state)}
            />
          )}

          {/* Lead Generation Form */}
          {!isUser && showLeadForm && (
            <div className="mt-4">
              <LeadGenForm
                onSubmit={handleLeadFormSubmit}
                onSkip={handleLeadFormSkip}
              />
            </div>
          )}

          {/* Timestamp */}
          {!isUser && (
            <div className={`text-xs mt-3 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' '}
              <button className={`p-1 rounded transition-colors ${feedback === 'thumbsUp'
                ? 'bg-green-100 text-green-600'
                : 'hover:bg-gray-200 text-gray-500 cursor-pointer'
                }`}
                onClick={() => handleFeedback('thumbsUp')}
                title="Good response"
              >
                {' '}
                <ThumbsUp className="w-3 h-3" />
              </button>

              <button className={`p-1 rounded transition-colors ${feedback === 'thumbsDown'
                ? 'bg-red-100 text-red-600'
                : 'hover:bg-gray-200 text-gray-500 cursor-pointer'
                }`}
                onClick={() => handleFeedback('thumbsDown')}
                title="Bad response"
              >
                {' '}
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};
// Wrap with React.memo to prevent unnecessary re-renders during streaming
export const MessageBubble = React.memo(MessageBubbleComponent, (prevProps, nextProps) => {
  // Only re-render if message content, streaming status, or choices change
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.isStreaming === nextProps.isStreaming &&
    JSON.stringify(prevProps.message.choices) === JSON.stringify(nextProps.message.choices)
  );
});
