import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TutorCard from '../components/tutor/TutorCard';
import { useFavorites } from '../contexts/FavoritesContext';
import { useUser } from '../contexts/UserContext';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { getApiClient } from '@/services/api/mock';
import type { Tutor, Lesson } from '@/services/api/types';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeMain'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user, refreshCoins } = useUser();
  const [recommendedTutors, setRecommendedTutors] = useState<Tutor[]>([]);
  const [upcoming, setUpcoming] = useState<{ lesson: Lesson; tutor?: Tutor } | null>(null);

  useEffect(() => {
    const api = getApiClient();
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
  }, []);

  // 画面フォーカス時にコイン残高をリフレッシュ
  useFocusEffect(
    useCallback(() => {
      refreshCoins();
      return undefined;
    }, [refreshCoins]),
  );

  const handleTutorPress = (tutorId: string) => {
    navigation.navigate('TutorDetail', { tutorId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader} testID="home-header">
        <Text style={styles.appName}>センパイ</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerCoinButton}
            onPress={() => navigation.navigate('CoinManagement')}
            testID="header-coin-button"
          >
            <MaterialIcons name="account-balance-wallet" size={18} color={colors.warning} />
            <Text style={styles.headerCoinText}>{(user?.coins ?? 0).toLocaleString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationButton}
            testID="notification-icon"
            onPress={() => navigation.navigate('Notification')}
          >
            <MaterialIcons name="notifications" size={20} color={colors.gray700} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#8B7ED8', '#B794F6', '#E879F9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>おはよう、{user?.name || 'ゲスト'}さん！👋</Text>
            <Text style={styles.subtitle}>今日も新しい学びの出会いを見つけよう</Text>
          </View>
        </LinearGradient>

        {/* Rounded transition with overlaid cards */}
        <View style={styles.contentContainer}>
          {/* 授業の予定 */}
          <View style={[styles.section, styles.sectionGap]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>授業の予定</Text>
            </View>
            {upcoming ? (
              <View style={styles.lessonCard} testID="upcoming-lesson-card">
                <View style={styles.lessonHeader}>
                  <MaterialIcons name="event" size={18} color={colors.primary} />
                  <Text style={styles.lessonTitle}>{upcoming.lesson.subject || 'レッスン'}</Text>
                </View>
                <View style={styles.lessonRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lessonMeta}>
                      {new Date(upcoming.lesson.scheduled_at).toLocaleString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.lessonTutor}>
                      先生:{' '}
                      {upcoming.tutor ? upcoming.tutor.name : `ID: ${upcoming.lesson.tutor_id}`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.lessonDetailButton}
                    onPress={() => (navigation as any).navigate('Lesson')}
                  >
                    <Text style={styles.lessonDetailButtonText}>詳細を見る</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyLessonText}>次の授業はまだありません</Text>
            )}
          </View>

          {/* Quick Action Card - overlaid */}
          <View style={styles.quickActionCard}>
            <View style={styles.quickActions} testID="quick-actions">
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => console.log('Search function not implemented in Home stack')}
              >
                <View style={styles.quickActionIcon}>
                  <MaterialIcons name="search" size={24} color={colors.primary} />
                </View>
                <Text style={styles.quickActionText}>探す</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={styles.quickActionIcon}>
                  <MaterialIcons name="school" size={24} color={colors.primary} />
                </View>
                <Text style={styles.quickActionText}>予約</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('Favorite')}
              >
                <View style={styles.quickActionIcon}>
                  <MaterialIcons name="favorite" size={24} color={colors.primary} />
                </View>
                <Text style={styles.quickActionText}>お気に入り</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={styles.quickActionIcon}>
                  <MaterialIcons name="assessment" size={24} color={colors.primary} />
                </View>
                <Text style={styles.quickActionText}>成果</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tutors Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>おすすめの先輩</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>すべて見る</Text>
                <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {recommendedTutors.map((tutor) => (
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
                  onPress={() => handleTutorPress(tutor.id)}
                  onDetailPress={() => handleTutorPress(tutor.id)}
                  onFavoritePress={() => {
                    if (user) {
                      toggleFavorite(tutor.id, user.id);
                    }
                  }}
                />
              </View>
            ))}
          </View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  fixedHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    zIndex: 1000,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  appName: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '700',
    color: colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerCoinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.md,
    height: 32,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  headerCoinText: {
    marginLeft: spacing.xs / 2,
    color: colors.gray800,
    fontWeight: '700',
    fontSize: typography.sizes?.caption || 12,
  },
  notificationButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  welcomeText: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes?.body || 16,
    color: 'rgba(255,255,255,0.9)',
  },
  contentContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -spacing.xl,
    paddingTop: spacing.xl,
    flex: 1,
  },
  overlaidCardSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  coinCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coinIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.warning + '20',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  coinInfo: {
    flex: 1,
  },
  coinLabel: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginBottom: 2,
  },
  coinAmount: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '700',
    color: colors.gray900,
  },
  addCoinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full || 999,
  },
  addCoinText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.white,
    fontWeight: '600',
  },
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
  sectionGap: {
    marginBottom: spacing.md,
  },

  quickActionCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray700,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
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
  tutorCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tutorCardContent: {
    flexDirection: 'row',
    padding: spacing.lg,
  },
  tutorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    position: 'relative',
  },
  tutorAvatarText: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '700',
    color: colors.white,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  tutorInfo: {
    flex: 1,
  },
  tutorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tutorName: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginLeft: 2,
  },
  tutorSchool: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  tutorSubjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  subjectChip: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full || 999,
  },
  subjectChipText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  tutorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tutorRate: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.primary,
  },
  favoriteButtonHome: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
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
  bottomSpacing: {
    height: spacing.xl,
    backgroundColor: colors.white,
  },
});
