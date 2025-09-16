// モックサービスの統合インデックス

import { mockAuthService } from './authService';
import { mockChatService } from './chatService';
import { mockCoinService } from './coinService';
import { mockNotificationService } from './notificationService';
import { mockRealtimeService } from './realtimeService';
import { mockStudentService } from './studentService';
import { mockTutorService } from './tutorService';

// すべてのモックサービスを統合したAPIクライアント
export const mockApiClient = {
  auth: mockAuthService,
  student: mockStudentService,
  coin: mockCoinService,
  chat: mockChatService,
  tutor: mockTutorService,
  notification: mockNotificationService,
  realtime: mockRealtimeService,
};

// 個別エクスポート
export { mockAuthService } from './authService';
export { mockStudentService } from './studentService';
export { mockTutorService } from './tutorService';
export { mockCoinService } from './coinService';
export { mockNotificationService } from './notificationService';
export { mockRealtimeService } from './realtimeService';
export { mockChatService } from './chatService';

// テストデータもエクスポート
export * from './data';

// API フラグを使った切り替え用の設定
export const API_CONFIG = {
  // 新: 明示的なAPIモード（mock | supabase）。未設定時は下記USE_MOCKにフォールバック
  API_MODE:
    (typeof process !== 'undefined' && (process.env?.EXPO_PUBLIC_API_MODE as string | undefined)) ||
    undefined,
  // 旧: 後方互換のため維持
  USE_MOCK:
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_USE_MOCK === 'true') ||
    (typeof __DEV__ !== 'undefined' && __DEV__ === true),
  MOCK_DELAY: {
    SHORT: 200,
    MEDIUM: 500,
    LONG: 1000,
  },
};

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
    sendMatchRequest: async (
      _studentId: string,
      _tutorId: string,
      _message: string,
      _scheduleNote?: string,
    ) => notImplemented('student.sendMatchRequest'),
    getMatchRequests: async (_studentId: string, _status?: unknown) => ({
      success: true,
      data: [],
    }),
    cancelMatchRequest: async (_matchId: string) => notImplemented('student.cancelMatchRequest'),
    // レッスン関連
    bookLesson: async (_tutorId: string, _lessonData: unknown) =>
      notImplemented('student.bookLesson'),
    getLessons: async (
      _studentId: string,
      _filters?: unknown,
      _page?: number,
      _limit?: number,
    ) => ({
      success: true,
      data: [],
      pagination: { page: 1, limit: 0, total: 0, has_more: false },
    }),
    rateLesson: async (_lessonId: string, _rating: number) => notImplemented('student.rateLesson'),
  },
  tutor: {
    getProfile: async (_userId: string) => notImplemented('tutor.getProfile'),
    updateProfile: async (_userId: string, _updates: unknown) =>
      notImplemented('tutor.updateProfile'),
    getMatchRequests: async (_status?: unknown) => ({ success: true, data: [] }),
    approveMatchRequest: async (_matchId: string) => notImplemented('tutor.approveMatchRequest'),
    rejectMatchRequest: async (_matchId: string, _reason?: string) =>
      notImplemented('tutor.rejectMatchRequest'),
    getLessons: async (_filters?: unknown, _page?: number, _limit?: number) => ({
      success: true,
      data: [],
      pagination: { page: 1, limit: 0, total: 0, has_more: false },
    }),
    updateLesson: async (_lessonId: string, _updates: unknown) =>
      notImplemented('tutor.updateLesson'),
    updateAvailability: async (_userId: string, _availability: unknown) =>
      notImplemented('tutor.updateAvailability'),
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
    updateMessageStatus: async (_messageId: string, _status: string, _userId?: string) =>
      notImplemented('chat.updateMessageStatus'),
    createChatRoom: async (_tutorId: string, _studentId: string) =>
      notImplemented('chat.createChatRoom'),
    reportUser: async (
      _chatRoomId: string,
      _reporterId: string,
      _reportedUserId: string,
      _reason?: string,
    ) => notImplemented('chat.reportUser'),
    blockUser: async (_chatRoomId: string, _blockerId: string, _blockedUserId: string) =>
      notImplemented('chat.blockUser'),
    getModerationStatus: async (_chatRoomId: string, _userId: string) => ({
      success: true,
      data: { blockedUsers: [], blockedByOtherUserId: null },
    }),
  },
};

export const getApiClient = () => {
  // 明示的なAPIモードがあれば最優先
  const mode = ((): string => {
    if (typeof process === 'undefined') return '';
    const v = process.env?.EXPO_PUBLIC_API_MODE;
    return typeof v === 'string' ? v.toLowerCase().trim() : '';
  })();

  if (mode === 'mock') return mockApiClient;
  if (mode === 'supabase') return prodApiClient;

  // フォールバック（後方互換）
  return API_CONFIG.USE_MOCK ? mockApiClient : prodApiClient;
};

export default mockApiClient;
