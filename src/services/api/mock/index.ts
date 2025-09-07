// モックサービスの統合インデックス

import { mockAuthService } from './authService';
import { mockChatService } from './chatService';
import { mockCoinService } from './coinService';
import { mockStudentService } from './studentService';

// すべてのモックサービスを統合したAPIクライアント
export const mockApiClient = {
  auth: mockAuthService,
  student: mockStudentService,
  coin: mockCoinService,
  chat: mockChatService,
};

// 個別エクスポート
export { mockAuthService } from './authService';
export { mockStudentService } from './studentService';
export { mockCoinService } from './coinService';

// テストデータもエクスポート
export * from './data';

// API フラグを使った切り替え用の設定
export const API_CONFIG = {
  USE_MOCK:
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_USE_MOCK === 'true') ||
    (typeof __DEV__ !== 'undefined' && __DEV__ === true),
  MOCK_DELAY: {
    SHORT: 200,
    MEDIUM: 500,
    LONG: 1000,
  },
};

// 環境設定用のヘルパー関数
let __mockLogPrinted = false;

// 最小限の本番用スタブクライアント（未実装でもアプリが落ちないように）
const notImplemented = (name: string) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`API stub hit: ${name} is not implemented`);
  }
  return { success: false as const, error: 'NotImplemented', data: null as unknown as never };
};

const prodApiClient = {
  auth: {
    signIn: async (_email: string, _password: string) => notImplemented('auth.signIn'),
    signUp: async (_email: string, _password: string, _userData: unknown) =>
      notImplemented('auth.signUp'),
    signOut: async () => notImplemented('auth.signOut'),
    getCurrentUser: async () => ({ success: true, data: null }),
  },
  student: {
    getProfile: async (_userId: string) => notImplemented('student.getProfile'),
    updateProfile: async (_userId: string, _updates: unknown) =>
      notImplemented('student.updateProfile'),
    searchTutors: async (_filters?: unknown, _page?: number, _limit?: number) => ({
      success: true,
      data: [],
      pagination: { page: 1, limit: 0, total: 0, has_more: false },
    }),
    // マッチング関連（本番スタブ）
    sendMatchRequest: async (_tutorId: string, _message: string) =>
      notImplemented('student.sendMatchRequest'),
    getMatchRequests: async (_status?: unknown) => ({ success: true, data: [] }),
    cancelMatchRequest: async (_matchId: string) => notImplemented('student.cancelMatchRequest'),
    // レッスン関連
    bookLesson: async (_tutorId: string, _lessonData: unknown) =>
      notImplemented('student.bookLesson'),
    getLessons: async (_filters?: unknown, _page?: number, _limit?: number) => ({
      success: true,
      data: [],
      pagination: { page: 1, limit: 0, total: 0, has_more: false },
    }),
    rateLesson: async (_lessonId: string, _rating: number) => notImplemented('student.rateLesson'),
  },
  coin: {
    getBalance: async (_userId: string) => ({ success: true, data: { balance: 0 } }),
    purchaseCoins: async (_userId: string, _amount: number, _pmId: string) =>
      notImplemented('coin.purchaseCoins'),
    getTransactionHistory: async (_userId: string, _page?: number, _limit?: number) => ({
      success: true,
      data: [],
      pagination: { page: 1, limit: 0, total: 0, has_more: false },
    }),
  },
  chat: {
    getChatRooms: async (_studentId: string) => ({ success: true, data: [] }),
    getMessages: async (_chatRoomId: string, _page?: number, _limit?: number) => ({
      success: true,
      data: [],
      pagination: { page: 1, limit: 0, total: 0, has_more: false },
    }),
    sendMessage: async (_chatRoomId: string, _senderId: string, _text: string) =>
      notImplemented('chat.sendMessage'),
    updateMessageStatus: async (_messageId: string, _status: string) =>
      notImplemented('chat.updateMessageStatus'),
    createChatRoom: async (_tutorId: string, _studentId: string) =>
      notImplemented('chat.createChatRoom'),
  },
};

export const getApiClient = () => {
  if (API_CONFIG.USE_MOCK) {
    if (typeof __DEV__ !== 'undefined' && __DEV__ && !__mockLogPrinted) {
      console.log('🧪 Using Mock API Client');
      __mockLogPrinted = true;
    }
    return mockApiClient;
  } else {
    if (typeof __DEV__ !== 'undefined' && __DEV__ && !__mockLogPrinted) {
      console.log('🌐 Using Production API Client (stub)');
      __mockLogPrinted = true;
    }
    // 暫定：本番未実装でもスタブを返してアプリを継続させる
    return prodApiClient;
  }
};

export default mockApiClient;
