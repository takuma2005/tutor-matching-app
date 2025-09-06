// 認証サービスのモック実装

import { AuthService, User, ApiResponse } from '../types';
import { mockStudents, delay } from './data';

class MockAuthService implements AuthService {
  private currentUser: User | null = null;
  private users: User[] = [...mockStudents];

  async signIn(email: string, password: string): Promise<ApiResponse<User>> {
    await delay(500); // 実際のAPIコールをシミュレート

    const user = this.users.find((u) => u.email === email);

    if (!user) {
      return {
        data: null as unknown as User,
        success: false,
        error: 'ユーザーが見つかりません',
      };
    }

    // パスワードは簡単にチェック（実際には暗号化されたパスワードと比較）
    if (password !== 'password123') {
      return {
        data: null as unknown as User,
        success: false,
        error: 'パスワードが正しくありません',
      };
    }

    this.currentUser = user;

    return {
      data: user,
      success: true,
    };
  }

  async signUp(
    email: string,
    password: string,
    userData: Partial<User>,
  ): Promise<ApiResponse<User>> {
    await delay(800);

    // 既存ユーザーチェック
    if (this.users.find((u) => u.email === email)) {
      return {
        data: null as unknown as User,
        success: false,
        error: 'このメールアドレスは既に登録されています',
      };
    }

    // 新しいユーザーを作成
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'Unknown User',
      email,
      avatar_url: userData.avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.currentUser = newUser;

    return {
      data: newUser,
      success: true,
    };
  }

  async signOut(): Promise<ApiResponse<null>> {
    await delay(200);

    this.currentUser = null;

    return {
      data: null,
      success: true,
    };
  }

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    await delay(100);

    return {
      data: this.currentUser,
      success: true,
    };
  }

  // テスト用メソッド（本番では削除）
  setMockCurrentUser(user: User): void {
    this.currentUser = user;
  }

  getMockUsers(): User[] {
    return [...this.users];
  }
}

export const mockAuthService = new MockAuthService();
export default MockAuthService;
