// チャット機能のRepository インターフェース
// リアルタイムチャット機能のモック→Supabase統合を見据えた抽象化

import type { Message, ChatRoom } from '@/services/api/types';

export interface PaginationParams {
  limit?: number;
  before?: string; // カーソルベースのページネーション用
}

export interface TypingInfo {
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface ChatRepository {
  // メッセージ操作
  listMessages(roomId: string, params?: PaginationParams): Promise<Message[]>;
  sendMessage(roomId: string, senderId: string, text: string): Promise<Message>;

  // リアルタイム機能
  subscribeMessages(roomId: string, callback: (message: Message) => void): () => void;

  // タイピングインジケーター
  setTyping(roomId: string, userId: string, isTyping: boolean): Promise<void>;
  subscribeTyping(roomId: string, callback: (typingInfo: TypingInfo) => void): () => void;

  // チャットルーム操作
  getChatRooms(userId: string): Promise<ChatRoom[]>;
  createChatRoom(tutorId: string, studentId: string): Promise<ChatRoom>;
}

// チャット用のフック向けの型定義
export interface ChatHookState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  typingUsers: Set<string>;
}

export interface ChatHookActions {
  sendMessage: (text: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  retry: () => void;
}

// エラー型
export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = true,
  ) {
    super(message);
    this.name = 'ChatError';
  }
}
