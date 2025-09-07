import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import { getApiClient } from '../services/api/mock';

import { useAuth } from '@/contexts/AuthContext';
import coinEvents from '@/domain/coin/coinEvents';

export interface UserProfile {
  id: string;
  name: string;
  school: string;
  grade: string;
  email: string;
  phone: string;
  interestedSubjects: string[];
  bio: string;
  avatar?: string;
  coins: number;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshCoins: () => Promise<void>;
  updateCoins: (value: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshingRef = React.useRef(false);
  const lastRefreshRef = React.useRef<number>(0);
  const { user: authUser } = useAuth();

  const loadUserProfile = useCallback(async () => {
    const userId = authUser?.id;
    if (!userId) {
      // 認証ユーザがいない場合は何もしない（ゲスト）
      setUser(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const api = getApiClient();
      const response = await api.student.getProfile(userId);

      if (response?.success && response.data) {
        const student = response.data;
        setUser({
          id: student.id,
          name: student.name,
          school: student.school || '未設定',
          grade: student.grade || '未設定',
          email: student.email || '',
          phone: student.phone || '',
          interestedSubjects: student.interested_subjects || [],
          bio: student.bio || '',
          avatar: student.avatar,
          coins: student.coins || 0,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setError('プロフィールの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<boolean> => {
      if (!user) return false;

      try {
        setLoading(true);
        setError(null);

        const api = getApiClient();
        const response = await api.student.updateProfile(user.id, {
          name: updates.name || user.name,
          grade: updates.grade || user.grade,
          email: updates.email || user.email,
          phone: updates.phone || user.phone,
          subjects_interested: updates.interestedSubjects || user.interestedSubjects,
          bio: updates.bio || user.bio,
          school: updates.school || user.school,
        });

        if (response?.success) {
          setUser((prev) => (prev ? { ...prev, ...updates } : null));
          return true;
        } else {
          setError('プロフィールの更新に失敗しました');
          return false;
        }
      } catch (err) {
        console.error('Failed to update user profile:', err);
        setError('プロフィールの更新に失敗しました');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const refreshCoins = useCallback(async () => {
    if (!user?.id) return;

    const now = Date.now();
    // 5秒以内の連続呼び出しや同時実行を抑止
    if (refreshingRef.current || now - lastRefreshRef.current < 5000) return;

    try {
      refreshingRef.current = true;
      const api = getApiClient();
      const response = await api.student.getProfile(user.id);

      if (response?.success && response.data) {
        setUser((prev) => (prev ? { ...prev, coins: response.data.coins || 0 } : null));
      }
    } catch (err) {
      console.error('Failed to refresh coins:', err);
    } finally {
      lastRefreshRef.current = Date.now();
      refreshingRef.current = false;
    }
  }, [user?.id]);

  const updateCoins = useCallback((value: number) => {
    setUser((prev) => (prev ? { ...prev, coins: value } : prev));
  }, []);

  useEffect(() => {
    // 認証ユーザの変化に合わせてロード
    loadUserProfile();
  }, [authUser?.id, loadUserProfile]);

  // Coin domain events -> reflect globally
  useEffect(() => {
    const unsub = coinEvents.onBalanceChanged((balance) => {
      setUser((prev) => (prev ? { ...prev, coins: balance } : prev));
    });
    return () => {
      unsub();
    };
  }, []);

  const contextValue: UserContextType = useMemo(
    () => ({
      user,
      loading,
      error,
      loadUserProfile,
      updateUserProfile,
      refreshCoins,
      updateCoins,
    }),
    [user, loading, error, loadUserProfile, updateUserProfile, refreshCoins, updateCoins],
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};
