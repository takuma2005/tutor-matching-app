import { useFocusEffect, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useFavorites } from '../contexts/FavoritesContext';
import { useUser } from '../contexts/UserContext';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import BlurHeader from '@/components/home/BlurHeader';
import TutorsSection from '@/components/home/TutorsSection';
import UpcomingLessonCard from '@/components/home/UpcomingLessonCard';
import WelcomeCard from '@/components/home/WelcomeCard';
import { useHomeData } from '@/hooks/useHomeData';
type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeMain'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user, refreshCoins } = useUser();
  const { recommendedTutors, newTutors, upcoming } = useHomeData();
  const [scrollY, setScrollY] = React.useState(0);

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
    <View style={styles.root}>
      {/* Background ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          setScrollY(y);
        }}
        scrollEventThrottle={16}
      >
        {/* Content with top padding for header */}
        <View style={styles.contentContainer}>
          <WelcomeCard name={user?.name || 'ゲスト'} />
          {/* 授業の予定（余白をやや詰める） */}
          <View style={[styles.section, styles.scheduleSection]}>
            <View style={[styles.sectionHeader, styles.sectionHeaderTight]}>
              <Text style={styles.sectionTitle}>授業の予定</Text>
            </View>
            <UpcomingLessonCard
              upcoming={upcoming}
              onPressDetail={() =>
                (navigation as unknown as NavigationProp<ParamListBase>).navigate('Lesson')
              }
            />
          </View>

          {/* Tutors Section: おすすめの先輩 */}
          <TutorsSection
            title="おすすめの先輩"
            tutors={recommendedTutors}
            isFavorite={isFavorite}
            onPressTutor={handleTutorPress}
            onToggleFavorite={(id) => {
              if (user) toggleFavorite(id, user.id);
            }}
          />

          {/* Tutors Section: 新着の先輩 */}
          <TutorsSection
            title="新着の先輩"
            tutors={newTutors}
            isFavorite={isFavorite}
            onPressTutor={handleTutorPress}
            onToggleFavorite={(id) => {
              if (user) toggleFavorite(id, user.id);
            }}
          />

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Blur Header */}
      <BlurHeader
        coins={user?.coins ?? 0}
        onPressCoinManagement={() => navigation.navigate('CoinManagement')}
        onPressNotification={() => navigation.navigate('Notification')}
        scrollY={scrollY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F6FAFF',
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
    backgroundColor: '#F6FAFF',
  },
  scrollContentContainer: {
    paddingTop: 140, // SafeArea + ヘッダー分のスペース（より大きく）
    paddingBottom: 100, // タブバー分のスペース
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
    backgroundColor: '#F6FAFF',
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
  scheduleSection: {
    paddingVertical: spacing.sm,
  },
  sectionHeaderTight: {
    marginBottom: spacing.sm + spacing.xs,
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
    backgroundColor: '#F6FAFF',
  },
});
