import { useEffect, useMemo, useState } from 'react';

import { getApiClient } from '@/services/api/mock';
import type { Tutor, Lesson } from '@/services/api/types';

export type Upcoming = { lesson: Lesson; tutor?: Tutor } | null;

export function useHomeData() {
  const api = useMemo(() => getApiClient(), []);
  const [recommendedTutors, setRecommendedTutors] = useState<Tutor[]>([]);
  const [newTutors, setNewTutors] = useState<Tutor[]>([]);
  const [upcoming, setUpcoming] = useState<Upcoming>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.student.searchTutors(undefined, 1, 50),
      api.student.getLessons({ status: 'scheduled' }, 1, 20),
    ])
      .then(([tutorsResp, lessonsResp]) => {
        if (!isMounted) return;
        const tutors = tutorsResp?.success ? tutorsResp.data : [];
        const recommended = [...tutors].sort((a, b) => b.rating - a.rating).slice(0, 3);
        setRecommendedTutors(recommended);

        const createdTime = (t: Tutor) => {
          const c = (t as any).created_at || (t as any).updated_at || 0;
          return new Date(c).getTime();
        };
        const newest = [...tutors].sort((a, b) => createdTime(b) - createdTime(a)).slice(0, 3);
        setNewTutors(newest);

        if (lessonsResp?.success) {
          const upcomingList = [...lessonsResp.data]
            .filter((l) => l.status === 'scheduled')
            .sort(
              (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
            );
          const now = Date.now();
          const upcomingLesson =
            upcomingList.find((l) => new Date(l.scheduled_at).getTime() >= now) ||
            upcomingList[0] ||
            null;
          if (upcomingLesson) {
            const tutor = tutors.find((t) => t.id === upcomingLesson.tutor_id);
            setUpcoming({ lesson: upcomingLesson, tutor });
          } else {
            setUpcoming(null);
          }
        }
      })
      .catch(() => {
        // noop
      });

    return () => {
      isMounted = false;
    };
  }, [api]);

  return { recommendedTutors, newTutors, upcoming } as const;
}
