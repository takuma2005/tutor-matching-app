import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import 'react-native-get-random-values';
import uuid from 'react-native-uuid';

// お気に入りの型定義
export type FavoriteTutor = {
  id: string;
  tutorId: string;
  studentId: string;
  addedAt: Date;
};

type FavoritesContextType = {
  favorites: FavoriteTutor[];
  isFavorite: (tutorId: string) => boolean;
  addFavorite: (tutorId: string, studentId: string) => void;
  removeFavorite: (tutorId: string) => void;
  toggleFavorite: (tutorId: string, studentId: string) => void;
  isLoading: boolean;
  error: string | null;
  refreshFavorites: () => Promise<void>;
};

// ストレージキー
const FAVORITES_STORAGE_KEY = '@senpai:favorites';

// 旧モックお気に入り（初回のみのシードに使用）
const seedFavorites: FavoriteTutor[] = [
  {
    id: 'fav_seed_1',
    tutorId: '1',
    studentId: 'student-1',
    addedAt: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 'fav_seed_3',
    tutorId: '3',
    studentId: 'student-1',
    addedAt: new Date('2024-01-14T15:30:00'),
  },
];

// コンテキスト作成
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// 永続化ユーティリティ
function serializeFavorites(items: FavoriteTutor[]) {
  return JSON.stringify(items.map((f) => ({ ...f, addedAt: f.addedAt.toISOString() })));
}

function deserializeFavorites(json: string | null): FavoriteTutor[] {
  if (!json) return [];
  try {
    const raw = JSON.parse(json) as {
      id: string;
      tutorId: string;
      studentId: string;
      addedAt: string;
    }[];
    return raw.map((r) => ({ ...r, addedAt: new Date(r.addedAt) }));
  } catch {
    return [];
  }
}

async function loadFavoritesFromStorage(): Promise<FavoriteTutor[]> {
  const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
  return deserializeFavorites(stored);
}

async function saveFavoritesToStorage(items: FavoriteTutor[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites(items));
  } catch {
    // noop（失敗してもメモリ上では維持）
  }
}

// プロバイダーコンポーネント
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteTutor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初期読み込み（ストレージ→空ならシード）
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loaded = await loadFavoritesFromStorage();
        if (mounted) {
          if (loaded.length > 0) {
            setFavorites(loaded);
          } else {
            setFavorites(seedFavorites);
            await saveFavoritesToStorage(seedFavorites);
          }
        }
      } catch {
        if (mounted) setFavorites(seedFavorites);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // お気に入りかどうかをチェック
  const isFavorite = React.useCallback(
    (tutorId: string) => favorites.some((fav) => fav.tutorId === tutorId),
    [favorites],
  );

  // 永続化付き更新
  const updateAndPersist = React.useCallback(
    (updater: (prev: FavoriteTutor[]) => FavoriteTutor[]) => {
      setFavorites((prev) => {
        const next = updater(prev);
        // 永続化（ベストエフォート）
        saveFavoritesToStorage(next);
        return next;
      });
    },
    [],
  );

  // お気に入りに追加
  const addFavorite = React.useCallback(
    (tutorId: string, studentId: string) => {
      if (isFavorite(tutorId)) return; // 既に追加済みはスキップ
      const newFavorite: FavoriteTutor = {
        id: String(uuid.v4()),
        tutorId,
        studentId,
        addedAt: new Date(),
      };
      updateAndPersist((prev) => [...prev, newFavorite]);
    },
    [isFavorite, updateAndPersist],
  );

  // お気に入りから削除
  const removeFavorite = React.useCallback(
    (tutorId: string) => {
      updateAndPersist((prev) => prev.filter((fav) => fav.tutorId !== tutorId));
    },
    [updateAndPersist],
  );

  // お気に入りをトグル
  const toggleFavorite = React.useCallback(
    (tutorId: string, studentId: string) => {
      if (isFavorite(tutorId)) {
        removeFavorite(tutorId);
      } else {
        addFavorite(tutorId, studentId);
      }
    },
    [isFavorite, removeFavorite, addFavorite],
  );

  // お気に入りリストを再読み込み
  const refreshFavorites = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await loadFavoritesFromStorage();
      setFavorites(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = React.useMemo(
    () => ({
      isFavorite,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      favorites,
      isLoading,
      error,
      refreshFavorites,
    }),
    [
      isFavorite,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      favorites,
      isLoading,
      error,
      refreshFavorites,
    ],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

// カスタムフック
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
