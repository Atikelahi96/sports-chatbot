'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { useChat } from './hooks/useChat';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    sessions,
    currentSession,
    isLoading,
    error,
    sendMessage,
    createNewSession,
    selectSession,
    deleteSession,
  } = useChat();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="h-screen flex bg-chat-bg text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-0
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out lg:transition-none
      `}>
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSession?.id || null}
          onNewChat={createNewSession}
          onSelectSession={selectSession}
          onDeleteSession={deleteSession}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-4 p-4 border-b border-chat-border">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-semibold">
            {currentSession?.title || 'New Chat'}
          </h1>
        </div>

        {/* Chat Area */}
        <ChatArea
          session={currentSession || null}
          isLoading={isLoading}
          error={error}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  );
}