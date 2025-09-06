import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import type { Lesson, Tutor } from '@/services/api/types';
import { colors, spacing, typography, borderRadius } from '@/styles/theme';

type Props = {
  upcoming: { lesson: Lesson; tutor?: Tutor } | null;
  onPressDetail: () => void;
};

export default function UpcomingLessonCard({ upcoming, onPressDetail }: Props) {
  if (!upcoming) {
    return <Text style={styles.emptyLessonText}>次の授業はまだありません</Text>;
  }

  const dateText = new Date(upcoming.lesson.scheduled_at).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.lessonCard} testID="upcoming-lesson-card">
      <View style={styles.lessonHeader}>
        <MaterialIcons name="event" size={18} color={colors.primary} />
        <Text style={styles.lessonTitle}>{upcoming.lesson.subject || 'レッスン'}</Text>
      </View>
      <View style={styles.lessonRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.lessonMeta}>{dateText}</Text>
          <Text style={styles.lessonTutor}>
            先生: {upcoming.tutor ? upcoming.tutor.name : `ID: ${upcoming.lesson.tutor_id}`}
          </Text>
        </View>
        <TouchableOpacity style={styles.lessonDetailButton} onPress={onPressDetail}>
          <Text style={styles.lessonDetailButtonText}>詳細を見る</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lessonCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
    gap: spacing.xs,
  },
  lessonTitle: {
    fontSize: typography.sizes?.caption || 12,
    fontWeight: '700',
    color: colors.gray900,
    marginLeft: spacing.xs / 2,
  },
  lessonMeta: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginBottom: spacing.xs / 4,
  },
  lessonTutor: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray700,
    marginBottom: spacing.xs / 2,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lessonDetailButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    height: 28,
    minWidth: 96,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonDetailButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: typography.sizes?.caption || 12,
  },
  emptyLessonText: {
    marginHorizontal: spacing.lg,
    color: colors.gray600,
    fontSize: typography.sizes?.caption || 12,
  },
});
