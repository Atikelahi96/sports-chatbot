'use client';

import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-4 p-4 bg-gray-800">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-medium">
          AI
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  );
}
