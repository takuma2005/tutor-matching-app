import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

import { colors, spacing, typography, borderRadius } from '../../styles/theme';

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
  isFavorite?: boolean;
  onPress: () => void;
  onFavoritePress?: () => void;
  onDetailPress?: () => void;
  avatarVariant?: 'circle' | 'portrait';
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
  isFavorite = false,
  onPress,
  onFavoritePress,
  onDetailPress,
  avatarVariant = 'circle',
}: TutorCardProps) {
  const [imageOk, setImageOk] = React.useState(true);
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* 左側：アバター */}
        <View
          style={[
            styles.avatarContainer,
            avatarVariant === 'portrait' && styles.avatarContainerPortrait,
          ]}
        >
          {avatarUrl && imageOk ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[styles.avatar, avatarVariant === 'portrait' && styles.avatarPortrait]}
              resizeMode="cover"
              onError={() => setImageOk(false)}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                avatarVariant === 'portrait' && styles.avatarPortrait,
                styles.avatarPlaceholder,
              ]}
            >
              <MaterialIcons name="person" size={32} color={colors.gray400} />
            </View>
          )}
        </View>

        {/* 右側：情報 */}
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={14} color={colors.warning} style={styles.starIcon} />
              <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
              <Text style={styles.ratingText}>({totalLessons})</Text>
            </View>
          </View>

          <View style={styles.schoolInfo}>
            <Text style={styles.school}>{school}</Text>
            <Text style={styles.grade}>・{grade}</Text>
          </View>

          <View style={styles.subjects}>
            {subjects.slice(0, 3).map((subject, index) => (
              <View key={index} style={styles.subjectChip}>
                <Text style={styles.subjectChipText}>{subject}</Text>
              </View>
            ))}
            {subjects.length > 3 && <Text style={styles.moreSubjects}>+{subjects.length - 3}</Text>}
            {onlineAvailable && (
              <View style={[styles.onlineTag, { marginLeft: spacing.xs }]}>
                <Text style={styles.onlineTagText}>オンライン授業可</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{hourlyRate.toLocaleString()}コイン/時</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ボタンエリア */}
      <View style={styles.buttonsContainer}>
        {/* お気に入りボタン */}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={20}
              color={isFavorite ? colors.error : colors.gray500}
            />
          </TouchableOpacity>
        )}

        {/* 詳細ボタン */}
        {onDetailPress && (
          <TouchableOpacity
            style={styles.detailButton}
            onPress={onDetailPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.detailButtonText}>詳細</Text>
          </TouchableOpacity>
        )}
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
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
    width: 60,
    height: 60,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPortrait: {
    width: 72,
    height: 96,
    borderRadius: borderRadius.md,
  },
  avatarContainerPortrait: {
    width: 72,
  },
  avatarPlaceholder: {
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full || 999,
    marginBottom: spacing.xs,
  },
  onlineTagText: {
    fontSize: typography.fontSizes.xs,
    color: colors.secondary,
    fontWeight: typography.fontWeights.semibold,
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
  starIcon: {
    marginRight: 1,
  },
  ratingValue: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray600,
    marginLeft: 4,
    marginRight: 2,
  },
  ratingText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray600,
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
  subjectTag: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  subjectChip: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full || 999,
    marginRight: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  subjectChipText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  moreSubjects: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray500,
    marginLeft: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
  buttonsContainer: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    marginRight: spacing.sm,
  },
  detailButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});
