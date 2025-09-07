import { useEffect, useMemo, useState } from 'react';

import { getApiClient } from '@/services/api/mock';
import type { Tutor } from '@/services/api/types';

export type FilterOptions = {
  subject: string;
  minRate: number;
  maxRate: number;
  onlineOnly: boolean;
};

export type SortOption = 'recommended' | 'price_low' | 'price_high' | 'rating';

export type SortOptions = {
  sortBy: SortOption;
};

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
  });
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

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

  useEffect(() => {
    let filtered = allTutors;

    if (searchText) {
      filtered = filtered.filter(
        (tutor) =>
          tutor.name.includes(searchText) ||
          tutor.school?.includes(searchText) ||
          tutor.subjects_taught.some((s) => s.includes(searchText)),
      );
    }

    if (filters.subject) {
      filtered = filtered.filter((tutor) => tutor.subjects_taught.includes(filters.subject));
    }

    filtered = filtered.filter(
      (tutor) => tutor.hourly_rate >= filters.minRate && tutor.hourly_rate <= filters.maxRate,
    );

    if (filters.onlineOnly) {
      filtered = filtered.filter((tutor) => tutor.online_available);
    }

    // 並び替え処理
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.hourly_rate - b.hourly_rate;
        case 'price_high':
          return b.hourly_rate - a.hourly_rate;
        case 'rating':
          return b.rating - a.rating;
        case 'recommended':
        default: {
          // おすすめ順: 評価が高く、授業数が多い順
          const scoreA = a.rating * 0.7 + (a.total_lessons / 100) * 0.3;
          const scoreB = b.rating * 0.7 + (b.total_lessons / 100) * 0.3;
          return scoreB - scoreA;
        }
      }
    });

    setTutors(filtered);
  }, [searchText, filters, allTutors, sortBy]);

  return {
    allTutors,
    tutors,
    isLoading,
    searchText,
    setSearchText,
    filters,
    setFilters,
    sortBy,
    setSortBy,
  } as const;
}
