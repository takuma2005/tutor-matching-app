import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { getApiClient, API_CONFIG, mockStudents } from '@/services/api/mock';
import { User, Student } from '@/services/api/types';

interface AuthContextType {
  user: User | null;
  student: Student | null;
  role: 'student' | 'tutor' | null;
  isLoading: boolean;
  needsProfileCompletion: boolean;
  signIn: (userData: MockSignInInput) => Promise<boolean>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  switchRole: (
    newRole: 'student' | 'tutor',
  ) => Promise<{ success: boolean; needsCompletion?: boolean }>;
  completeProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// モックログイン用の入力型（電話番号ベースの擬似サインイン）
type MockSignInInput = {
  id: string;
  role: 'student' | 'tutor';
  phoneNumber: string;
  name: string;
  age?: string | number;
  grade?: string;
  email?: string;
};

const DEFAULT_MOCK_PASSWORD = 'password123';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [role, setRole] = useState<'student' | 'tutor' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  const apiClient = React.useMemo(() => getApiClient(), []);

  // 初期化時に現在のユーザー情報を取得
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await apiClient.auth.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          setRole(response.data.role);

          // 生徒プロフィールも取得
          const studentResponse = await apiClient.student.getProfile(response.data.id);
          if (studentResponse.success) {
            setStudent(studentResponse.data);
          }
        } else if (API_CONFIG.USE_MOCK) {
          // モック環境ではデフォルトユーザーで自動ログイン
          const def = mockStudents?.[0];
          if (def) {
            const mockUser: User = {
              id: def.id,
              email: def.email,
              name: def.name,
              role: 'student',
              created_at: def.created_at,
              updated_at: def.updated_at,
            };
            setUser(mockUser);
            setRole('student');
            const studentResponse = await apiClient.student.getProfile(mockUser.id);
            if (studentResponse.success) {
              setStudent(studentResponse.data);
            }
          }
        }
      } catch (error) {
        console.error('認証初期化エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [apiClient]);

  const signIn = React.useCallback(
    async (userData: MockSignInInput): Promise<boolean> => {
      try {
        setIsLoading(true);

        const sanitizedPhone = userData.phoneNumber.replace(/[^0-9]/g, '');
        const email =
          userData.email ||
          (sanitizedPhone ? `${sanitizedPhone}@example.com` : `${userData.id}@example.com`);

        let response = await apiClient.auth.signIn(email, DEFAULT_MOCK_PASSWORD);

        if (!response.success || !response.data) {
          const signUpResponse = await apiClient.auth.signUp(email, DEFAULT_MOCK_PASSWORD, {
            name: userData.name,
            role: userData.role,
          });

          if (!signUpResponse.success || !signUpResponse.data) {
            return false;
          }

          response = signUpResponse;
        }

        const authenticatedUser = response.data;
        setUser(authenticatedUser);
        setRole(authenticatedUser.role);

        if (authenticatedUser.role === 'student') {
          const studentResponse = await apiClient.student.getProfile(authenticatedUser.id);
          if (studentResponse.success) {
            setStudent(studentResponse.data);
          }
        } else {
          setStudent(null);
        }

        return true;
      } catch (error) {
        console.error('サインインエラー:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient],
  );

  const signUp = React.useCallback(
    async (email: string, password: string, userData: Partial<User>): Promise<boolean> => {
      try {
        setIsLoading(true);
        const response = await apiClient.auth.signUp(email, password, userData);

        if (response.success && response.data) {
          setUser(response.data);
          setRole(response.data.role);

          if (response.data.role === 'student') {
            const studentResponse = await apiClient.student.getProfile(response.data.id);
            if (studentResponse.success) {
              setStudent(studentResponse.data);
            }
          }
          return true;
        }

        return false;
      } catch (error) {
        console.error('サインアップエラー:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient],
  );

  const signOut = React.useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiClient.auth.signOut();
      if (response.success) {
        setUser(null);
        setStudent(null);
        setRole(null);
        setNeedsProfileCompletion(false);
      }
    } catch (error) {
      console.error('サインアウトエラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  const refreshUser = React.useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await apiClient.auth.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        setRole(response.data.role);

        const studentResponse = await apiClient.student.getProfile(response.data.id);
        if (studentResponse.success) {
          setStudent(studentResponse.data);
        }
      }
    } catch (error) {
      console.error('ユーザー情報更新エラー:', error);
    }
  }, [user, apiClient]);

  const updateProfile = React.useCallback(
    async (profileData: Partial<User>): Promise<boolean> => {
      if (!user) return false;

      try {
        setIsLoading(true);
        // Mock implementation - in real app would call API
        const updatedUser = { ...user, ...profileData, updated_at: new Date().toISOString() };
        setUser(updatedUser);
        return true;
      } catch (error) {
        console.error('プロフィール更新エラー:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  const switchRole = React.useCallback(
    async (
      newRole: 'student' | 'tutor',
    ): Promise<{ success: boolean; needsCompletion?: boolean }> => {
      if (!user) return { success: false };

      try {
        setIsLoading(true);

        // ユーザーの役割を更新
        const updatedUser = { ...user, role: newRole, updated_at: new Date().toISOString() };
        setUser(updatedUser);
        setRole(newRole);

        // 新しい役割でのプロファイル情報をチェック

        if (newRole === 'student') {
          // 学生プロファイルを確認/作成
          const studentResponse = await apiClient.student.getProfile(user.id);
          if (!studentResponse.success) {
            // 学生プロファイルが存在しない場合、最小限のプロファイルを作成
            const newStudent: Student = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: 'student',
              age: 18,
              grade: '',
              subjects_interested: [],
              coins: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setStudent(newStudent);
            setNeedsProfileCompletion(true);
            return { success: true, needsCompletion: true };
          } else {
            setStudent(studentResponse.data);
          }
        } else if (newRole === 'tutor') {
          // 先輩プロファイルを確認
          // TODO: Tutor API実装後に適切に処理
          setNeedsProfileCompletion(true);
          return { success: true, needsCompletion: true };
        }

        return { success: true, needsCompletion: false };
      } catch (error) {
        console.error('役割切り替えエラー:', error);
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [user, apiClient.student],
  );

  const completeProfile = React.useCallback(() => {
    setNeedsProfileCompletion(false);
    refreshUser().catch((error) => {
      console.error('プロフィール再取得エラー:', error);
    });
  }, [refreshUser]);

  const value: AuthContextType = React.useMemo(
    () => ({
      user,
      student,
      role,
      isLoading,
      needsProfileCompletion,
      signIn,
      signUp,
      signOut,
      refreshUser,
      updateProfile,
      switchRole,
      completeProfile,
    }),
    [
      user,
      student,
      role,
      isLoading,
      needsProfileCompletion,
      signIn,
      signUp,
      signOut,
      refreshUser,
      updateProfile,
      switchRole,
      completeProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
