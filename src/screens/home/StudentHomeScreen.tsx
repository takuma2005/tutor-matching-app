import { useFocusEffect, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useFavorites } from '../../contexts/FavoritesContext';
import { useUser } from '../../contexts/UserContext';
import { HomeStackParamList } from '../../navigation/HomeStackNavigator';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';

import BlurHeader from '@/components/home/BlurHeader';
import TutorsSection from '@/components/home/TutorsSection';
import UpcomingLessonCard from '@/components/home/UpcomingLessonCard';
import WelcomeCard from '@/components/home/WelcomeCard';
import { useHomeData } from '@/hooks/useHomeData';

type StudentHomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeMain'>;

type Props = {
  navigation: StudentHomeScreenNavigationProp;
};

export default function StudentHomeScreen({ navigation }: Props) {
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

          {/* 授業の予定（後輩向け） */}
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

          {/* 後輩向けの学習進捗カード */}
          <View style={[styles.section, styles.progressSection]}>
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>今月の学習状況</Text>
              <View style={styles.progressStats}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressNumber}>4</Text>
                  <Text style={styles.progressLabel}>レッスン受講</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressNumber}>12</Text>
                  <Text style={styles.progressLabel}>学習時間</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressNumber}>3</Text>
                  <Text style={styles.progressLabel}>科目</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tutors Section: おすすめの先輩 */}
          <TutorsSection
            title="あなたにおすすめの先輩"
            tutors={recommendedTutors}
            isFavorite={isFavorite}
            onPressTutor={handleTutorPress}
            onToggleFavorite={(id) => {
              if (user) toggleFavorite(id, user.id);
            }}
          />

          {/* Tutors Section: 新着の先輩 */}
          <TutorsSection
            title="新しく登録した先輩"
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
  scrollView: {
    flex: 1,
    backgroundColor: '#F6FAFF',
  },
  scrollContentContainer: {
    paddingTop: 140, // SafeArea + ヘッダー分のスペース
    paddingBottom: 100, // タブバー分のスペース
  },
  contentContainer: {
    backgroundColor: '#F6FAFF',
    flex: 1,
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
  sectionHeaderTight: {
    marginBottom: spacing.sm + spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '700',
    color: colors.gray900,
  },
  scheduleSection: {
    paddingVertical: spacing.sm,
  },
  progressSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressTitle: {
    fontSize: typography.sizes?.h4 || 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: typography.sizes?.h2 || 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs / 2,
  },
  progressLabel: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
