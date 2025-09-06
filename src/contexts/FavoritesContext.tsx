import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
};

// モックお気に入りデータ
const initialFavorites: FavoriteTutor[] = [
  {
    id: 'fav_1',
    tutorId: '1',
    studentId: 'student-1',
    addedAt: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 'fav_3',
    tutorId: '3',
    studentId: 'student-1',
    addedAt: new Date('2024-01-14T15:30:00'),
  },
];

// コンテキスト作成
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// プロバイダーコンポーネント
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteTutor[]>(initialFavorites);

  // お気に入りかどうかをチェック
  const isFavorite = (tutorId: string) => {
    return favorites.some((fav) => fav.tutorId === tutorId);
  };

  // お気に入りに追加
  const addFavorite = (tutorId: string, studentId: string) => {
    if (isFavorite(tutorId)) return; // 既に追加済みの場合はスキップ

    const newFavorite: FavoriteTutor = {
      id: `fav_${Date.now()}`,
      tutorId,
      studentId,
      addedAt: new Date(),
    };

    setFavorites((prev) => [...prev, newFavorite]);
  };

  // お気に入りから削除
  const removeFavorite = (tutorId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.tutorId !== tutorId));
  };

  // お気に入りをトグル
  const toggleFavorite = (tutorId: string, studentId: string) => {
    if (isFavorite(tutorId)) {
      removeFavorite(tutorId);
    } else {
      addFavorite(tutorId, studentId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

// カスタムフック
export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }

  return context;
}
