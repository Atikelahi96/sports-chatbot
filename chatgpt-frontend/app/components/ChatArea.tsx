'use client';

import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';
import { ChatSession } from '../types/chat';

interface ChatAreaProps {
  session: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
}

export default function ChatArea({ session, isLoading, error, onSendMessage }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {!session || session.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-2">ChatGPT-like Assistant</h1>
              <p>Start a conversation by typing a message below</p>
            </div>
          </div>
        ) : (
          <>
            {session.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
        
        {error && (
          <div className="p-4 bg-red-900 border-l-4 border-red-500 m-4">
            <p className="text-red-200">Error: {error}</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
}
