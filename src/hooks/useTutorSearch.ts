import { useEffect, useMemo, useState } from 'react';

import { getApiClient } from '@/services/api/mock';
import type { Tutor } from '@/services/api/types';

export type FilterOptions = {
  subject: string;
  minRate: number;
  maxRate: number;
  onlineOnly: boolean;
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

    setTutors(filtered);
  }, [searchText, filters, allTutors]);

  return {
    allTutors,
    tutors,
    isLoading,
    searchText,
    setSearchText,
    filters,
    setFilters,
  } as const;
}
