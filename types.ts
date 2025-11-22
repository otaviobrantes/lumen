
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string; // In a real app, this would be the stream URL
  duration: string; // e.g., "45m"
  category: string;
  progress?: number; // Percentage watched (0-100)
  isNew?: boolean;
  isPremium?: boolean; // Requires active subscription
}

export interface Activity {
  id: string;
  title: string;
  type: 'PDF' | 'COLORING' | 'PUZZLE' | 'GAME';
  thumbnailUrl: string;
  downloadUrl: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export type UserRole = 'USER' | 'ADMIN' | 'EDITOR';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscription: SubscriptionStatus;
  avatarUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum ChatRole {
  USER = 'user',
  MODEL = 'model'
}
