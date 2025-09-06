import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { getApiClient, API_CONFIG, mockStudents } from '@/services/api/mock';
import { User, Student } from '@/services/api/types';

interface AuthContextType {
  user: User | null;
  student: Student | null;
  isLoading: boolean;
  signIn: (userData: MockSignInInput) => Promise<boolean>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiClient = React.useMemo(() => getApiClient(), []);

  // 初期化時に現在のユーザー情報を取得
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await apiClient.auth.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);

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
              created_at: def.created_at,
              updated_at: def.updated_at,
            };
            setUser(mockUser);
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

  const signIn = async (userData: MockSignInInput): Promise<boolean> => {
    try {
      setIsLoading(true);

      // モック：ユーザーデータを直接設定（services/api/types.ts に準拠）
      const newUser: User = {
        id: userData.id,
        email: `${userData.phoneNumber.replace(/-/g, '')}@example.com`, // 仮のメール
        name: userData.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(newUser);

      // 生徒の場合は学生プロフィールも作成（最小限）
      if (userData.role === 'student') {
        const ageNum =
          typeof userData.age === 'number'
            ? userData.age
            : Number.parseInt((userData.age ?? '16') as string, 10);
        const newStudent: Student = {
          id: userData.id,
          name: userData.name,
          email: newUser.email,
          age: ageNum,
          grade: userData.grade ?? '',
          subjects_interested: [],
          coins: 1000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setStudent(newStudent);
      }

      return true;
    } catch (error) {
      console.error('サインインエラー:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.auth.signUp(email, password, userData);

      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }

      return false;
    } catch (error) {
      console.error('サインアップエラー:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.auth.signOut();
      setUser(null);
      setStudent(null);
    } catch (error) {
      console.error('サインアウトエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await apiClient.auth.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);

        const studentResponse = await apiClient.student.getProfile(response.data.id);
        if (studentResponse.success) {
          setStudent(studentResponse.data);
        }
      }
    } catch (error) {
      console.error('ユーザー情報更新エラー:', error);
    }
  };

  const value: AuthContextType = {
    user,
    student,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
