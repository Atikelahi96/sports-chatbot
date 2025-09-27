import React from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { ChatSession } from '../types/chat';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function Sidebar({ 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession, 
  onDeleteSession 
}: SidebarProps) {
  return (
    <div className="w-64 bg-chat-sidebar h-full flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-chat-border hover:bg-gray-700 transition-colors"
        >
          <Plus size={18} />
          <span>New chat</span>
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto px-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`group flex items-center gap-3 px-3 py-2 mb-1 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors ${
              currentSessionId === session.id ? 'bg-gray-700' : ''
            }`}
            onClick={() => onSelectSession(session.id)}
          >
            <MessageSquare size={16} className="flex-shrink-0" />
            <span className="flex-1 text-sm truncate">{session.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}