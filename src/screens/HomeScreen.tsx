import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeStackParamList } from '../navigation/HomeStackNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { getApiClient } from '@/services/api/mock';
import type { Tutor, Student } from '@/services/api/types';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeMain'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  const [recommendedTutors, setRecommendedTutors] = useState<Tutor[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  useEffect(() => {
    const api = getApiClient();
    let isMounted = true;
    Promise.all([api.student.searchTutors(undefined, 1, 50), api.student.getProfile('student-1')])
      .then(([tutorsResp, studentResp]) => {
        if (!isMounted) return;
        const tutors = tutorsResp?.success ? tutorsResp.data : [];
        const recommended = [...tutors].sort((a, b) => b.rating - a.rating).slice(0, 3);
        setRecommendedTutors(recommended);
        if (studentResp?.success && studentResp.data) {
          setCurrentStudent(studentResp.data);
        }
      })
      .catch(() => {
        // noop
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTutorPress = (tutorId: string) => {
    navigation.navigate('TutorDetail', { tutorId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader} testID="home-header">
        <Text style={styles.appName}>センパイ</Text>
        <TouchableOpacity style={styles.notificationButton} testID="notification-icon">
          <MaterialIcons name="notifications" size={20} color={colors.gray700} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#8B7ED8', '#B794F6', '#E879F9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              おはよう、{currentStudent?.name ?? 'ゲスト'}さん！👋
            </Text>
            <Text style={styles.subtitle}>今日も新しい学びの出会いを見つけよう</Text>
          </View>
        </LinearGradient>

        {/* Rounded transition with overlaid cards */}
        <View style={styles.contentContainer}>
          {/* Coin Card - overlaid on gradient transition */}
          <View style={styles.overlaidCardSection}>
            <View style={styles.coinCard} testID="coin-card">
              <View style={styles.coinIconContainer}>
                <MaterialIcons name="account-balance-wallet" size={24} color={colors.warning} />
              </View>
              <View style={styles.coinInfo}>
                <Text style={styles.coinLabel}>コイン残高</Text>
                <Text style={styles.coinAmount}>
                  {(currentStudent?.coins ?? 0).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addCoinButton}
                onPress={() => navigation.navigate('CoinManagement' as never)}
              >
                <Text style={styles.addCoinText}>購入する</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Action Card - overlaid */}
          <View style={styles.quickActionCard}>
            <View style={styles.quickActions} testID="quick-actions">
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('Search' as never)}
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
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={styles.quickActionIcon}>
                  <MaterialIcons name="star" size={24} color={colors.primary} />
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
              <TouchableOpacity
                key={tutor.id}
                style={styles.tutorCard}
                testID="tutor-card"
                onPress={() => handleTutorPress(tutor.id)}
              >
                <View style={styles.tutorCardContent}>
                  <View
                    style={[
                      styles.tutorAvatar,
                      { backgroundColor: tutor.id === '1' ? colors.error : colors.primary },
                    ]}
                  >
                    <Text style={styles.tutorAvatarText}>{tutor.name.charAt(0)}</Text>
                    {tutor.online_available && <View style={styles.onlineDot} />}
                  </View>

                  <View style={styles.tutorInfo}>
                    <View style={styles.tutorHeader}>
                      <Text style={styles.tutorName}>{tutor.name}</Text>
                      <View style={styles.ratingContainer}>
                        <MaterialIcons name="star" size={14} color={colors.warning} />
                        <Text style={styles.ratingText}>
                          {tutor.rating} ({tutor.total_lessons}回)
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.tutorSchool}>
                      {tutor.school} {tutor.grade}
                    </Text>

                    <View style={styles.tutorSubjects}>
                      {tutor.subjects_taught.slice(0, 3).map((subject: string, index: number) => (
                        <View key={index} style={styles.subjectChip}>
                          <Text style={styles.subjectChipText}>{subject}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.tutorFooter}>
                      <Text style={styles.tutorRate}>
                        {tutor.hourly_rate.toLocaleString()}コイン/時
                      </Text>
                      {tutor.online_available && (
                        <View style={styles.onlineStatusContainer}>
                          <View style={styles.onlineIndicator} />
                          <Text style={styles.onlineStatus}>オンライン</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
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
    backgroundColor: colors.gray50,
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
  quickActionCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
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
    paddingHorizontal: spacing.lg,
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
  tutorCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    color: colors.gray900,
  },
  onlineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs / 2,
  },
  onlineStatus: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.success,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: spacing.xl,
    backgroundColor: colors.white,
  },
});
