import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import TutorCard from '@/components/tutor/TutorCard';
import type { Tutor } from '@/services/api/types';
import { colors, spacing, typography } from '@/styles/theme';

type Props = {
  title?: string;
  tutors: Tutor[];
  isFavorite: (tutorId: string) => boolean;
  onPressTutor: (tutorId: string) => void;
  onToggleFavorite: (tutorId: string) => void;
  onPressSeeAll?: () => void;
};

export default function TutorsSection({
  title = 'おすすめの先輩',
  tutors,
  isFavorite,
  onPressTutor,
  onToggleFavorite,
  onPressSeeAll,
}: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onPressSeeAll && (
          <TouchableOpacity style={styles.seeAllButton} onPress={onPressSeeAll}>
            <Text style={styles.seeAllText}>すべて見る</Text>
            <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {tutors.map((tutor) => (
        <View key={tutor.id} style={styles.tutorCardWrapper}>
          <TutorCard
            id={tutor.id}
            name={tutor.name}
            school={tutor.school ?? ''}
            grade={tutor.grade ?? ''}
            subjects={tutor.subjects_taught}
            hourlyRate={tutor.hourly_rate}
            rating={tutor.rating}
            totalLessons={tutor.total_lessons}
            onlineAvailable={tutor.online_available ?? false}
            avatarUrl={tutor.avatar_url}
            isFavorite={isFavorite(tutor.id)}
            onPress={() => onPressTutor(tutor.id)}
            onDetailPress={() => onPressTutor(tutor.id)}
            onFavoritePress={() => onToggleFavorite(tutor.id)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm + spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.primary,
    marginRight: spacing.xs / 2,
  },
  tutorCardWrapper: {
    position: 'relative',
    marginHorizontal: 0,
    marginBottom: 0,
  },
});
