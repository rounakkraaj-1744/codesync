'use client';

import { create } from 'zustand';

interface SessionState {
  sessionId: string;
  setSessionId: (id: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  mode: 'interview' | 'teaching' | 'pair-programming';
  setMode: (mode: 'interview' | 'teaching' | 'pair-programming') => void;
  code: string;
  setCode: (code: string) => void;
  isAIEnabled: boolean;
  toggleAI: () => void;
  onlineUsers: any[];
  setOnlineUsers: (users: any[]) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: '',
  setSessionId: (id) => set({ sessionId: id }),
  language: 'javascript',
  setLanguage: (lang) => set({ language: lang }),
  mode: 'pair-programming',
  setMode: (mode) => set({ mode }),
  code: '// Happy Coding!',
  setCode: (code) => set({ code }),
  isAIEnabled: true,
  toggleAI: () => set((state) => ({ isAIEnabled: !state.isAIEnabled })),
  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));
