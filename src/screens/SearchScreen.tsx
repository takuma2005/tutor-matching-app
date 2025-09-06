import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TutorCard from '../components/tutor/TutorCard';
import TutorCardSkeleton from '../components/tutor/TutorCardSkeleton';
import { SearchStackParamList } from '../navigation/SearchStackNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { getApiClient } from '@/services/api/mock';
import type { Tutor } from '@/services/api/types';

type FilterOptions = {
  subject: string;
  minRate: number;
  maxRate: number;
  onlineOnly: boolean;
};

type SearchScreenNavigationProp = StackNavigationProp<SearchStackParamList, 'SearchMain'>;

type Props = {
  navigation: SearchScreenNavigationProp;
};

export default function SearchScreen({ navigation }: Props) {
  const [allTutors, setAllTutors] = useState<Tutor[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'subject' | 'rate' | 'other'>('subject');
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    subject: '',
    minRate: 0,
    maxRate: 5000,
    onlineOnly: false,
  });

  const subjects = ['数学', '英語', '物理', '化学', '生物', '国語', '現代文'];

  useEffect(() => {
    const api = getApiClient();
    setIsLoading(true);
    api.student
      .searchTutors(undefined, 1, 100)
      .then((resp) => {
        const data = resp?.success ? resp.data : [];
        setAllTutors(data);
        setTutors(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // フィルタリング処理
  useEffect(() => {
    let filtered = allTutors;

    // テキスト検索
    if (searchText) {
      filtered = filtered.filter(
        (tutor) =>
          tutor.name.includes(searchText) ||
          tutor.school?.includes(searchText) ||
          false ||
          tutor.subjects_taught.some((subject) => subject.includes(searchText)),
      );
    }

    // 科目フィルタ
    if (filters.subject) {
      filtered = filtered.filter((tutor) => tutor.subjects_taught.includes(filters.subject));
    }

    // 料金フィルタ
    filtered = filtered.filter(
      (tutor) => tutor.hourly_rate >= filters.minRate && tutor.hourly_rate <= filters.maxRate,
    );

    // オンライン可能フィルタ
    if (filters.onlineOnly) {
      filtered = filtered.filter((tutor) => tutor.online_available);
    }

    setTutors(filtered);
  }, [searchText, filters, allTutors]);

  const handleTutorPress = (tutorId: string) => {
    navigation.navigate('TutorDetail', { tutorId });
  };

  const renderTutor = ({ item }: { item: Tutor }) => (
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
    />
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
          onPress={() => setShowFilters(!showFilters)}
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
            {(['subject', 'rate', 'other'] as const).map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.tabItem, activeFilterTab === key && styles.tabItemActive]}
                onPress={() => setActiveFilterTab(key)}
              >
                <Text style={[styles.tabLabel, activeFilterTab === key && styles.tabLabelActive]}>
                  {
                    { subject: '科目', rate: '料金', other: 'その他' }[
                      key as 'subject' | 'rate' | 'other'
                    ]
                  }
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
                  onPress={() => setFilters({ ...filters, subject: '' })}
                >
                  <Text
                    style={[styles.subjectTagText, !filters.subject && styles.subjectTagTextActive]}
                  >
                    全て
                  </Text>
                </TouchableOpacity>
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.subjectTag,
                      filters.subject === subject && styles.subjectTagActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        subject: filters.subject === subject ? '' : subject,
                      })
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
            <>
              <Text style={styles.filterTitle}>料金</Text>
              <View style={styles.subjectTags}>
                {[
                  { label: '〜1200', range: [0, 1200] },
                  { label: '1200〜1800', range: [1200, 1800] },
                  { label: '1800〜2400', range: [1800, 2400] },
                  { label: '2400〜', range: [2400, 999999] },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.label}
                    style={[
                      styles.subjectTag,
                      filters.minRate === r.range[0] &&
                        filters.maxRate === r.range[1] &&
                        styles.subjectTagActive,
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, minRate: r.range[0], maxRate: r.range[1] })
                    }
                  >
                    <Text
                      style={[
                        styles.subjectTagText,
                        filters.minRate === r.range[0] &&
                          filters.maxRate === r.range[1] &&
                          styles.subjectTagTextActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {activeFilterTab === 'other' && (
            <>
              <Text style={styles.filterTitle}>その他</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggle, filters.onlineOnly && styles.toggleActive]}
                  onPress={() => setFilters({ ...filters, onlineOnly: !filters.onlineOnly })}
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
        </View>
      )}

      {/* 結果ヘッダー */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>{tutors.length}人の先輩が見つかりました</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>探す</Text>
        <Text style={styles.subtitle}>理想の先輩を見つけよう</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: typography.sizes?.h2 || 24,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
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
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  resultCount: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
  },
});
