// モックサービスの統合インデックス

import { mockAuthService } from './authService';
import { mockCoinService } from './coinService';
import { mockStudentService } from './studentService';

// すべてのモックサービスを統合したAPIクライアント
export const mockApiClient = {
  auth: mockAuthService,
  student: mockStudentService,
  coin: mockCoinService,
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
export const getApiClient = () => {
  if (API_CONFIG.USE_MOCK) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('🧪 Using Mock API Client');
    }
    return mockApiClient;
  } else {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('🌐 Using Production API Client');
    }
    // 本番APIクライアントをここで返す（後で実装）
    throw new Error('Production API client not implemented yet');
  }
};

export default mockApiClient;
