import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

import TutorCard from '../components/tutor/TutorCard';
import TutorCardSkeleton from '../components/tutor/TutorCardSkeleton';
import { useFavorites } from '../contexts/FavoritesContext';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import Card from '@/components/common/Card';
import ScreenContainer from '@/components/common/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { getApiClient } from '@/services/api/mock';
import type { Tutor } from '@/services/api/types';

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
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { user: authUser, student } = useAuth();
  const [allTutors, setAllTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const api = getApiClient();

    const loadTutors = async () => {
      setIsLoading(true);
      try {
        const tutorsResp = await api.student.searchTutors(undefined, 1, 100);
        if (!isMounted) return;
        if (tutorsResp?.success) {
          setAllTutors(tutorsResp.data);
        } else {
          setAllTutors([]);
        }
      } catch {
        if (isMounted) {
          setAllTutors([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTutors();

    return () => {
      isMounted = false;
    };
  }, []);

  const favoriteTutors = useMemo(() => {
    if (favorites.length === 0 || allTutors.length === 0) {
      return [];
    }

    const tutorById = new Map(allTutors.map((tutor) => [tutor.id, tutor]));

    return [...favorites]
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      .map((favorite) => tutorById.get(favorite.tutorId))
      .filter((tutor): tutor is Tutor => Boolean(tutor));
  }, [allTutors, favorites]);

  const handleTutorPress = useCallback(
    (tutorId: string) => {
      navigation.navigate('TutorDetail', { tutorId });
    },
    [navigation],
  );

  const resolvedStudentId = student?.id ?? authUser?.id ?? 'local';

  const handleToggleFavorite = useCallback(
    (tutorId: string) => {
      if (isFavorite(tutorId)) {
        removeFavorite(tutorId);
      } else {
        addFavorite(tutorId, resolvedStudentId);
      }
    },
    [isFavorite, removeFavorite, addFavorite, resolvedStudentId],
  );

  const renderTutor = useCallback(
    ({ item }: { item: Tutor }) => (
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
          isFavorite={isFavorite(item.id)}
          onFavoritePress={() => handleToggleFavorite(item.id)}
          onPress={() => handleTutorPress(item.id)}
          onDetailPress={() => handleTutorPress(item.id)}
        />
      </View>
    ),
    [handleToggleFavorite, handleTutorPress, isFavorite],
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
          // TODO: タブバーの「探す」タブへ切り替える処理を実装する
        }}
      >
        <MaterialIcons name="search" size={20} color={colors.white} />
        <Text style={styles.browseButtonText}>先輩を探す</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer
      withScroll={false}
      contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
    >
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
          ListEmptyComponent={() => (
            <Card style={{ alignItems: 'center' }}>{renderEmptyState()}</Card>
          )}
        />
      )}
    </ScreenContainer>
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
    backgroundColor: colors.white,
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
