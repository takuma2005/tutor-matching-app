// 認証サービスのモック実装

import { AuthService, User, ApiResponse, Student } from '../types';
import { mockStudents, mockDb, delay } from './data';

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
      role: 'student', // デフォルトでstudentとして設定
      avatar_url: userData.avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.users.push(newUser);
    const studentData = userData as Partial<Student> | undefined;
    const existingStudent = mockDb.students.find((s) => s.id === newUser.id);
    if (!existingStudent) {
      const now = new Date().toISOString();
      const newStudent: Student = {
        ...newUser,
        role: 'student',
        age: studentData?.age ?? 18,
        grade: studentData?.grade ?? '',
        subjects_interested: studentData?.subjects_interested ?? [],
        interested_subjects:
          studentData?.interested_subjects ?? studentData?.subjects_interested ?? [],
        learning_goals: studentData?.learning_goals,
        preferred_schedule: studentData?.preferred_schedule,
        coins: studentData?.coins ?? 0,
        school: studentData?.school,
        phone: studentData?.phone,
        bio: studentData?.bio,
        avatar: studentData?.avatar ?? studentData?.avatar_url,
        created_at: newUser.created_at || now,
        updated_at: newUser.updated_at || now,
      };
      mockDb.students.push(newStudent);
    }
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
