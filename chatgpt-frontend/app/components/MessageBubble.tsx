'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`flex gap-4 p-4 ${message.isUser ? 'bg-chat-bg' : 'bg-gray-800'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          message.isUser 
            ? 'bg-purple-600' 
            : 'bg-green-600'
        }`}>
          {message.isUser ? 'U' : 'AI'}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="prose prose-invert max-w-none">
          {message.isUser ? (
            <p className="text-white m-0">{message.text}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="text-white m-0 mb-2 last:mb-0">{children}</p>,
                code: ({ children }) => (
                  <code className="bg-gray-700 px-1 py-0.5 rounded text-sm">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-700 p-3 rounded-lg overflow-x-auto my-2">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => <ul className="list-disc pl-4 my-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 my-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold mt-2 mb-1">{children}</h3>,
              }}
            >
              {message.text}
            </ReactMarkdown>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
