import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { useUser } from '../../contexts/UserContext';
import { HomeStackParamList } from '../../navigation/HomeStackNavigator';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';

import BlurHeader from '@/components/home/BlurHeader';
import WelcomeCard from '@/components/home/WelcomeCard';

type TutorHomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeMain'>;

type Props = {
  navigation: TutorHomeScreenNavigationProp;
};

export default function TutorHomeScreen({ navigation }: Props) {
  const { user, refreshCoins } = useUser();
  const [scrollY, setScrollY] = React.useState(0);

  // 画面フォーカス時にコイン残高をリフレッシュ
  useFocusEffect(
    useCallback(() => {
      refreshCoins();
      return undefined;
    }, [refreshCoins]),
  );

  // モックデータ - 実際の実装では API から取得
  const mockStats = {
    totalStudents: 8,
    totalLessons: 24,
    monthlyEarnings: 18500,
    rating: 4.8,
    pendingRequests: 3,
    upcomingLessons: 2,
  };

  const mockUpcomingLessons = [
    {
      id: '1',
      studentName: '田中花子',
      subject: '数学',
      time: '今日 14:00',
      duration: '60分',
    },
    {
      id: '2',
      studentName: '山田太郎',
      subject: '英語',
      time: '明日 16:00',
      duration: '90分',
    },
  ];

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
          <WelcomeCard name={user?.name || '先輩'} />

          {/* 先輩向け統計カード */}
          <View style={[styles.section, styles.statsSection]}>
            <Text style={styles.sectionTitle}>今月の活動状況</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MaterialIcons name="people" size={24} color={colors.primary} />
                <Text style={styles.statNumber}>{mockStats.totalStudents}</Text>
                <Text style={styles.statLabel}>教えた生徒</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="school" size={24} color={colors.success} />
                <Text style={styles.statNumber}>{mockStats.totalLessons}</Text>
                <Text style={styles.statLabel}>レッスン数</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="monetization-on" size={24} color={colors.warning} />
                <Text style={styles.statNumber}>¥{mockStats.monthlyEarnings.toLocaleString()}</Text>
                <Text style={styles.statLabel}>収入</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="star" size={24} color={colors.warning} />
                <Text style={styles.statNumber}>{mockStats.rating}</Text>
                <Text style={styles.statLabel}>評価</Text>
              </View>
            </View>
          </View>

          {/* クイックアクション */}
          <View style={[styles.section, styles.actionsSection]}>
            <Text style={styles.sectionTitle}>クイックアクション</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.getParent()?.navigate('Requests')}
              >
                <View style={styles.actionIconContainer}>
                  <MaterialIcons name="assignment" size={32} color={colors.white} />
                  {mockStats.pendingRequests > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{mockStats.pendingRequests}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionTitle}>申請管理</Text>
                <Text style={styles.actionSubtitle}>{mockStats.pendingRequests}件の新しい申請</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.getParent()?.navigate('Lesson')}
              >
                <View style={styles.actionIconContainer}>
                  <MaterialIcons name="schedule" size={32} color={colors.white} />
                  {mockStats.upcomingLessons > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{mockStats.upcomingLessons}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionTitle}>レッスン管理</Text>
                <Text style={styles.actionSubtitle}>
                  {mockStats.upcomingLessons}件の予定レッスン
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 今日の予定 */}
          <View style={[styles.section, styles.scheduleSection]}>
            <Text style={styles.sectionTitle}>今後のレッスン予定</Text>
            {mockUpcomingLessons.length > 0 ? (
              <View style={styles.lessonsList}>
                {mockUpcomingLessons.map((lesson) => (
                  <View key={lesson.id} style={styles.lessonCard}>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonStudent}>{lesson.studentName}</Text>
                      <Text style={styles.lessonSubject}>{lesson.subject}</Text>
                      <View style={styles.lessonMeta}>
                        <MaterialIcons name="access-time" size={16} color={colors.gray500} />
                        <Text style={styles.lessonTime}>{lesson.time}</Text>
                        <Text style={styles.lessonDuration}>・{lesson.duration}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.lessonAction}>
                      <MaterialIcons name="arrow-forward-ios" size={16} color={colors.gray400} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="event-available" size={48} color={colors.gray300} />
                <Text style={styles.emptyText}>今後の予定はありません</Text>
              </View>
            )}
          </View>

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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  // 統計セクション
  statsSection: {},
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '700',
    color: colors.gray900,
    marginTop: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
  },
  // アクションセクション
  actionsSection: {},
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  actionTitle: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    textAlign: 'center',
  },
  // スケジュールセクション
  scheduleSection: {},
  lessonsList: {
    gap: spacing.sm,
  },
  lessonCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonStudent: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  lessonSubject: {
    fontSize: typography.sizes?.body || 14,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonTime: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    marginLeft: spacing.xs / 2,
  },
  lessonDuration: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
  },
  lessonAction: {
    padding: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes?.body || 14,
    color: colors.gray500,
    marginTop: spacing.md,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
