export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  level: 'A2' | 'B1' | 'B2' | 'C1';
  goal: string | null;
  tier: 'free' | 'pro' | 'lifetime';
  createdAt: string;
}

export interface UserStats {
  total: number;
  correct: number;
  accuracy: number;
}

export interface Save {
  id: string;
  text: string;
  sentence: string | null;
  sourceUrl: string | null;
  sourceTitle: string | null;
  category: string | null;
  createdAt: string;
}

export interface CreateSavePayload {
  text: string;
  sentence?: string;
  paragraph?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  category?: string;
}

export interface Quiz {
  id: string;
  saveId: string;
  question: string;
  options: string[];
  correct?: string;
  explanation?: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  createdAt: string;
}
