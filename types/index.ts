export interface User {
  id: string;
  name: string;
  email?: string;
  color?: string;
  role?: 'owner' | 'collaborator' | 'viewer';
}

export interface Session {
  id: string;
  title?: string;
  language: string;
  mode: 'interview' | 'teaching' | 'pair-programming';
  code: string;
  createdAt: string;
  isPublic: boolean;
  creatorId?: string;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface CursorUpdate {
  userId: string;
  name: string;
  color: string;
  position: CursorPosition;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId?: string;
  name?: string;
  message: string;
  timestamp: string;
  isAI: boolean;
}
