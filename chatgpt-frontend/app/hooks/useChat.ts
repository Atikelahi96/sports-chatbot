import { useState, useCallback } from 'react';
import { Message, ChatSession, ApiResponse } from '../types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentSession = useCallback(() => {
    return sessions.find(s => s.id === currentSessionId);
  }, [sessions, currentSessionId]);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession;
  }, []);

  const updateSessionTitle = useCallback((sessionId: string, firstMessage: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '')
          }
        : session
    ));
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      let session = getCurrentSession();
      if (!session) {
        session = createNewSession();
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setSessions(prev => prev.map(s => 
        s.id === session!.id 
          ? { 
              ...s, 
              messages: [...s.messages, userMessage],
              updatedAt: new Date()
            }
          : s
      ));

      // Update title if this is the first message
      if (session.messages.length === 0) {
        updateSessionTitle(session.id, text);
      }

      // Call API
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          session_id: currentSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setSessions(prev => prev.map(s => 
        s.id === session!.id 
          ? { 
              ...s, 
              messages: [...s.messages, aiMessage],
              updatedAt: new Date()
            }
          : s
      ));

      // Update session ID if it's new
      if (!currentSessionId && data.session_id) {
        setCurrentSessionId(data.session_id);
        setSessions(prev => prev.map(s => 
          s.id === session!.id 
            ? { ...s, id: data.session_id }
            : s
        ));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, getCurrentSession, createNewSession, updateSessionTitle]);

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  }, [currentSessionId]);

  return {
    sessions,
    currentSession: getCurrentSession(),
    isLoading,
    error,
    sendMessage,
    createNewSession,
    selectSession,
    deleteSession,
  };
}