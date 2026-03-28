'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketParams {
  sessionId: string;
  userName: string;
  userId: string;
}

export const useWebSocket = ({ sessionId, userName, userId }: WebSocketParams) => {
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      socket.emit('join-session', {
        sessionId,
        user: { id: userId, name: userName },
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('user-joined', (user) => {
      console.log('User joined:', user);
      setOnlineUsers((prev) => [...prev, user]);
    });

    socket.on('user-left', (user) => {
      console.log('User left:', user);
      setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, userName, userId]);

  const emitCodeChange = useCallback((code: string) => {
    if (socketRef.current) {
      socketRef.current.emit('code-change', { sessionId, code, userId });
    }
  }, [sessionId, userId]);

  const emitCursorMove = useCallback((position: { line: number; column: number }, name: string, color: string) => {
    if (socketRef.current) {
      socketRef.current.emit('cursor-move', { sessionId, position, userId, name, color });
    }
  }, [sessionId, userId]);

  const emitLanguageChange = useCallback((language: string) => {
    if (socketRef.current) {
      socketRef.current.emit('language-change', { sessionId, language });
    }
  }, [sessionId]);

  const emitModeChange = useCallback((mode: string) => {
    if (socketRef.current) {
      socketRef.current.emit('mode-change', { sessionId, mode });
    }
  }, [sessionId]);

  return {
    socket: socketRef.current,
    onlineUsers,
    isConnected,
    emitCodeChange,
    emitCursorMove,
    emitLanguageChange,
    emitModeChange,
  };
};
