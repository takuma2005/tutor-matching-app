import { MaterialIcons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import type { ImageStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomSheet from '../components/common/BottomSheet';
import type { HomeStackParamList } from '../navigation/HomeStackNavigator';
import type { SearchStackParamList } from '../navigation/SearchStackNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { getApiClient } from '@/services/api/mock';
import type { Tutor, Student } from '@/services/api/types';

type HomeTutorDetailProps = StackScreenProps<HomeStackParamList, 'TutorDetail'>;
type SearchTutorDetailProps = StackScreenProps<SearchStackParamList, 'TutorDetail'>;
type Props = HomeTutorDetailProps | SearchTutorDetailProps;

const MATCHING_COST = 300; // マッチングに必要なコイン数

export default function TutorDetailScreen({ route, navigation }: Props) {
  const { tutorId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [tutor, setTutor] = useState<Tutor | undefined>(undefined);

  // データ取得
  React.useEffect(() => {
    const api = getApiClient();
    let mounted = true;
    Promise.all([api.student.searchTutors(undefined, 1, 200), api.student.getProfile('student-1')])
      .then(([tutorsResp, studentResp]) => {
        if (!mounted) return;
        const tutors = tutorsResp?.success ? tutorsResp.data : [];
        setTutor(tutors.find((t) => t.id === tutorId));
        if (studentResp?.success) setCurrentStudent(studentResp.data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) {
          // no-op
        }
      });
    return () => {
      mounted = false;
    };
  }, [tutorId]);

  // Bottom sheet state
  const [isSheetOpen, setSheetOpen] = useState(false);
  const toggleSheet = () => setSheetOpen((prev) => !prev);

  // 現在のユーザー（student）の情報を取得はサービスから取得済み

  if (!tutor) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>先輩の情報が見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleMatchingRequest = () => {
    // コイン残高チェック
    if ((currentStudent?.coins ?? 0) < MATCHING_COST) {
      Alert.alert(
        'コインが不足しています',
        `マッチング申請には${MATCHING_COST}コインが必要です。現在の残高：${currentStudent?.coins ?? 0}コイン`,
        [{ text: 'OK' }],
      );
      return;
    }

    // 確認ダイアログ
    Alert.alert(
      'マッチング申請',
      `${tutor.name}さんにマッチング申請を送信しますか？\n\n必要コイン：${MATCHING_COST}コイン\n残高：${currentStudent?.coins ?? 0}コイン → ${(currentStudent?.coins ?? 0) - MATCHING_COST}コイン`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '申請する',
          onPress: () => {
            setIsLoading(true);
            // 実際のAPIコールをシミュレート
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert(
                '申請完了',
                `${tutor.name}さんにマッチング申請を送信しました！\n相手の返答をお待ちください。`,
                [{ text: 'OK', onPress: () => navigation.goBack() }],
              );
            }, 2000);
          },
        },
      ],
    );
  };

  const formatRate = (rate: number) => {
    return `${rate.toLocaleString()}コイン`;
  };

  const renderSubjectTags = () => (
    <View style={styles.subjectTags}>
      {tutor.subjects_taught.map((subject, index) => (
        <View key={index} style={styles.subjectTag}>
          <Text style={styles.subjectTagText}>{subject}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>プロフィール</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerRightButton} onPress={toggleSheet}>
            <MaterialIcons name="tune" size={24} color={colors.gray900} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingTop: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* プロフィール写真とメイン情報 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {tutor.avatar_url ? (
              <Image source={{ uri: tutor.avatar_url }} style={styles.avatar as ImageStyle} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={40} color={colors.gray400} />
              </View>
            )}

            {/* オンライン状態 */}
            {tutor.online_available && (
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>オンライン</Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.tutorName}>{tutor.name}</Text>
            <Text style={styles.tutorSchool}>
              {tutor.school} {tutor.grade}
            </Text>

            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={16} color={colors.warning} />
              <Text style={styles.rating}>{tutor.rating.toFixed(1)}</Text>
              <Text style={styles.lessonsCount}>({tutor.total_lessons}回のレッスン)</Text>
            </View>

            <View style={styles.rateContainer}>
              <Text style={styles.rateLabel}>時給</Text>
              <Text style={styles.rateValue}>{formatRate(tutor.hourly_rate)}</Text>
              <Text style={styles.rateUnit}>/ 時間</Text>
            </View>
          </View>
        </View>

        {/* 科目 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>指導科目</Text>
          {renderSubjectTags()}
        </View>

        {/* 自己紹介 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自己紹介</Text>
          <Text style={styles.introText}>
            {tutor.bio ||
              `こんにちは！${tutor.name}です。${tutor.school}で勉強しています。\n\n得意科目は${tutor.subjects_taught.slice(0, 2).join('、')}です。丁寧に指導させていただきます。一緒に頑張りましょう！`}
          </Text>
        </View>

        {/* 基本情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本情報</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>学校</Text>
              <Text style={styles.infoValue}>{tutor.school}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>学年</Text>
              <Text style={styles.infoValue}>{tutor.grade}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>地域</Text>
              <Text style={styles.infoValue}>{tutor.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>対応</Text>
              <Text style={styles.infoValue}>
                {tutor.online_available ? 'オンライン対応' : '対面のみ'}
              </Text>
            </View>
          </View>
        </View>

        {/* 底部の余白 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* マッチング申請ボタン */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.matchButton, isLoading && styles.matchButtonDisabled]}
          onPress={handleMatchingRequest}
          disabled={isLoading}
        >
          <MaterialIcons
            name="favorite"
            size={20}
            color={colors.white}
            style={styles.matchButtonIcon}
          />
          <Text style={styles.matchButtonText}>
            {isLoading ? 'マッチング申請中...' : `マッチング申請 (${MATCHING_COST}コイン)`}
          </Text>
        </TouchableOpacity>
      </View>

      <BottomSheet isOpen={isSheetOpen} onClose={toggleSheet} height={560}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>アクション</Text>
            <Text style={styles.introText}>このシートは固定高さで表示されます。</Text>
          </View>
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </BottomSheet>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '600',
    color: colors.gray900,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  headerRight: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
    textAlign: 'center',
  },
  profileSection: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray200,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full || 999,
    marginTop: spacing.sm,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    marginRight: spacing.xs / 2,
  },
  onlineText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.white,
    fontWeight: '500',
  },
  profileInfo: {
    alignItems: 'center',
  },
  tutorName: {
    fontSize: typography.sizes?.h2 || 24,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  tutorSchool: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rating: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
    fontWeight: '500',
    marginLeft: spacing.xs / 2,
  },
  lessonsCount: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    marginLeft: spacing.xs,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginRight: spacing.xs,
  },
  rateValue: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '700',
    color: colors.primary,
  },
  rateUnit: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginLeft: spacing.xs / 2,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  subjectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  subjectTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full || 999,
  },
  subjectTagText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.white,
    fontWeight: '500',
  },
  introText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray700,
    lineHeight: 24,
  },
  infoGrid: {
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
  },
  infoValue: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  bottomContainer: {
    padding: spacing.lg,
    borderTopWidth: 0,
    borderTopColor: colors.gray200,
    backgroundColor: colors.white,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    margin: 0,
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  matchButtonDisabled: {
    backgroundColor: colors.gray400,
    shadowOpacity: 0,
    elevation: 0,
  },
  matchButtonIcon: {
    marginRight: spacing.sm,
  },
  matchButtonText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.white,
    fontWeight: '600',
  },
  headerRightButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
});
