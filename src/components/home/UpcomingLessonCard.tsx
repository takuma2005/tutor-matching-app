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
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="book" size={20} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{upcoming.lesson.subject || 'レッスン'}</Text>
          <Text style={styles.datetime}>{dateText}</Text>
          <Text style={styles.tutor}>
            先生: {upcoming.tutor ? upcoming.tutor.name : `ID: ${upcoming.lesson.tutor_id}`}
          </Text>
        </View>
        <TouchableOpacity style={styles.detailButton} onPress={onPressDetail}>
          <Text style={styles.detailButtonText}>詳細を見る</Text>
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
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes?.md || 16,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 2,
  },
  datetime: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginBottom: 2,
  },
  tutor: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
  },
  detailButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailButtonText: {
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
