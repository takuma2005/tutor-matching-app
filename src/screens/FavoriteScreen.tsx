import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TutorCard from '../components/tutor/TutorCard';
import TutorCardSkeleton from '../components/tutor/TutorCardSkeleton';
import { useFavorites } from '../contexts/FavoritesContext';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { getApiClient } from '@/services/api/mock';
import type { Tutor, Student } from '@/services/api/types';

type FavoriteStackParamList = {
  FavoriteMain: undefined;
  TutorDetail: {
    tutorId: string;
  };
};

type FavoriteScreenNavigationProp = StackNavigationProp<FavoriteStackParamList, 'FavoriteMain'>;

type Props = {
  navigation: FavoriteScreenNavigationProp;
};

export default function FavoriteScreen({ navigation }: Props) {
  const { favorites, removeFavorite } = useFavorites();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [favoriteTutors, setFavoriteTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  useEffect(() => {
    const api = getApiClient();
    setIsLoading(true);

    Promise.all([api.student.getProfile('student-1'), api.student.searchTutors(undefined, 1, 100)])
      .then(([profileResp, tutorsResp]) => {
        if (profileResp?.success) {
          setCurrentStudent(profileResp.data);
        }
        if (tutorsResp?.success) {
          const allTutors = tutorsResp.data;
          setTutors(allTutors);

          // お気に入りのセンパイのみを抽出
          const favTutors = favorites
            .map((fav) => allTutors.find((tutor) => tutor.id === fav.tutorId))
            .filter((tutor): tutor is Tutor => tutor !== undefined)
            .sort((a, b) => {
              // お気に入りに追加された日時でソート（新しい順）
              const favA = favorites.find((f) => f.tutorId === a.id);
              const favB = favorites.find((f) => f.tutorId === b.id);
              return (favB?.addedAt.getTime() || 0) - (favA?.addedAt.getTime() || 0);
            });

          setFavoriteTutors(favTutors);
        }
      })
      .finally(() => setIsLoading(false));
  }, [favorites]);

  const handleTutorPress = (tutorId: string) => {
    navigation.navigate('TutorDetail', { tutorId });
  };

  const handleRemoveFavorite = (tutorId: string) => {
    removeFavorite(tutorId);
  };

  const renderTutor = ({ item }: { item: Tutor }) => (
    <View style={styles.tutorCardContainer}>
      <TutorCard
        id={item.id}
        name={item.name}
        school={item.school ?? ''}
        grade={item.grade ?? ''}
        subjects={item.subjects_taught}
        hourlyRate={item.hourly_rate}
        rating={item.rating}
        totalLessons={item.total_lessons}
        onlineAvailable={item.online_available ?? false}
        avatarUrl={item.avatar_url}
        onPress={() => handleTutorPress(item.id)}
        onDetailPress={() => handleTutorPress(item.id)}
      />
      {/* お気に入りから削除ボタン */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons name="favorite" size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="favorite-border" size={80} color={colors.gray300} />
      <Text style={styles.emptyTitle}>お気に入りの先輩がいません</Text>
      <Text style={styles.emptySubtitle}>
        気になる先輩を見つけたら、お気に入りに追加してみましょう
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => {
          // タブバーの探すタブに切り替える（実装は後で）
          console.log('Navigate to search tab');
        }}
      >
        <MaterialIcons name="search" size={20} color={colors.white} />
        <Text style={styles.browseButtonText}>先輩を探す</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>お気に入り</Text>
          {favoriteTutors.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{favoriteTutors.length}</Text>
            </View>
          )}
        </View>

        {favoriteTutors.length > 0 && (
          <TouchableOpacity style={styles.sortButton}>
            <MaterialIcons name="sort" size={20} color={colors.gray600} />
            <Text style={styles.sortText}>並び替え</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* コンテンツ */}
      {isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          renderItem={() => <TutorCardSkeleton />}
          keyExtractor={(i) => `skeleton-${i}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={favoriteTutors}
          renderItem={renderTutor}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes?.h2 || 24,
    fontWeight: '700',
    color: colors.gray900,
    marginRight: spacing.sm,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full || 999,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  countText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '700',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sortText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginLeft: spacing.xs / 2,
  },
  listContent: {
    paddingVertical: spacing.sm,
    flexGrow: 1,
  },
  tutorCardContainer: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.lg + spacing.sm,
    zIndex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full || 999,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '600',
    color: colors.gray600,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  browseButtonText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
