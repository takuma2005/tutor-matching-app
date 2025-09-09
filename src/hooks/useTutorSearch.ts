import { useEffect, useMemo, useState, useCallback } from 'react';

import { getApiClient } from '@/services/api/mock';
import type { Tutor } from '@/services/api/types';

export type FilterOptions = {
  subject: string;
  minRate: number;
  maxRate: number;
  onlineOnly: boolean;
  minRating?: number;
  experienceYears?: number;
  location?: string;
};

export type SortOption =
  | 'recommended'
  | 'price_low'
  | 'price_high'
  | 'rating'
  | 'experience'
  | 'recent';

export interface SearchStats {
  totalCount: number;
  filteredCount: number;
  averageRate: number;
  averageRating: number;
}

export function useTutorSearch(initial?: Partial<FilterOptions>) {
  const api = useMemo(() => getApiClient(), []);
  const [allTutors, setAllTutors] = useState<Tutor[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    subject: initial?.subject ?? '',
    minRate: initial?.minRate ?? 0,
    maxRate: initial?.maxRate ?? 5000,
    onlineOnly: initial?.onlineOnly ?? false,
    minRating: initial?.minRating,
    experienceYears: initial?.experienceYears,
    location: initial?.location,
  });
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [searchStats, setSearchStats] = useState<SearchStats>({
    totalCount: 0,
    filteredCount: 0,
    averageRate: 0,
    averageRating: 0,
  });

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    api.student
      .searchTutors(undefined, 1, 100)
      .then((resp) => {
        if (!active) return;
        const data = resp?.success ? resp.data : [];
        setAllTutors(data);
        setTutors(data);
      })
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [api]);

  // フィルタリング・ソート処理のメモ化
  const filteredAndSortedTutors = useMemo(() => {
    let filtered = allTutors;

    // テキスト検索
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (tutor) =>
          tutor.name.toLowerCase().includes(searchLower) ||
          tutor.school?.toLowerCase().includes(searchLower) ||
          tutor.subjects_taught.some((s) => s.toLowerCase().includes(searchLower)) ||
          tutor.bio?.toLowerCase().includes(searchLower),
      );
    }

    // 科目フィルタ
    if (filters.subject) {
      filtered = filtered.filter((tutor) => tutor.subjects_taught.includes(filters.subject));
    }

    // 料金範囲フィルタ
    filtered = filtered.filter(
      (tutor) => tutor.hourly_rate >= filters.minRate && tutor.hourly_rate <= filters.maxRate,
    );

    // オンライン可能フィルタ
    if (filters.onlineOnly) {
      filtered = filtered.filter((tutor) => tutor.online_available);
    }

    // 評価フィルタ
    if (filters.minRating !== undefined) {
      filtered = filtered.filter((tutor) => tutor.rating >= filters.minRating!);
    }

    // 経験年数フィルタ
    if (filters.experienceYears !== undefined) {
      filtered = filtered.filter((tutor) => tutor.experience_years >= filters.experienceYears!);
    }

    // 地域フィルタ
    if (filters.location) {
      filtered = filtered.filter((tutor) => tutor.location?.includes(filters.location!));
    }

    // 並び替え処理
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.hourly_rate - b.hourly_rate;
        case 'price_high':
          return b.hourly_rate - a.hourly_rate;
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience_years - a.experience_years;
        case 'recent':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'recommended':
        default: {
          // おすすめ順: 評価、経験、授業数を総合的に評価
          const scoreA = a.rating * 0.5 + a.experience_years * 0.2 + (a.total_lessons / 100) * 0.3;
          const scoreB = b.rating * 0.5 + b.experience_years * 0.2 + (b.total_lessons / 100) * 0.3;
          return scoreB - scoreA;
        }
      }
    });

    return sorted;
  }, [allTutors, searchText, filters, sortBy]);

  // 統計情報の計算
  const stats = useMemo(() => {
    const totalCount = allTutors.length;
    const filteredCount = filteredAndSortedTutors.length;

    if (filteredAndSortedTutors.length === 0) {
      return {
        totalCount,
        filteredCount,
        averageRate: 0,
        averageRating: 0,
      };
    }

    const totalRate = filteredAndSortedTutors.reduce((sum, tutor) => sum + tutor.hourly_rate, 0);
    const totalRating = filteredAndSortedTutors.reduce((sum, tutor) => sum + tutor.rating, 0);

    return {
      totalCount,
      filteredCount,
      averageRate: Math.round(totalRate / filteredCount),
      averageRating: Number((totalRating / filteredCount).toFixed(1)),
    };
  }, [allTutors.length, filteredAndSortedTutors]);

  // tutors state を更新
  useEffect(() => {
    setTutors(filteredAndSortedTutors);
    setSearchStats(stats);
  }, [filteredAndSortedTutors, stats]);

  // フィルタリセット関数
  const resetFilters = useCallback(() => {
    setFilters({
      subject: '',
      minRate: 0,
      maxRate: 5000,
      onlineOnly: false,
      minRating: undefined,
      experienceYears: undefined,
      location: undefined,
    });
    setSearchText('');
    setSortBy('recommended');
  }, []);

  const updateFilter = useCallback((key: keyof FilterOptions, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    // データ
    allTutors,
    tutors,
    isLoading,
    stats: searchStats,

    // 検索・フィルタ状態
    searchText,
    setSearchText,
    filters,
    setFilters,
    updateFilter,
    resetFilters,

    // ソート
    sortBy,
    setSortBy,
  } as const;
}
