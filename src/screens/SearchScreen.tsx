import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';

import TutorCard from '../components/tutor/TutorCard';
import TutorCardSkeleton from '../components/tutor/TutorCardSkeleton';
import { useFavorites } from '../contexts/FavoritesContext';
import { SearchStackParamList } from '../navigation/SearchStackNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { RangeSlider } from '@/components/common/RangeSlider';
import ScreenContainer from '@/components/common/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useTutorSearch, type SortOption } from '@/hooks/useTutorSearch';
import type { Tutor } from '@/services/api/types';

type SearchScreenNavigationProp = StackNavigationProp<SearchStackParamList, 'SearchMain'>;

type Props = {
  navigation: SearchScreenNavigationProp;
};

type FilterTab = 'subject' | 'rate' | 'other' | 'sort';

const SUBJECT_OPTIONS = ['数学', '英語', '物理', '化学', '生物', '国語', '現代文'] as const;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'subject', label: '科目' },
  { key: 'rate', label: '料金' },
  { key: 'other', label: 'その他' },
  { key: 'sort', label: '並び替え' },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'recommended', label: 'おすすめ順' },
  { key: 'price_low', label: '料金安い順' },
  { key: 'price_high', label: '料金高い順' },
  { key: 'rating', label: '評価順' },
  { key: 'experience', label: '経験順' },
  { key: 'recent', label: '新しい順' },
];

export default function SearchScreen({ navigation }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user: authUser } = useAuth();
  const {
    tutors,
    isLoading,
    searchText,
    setSearchText,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    stats,
    // updateFilter,
    // resetFilters
  } = useTutorSearch({
    subject: '',
    minRate: 0,
    maxRate: 5000,
    onlineOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('subject');

  // フィルタリング処理は useTutorSearch 内へ集約済み

  const handleTutorPress = useCallback(
    (tutorId: string) => {
      navigation.navigate('TutorDetail', { tutorId });
    },
    [navigation],
  );

  const authUserId = authUser?.id;

  const renderTutor = useCallback(
    ({ item }: { item: Tutor }) => (
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
        onPress={() => handleTutorPress(item.id)}
        onFavoritePress={() => {
          if (authUserId) {
            toggleFavorite(item.id, authUserId);
          }
        }}
        onDetailPress={() => handleTutorPress(item.id)}
      />
    ),
    [authUserId, handleTutorPress, isFavorite, toggleFavorite],
  );

  const renderHeader = () => (
    <View>
      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="先輩を検索..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={colors.gray400}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters((prev) => !prev)}
        >
          <MaterialIcons
            name="tune"
            size={20}
            color={showFilters ? colors.white : colors.gray600}
          />
        </TouchableOpacity>
      </View>

      {/* フィルタ */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Segmented tabs */}
          <View style={styles.tabsRow}>
            {FILTER_TABS.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.tabItem, activeFilterTab === key && styles.tabItemActive]}
                onPress={() => setActiveFilterTab(key)}
              >
                <Text style={[styles.tabLabel, activeFilterTab === key && styles.tabLabelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeFilterTab === 'subject' && (
            <>
              <Text style={styles.filterTitle}>科目</Text>
              <View style={styles.subjectTags}>
                <TouchableOpacity
                  style={[styles.subjectTag, !filters.subject && styles.subjectTagActive]}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      subject: '',
                    }))
                  }
                >
                  <Text
                    style={[styles.subjectTagText, !filters.subject && styles.subjectTagTextActive]}
                  >
                    全て
                  </Text>
                </TouchableOpacity>
                {SUBJECT_OPTIONS.map((subject) => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.subjectTag,
                      filters.subject === subject && styles.subjectTagActive,
                    ]}
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        subject: prev.subject === subject ? '' : subject,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.subjectTagText,
                        filters.subject === subject && styles.subjectTagTextActive,
                      ]}
                    >
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {activeFilterTab === 'rate' && (
            <RangeSlider
              minValue={filters.minRate}
              maxValue={filters.maxRate}
              onValueChange={(min, max) =>
                setFilters((prev) => ({ ...prev, minRate: min, maxRate: max }))
              }
            />
          )}

          {activeFilterTab === 'other' && (
            <>
              <Text style={styles.filterTitle}>その他</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggle, filters.onlineOnly && styles.toggleActive]}
                  onPress={() => setFilters((prev) => ({ ...prev, onlineOnly: !prev.onlineOnly }))}
                >
                  <MaterialIcons
                    name={filters.onlineOnly ? 'check-box' : 'check-box-outline-blank'}
                    size={20}
                    color={filters.onlineOnly ? colors.primary : colors.gray400}
                  />
                  <Text style={styles.toggleText}>オンライン可能のみ</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {activeFilterTab === 'sort' && (
            <>
              <Text style={styles.filterTitle}>並び替え</Text>
              <View style={styles.subjectTags}>
                {SORT_OPTIONS.map((sort) => (
                  <TouchableOpacity
                    key={sort.key}
                    style={[styles.subjectTag, sortBy === sort.key && styles.subjectTagActive]}
                    onPress={() => setSortBy(sort.key)}
                  >
                    <Text
                      style={[
                        styles.subjectTagText,
                        sortBy === sort.key && styles.subjectTagTextActive,
                      ]}
                    >
                      {sort.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* 結果ヘッダー */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>
          {stats.filteredCount}人の先輩が見つかりました（平均料金:{' '}
          {stats.averageRate.toLocaleString()} コイン / 平均評価: {stats.averageRating}）
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer
      withScroll={false}
      contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>探す</Text>
      </View>

      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <TutorCardSkeleton />}
          keyExtractor={(i) => `sk-${i}`}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={tutors}
          renderItem={renderTutor}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  header: {
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizes?.lg || 18,
    fontWeight: typography.fontWeights?.semibold || '600',
    color: colors.gray900,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md, // カードの左右マージン（spacing.md）と合わせる
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray300,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filtersContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full || 999,
    backgroundColor: colors.gray100,
  },
  tabItemActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    color: colors.gray700,
    fontSize: typography.sizes?.caption || 12,
  },
  tabLabelActive: {
    color: colors.white,
  },
  filterTitle: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  subjectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  subjectTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full || 999,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  subjectTagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subjectTagText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray700,
  },
  subjectTagTextActive: {
    color: colors.white,
  },
  toggleContainer: {
    gap: spacing.sm,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleActive: {},
  toggleText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray700,
  },
  resultHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  resultCount: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
  },
});
