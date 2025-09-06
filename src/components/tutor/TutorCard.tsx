import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';
import Badge from '../common/Badge';
import Rating from '../common/Rating';
import Tag from '../common/Tag';

type TutorCardProps = {
  id: string;
  name: string;
  school: string;
  grade: string;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  totalLessons: number;
  onlineAvailable: boolean;
  avatarUrl?: string;
  onPress: () => void;
};

export default function TutorCard({
  name,
  school,
  grade,
  subjects,
  hourlyRate,
  rating,
  totalLessons,
  onlineAvailable,
  avatarUrl,
  onPress,
}: TutorCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* 左側：アバター */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialIcons name="person" size={32} color={colors.gray400} />
            </View>
          )}
          {onlineAvailable && (
            <View style={styles.onlineBadge}>
              <Badge color="success" size="sm">
                オンライン
              </Badge>
            </View>
          )}
        </View>

        {/* 右側：情報 */}
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Rating value={rating} size={14} />
          </View>

          <View style={styles.schoolInfo}>
            <Text style={styles.school}>{school}</Text>
            <Text style={styles.grade}>・{grade}</Text>
          </View>

          <View style={styles.subjects}>
            {subjects.slice(0, 3).map((subject, index) => (
              <Tag key={index}>{subject}</Tag>
            ))}
            {subjects.length > 3 && <Text style={styles.moreSubjects}>+{subjects.length - 3}</Text>}
          </View>

          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{hourlyRate.toLocaleString()}コイン/時</Text>
            </View>
            <Text style={styles.lessonCount}>{totalLessons}回授業</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.md,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
  },
  infoContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray900,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  school: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  grade: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray500,
  },
  subjects: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  moreSubjects: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray500,
    marginLeft: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
  },
  lessonCount: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray500,
  },
});
