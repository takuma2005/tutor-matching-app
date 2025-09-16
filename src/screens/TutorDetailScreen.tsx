import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { ImageStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomSheet from '../components/common/BottomSheet';
import { useFavorites } from '../contexts/FavoritesContext';
import type { HomeStackParamList } from '../navigation/HomeStackNavigator';
import type { SearchStackParamList } from '../navigation/SearchStackNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import ScreenContainer from '@/components/common/ScreenContainer';
import Section from '@/components/common/Section';
import { useAuth } from '@/contexts/AuthContext';
import { CoinManager } from '@/domain/coin/coinManager';
import { getApiClient, mockApiClient } from '@/services/api/mock';
import type { Tutor, Student } from '@/services/api/types';

type HomeTutorDetailProps = StackScreenProps<HomeStackParamList, 'TutorDetail'>;
type SearchTutorDetailProps = StackScreenProps<SearchStackParamList, 'TutorDetail'>;
type Props = HomeTutorDetailProps | SearchTutorDetailProps;

const MATCHING_COST = 300; // マッチングに必要なコイン数

type NavigationLike = {
  navigate?: NavigationProp<ParamListBase>['navigate'];
  getParent?: () => NavigationLike | undefined | null;
  getState?: () => { routeNames?: string[] } | undefined;
};

export default function TutorDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { tutorId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [tutor, setTutor] = useState<Tutor | undefined>(undefined);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { student: authStudent, user: authUser } = useAuth();
  const api = React.useMemo(() => getApiClient() as typeof mockApiClient, []);

  // マッチング申請モーダルの状態
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchMessage, setMatchMessage] = useState('');
  const [scheduleNote, setScheduleNote] = useState('');
  const [messageError, setMessageError] = useState('');

  // アニメーション用の共有値
  const translateY = useSharedValue(300); // モーダルコンテンツの初期位置（下に隠した状態）

  // モーダルアニメーション制御
  useEffect(() => {
    if (showMatchModal) {
      // モーダルを表示する時は上にスライド
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
      });
    } else {
      // モーダルを非表示する時は下にスライド
      translateY.value = withTiming(300, {
        duration: 250,
      });
    }
  }, [showMatchModal, translateY]);

  // アニメーションスタイル
  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const loadStudentProfile = useCallback(async () => {
    const id = authStudent?.id ?? authUser?.id;
    if (!id) {
      setCurrentStudent(null);
      return;
    }
    try {
      const profile = await api.student.getProfile(id);
      if (profile.success) {
        setCurrentStudent(profile.data);
      } else if (authStudent) {
        setCurrentStudent(authStudent);
      }
    } catch (error) {
      console.error('Failed to load student profile:', error);
    }
  }, [api, authStudent, authUser?.id]);

  // データ取得
  React.useEffect(() => {
    let mounted = true;
    const id = authStudent?.id ?? authUser?.id;
    Promise.all([
      api.student.searchTutors(undefined, 1, 200),
      id
        ? api.student.getProfile(id)
        : Promise.resolve({ success: false as const, data: undefined as unknown as Student }),
    ])
      .then(([tutorsResp, studentResp]) => {
        if (!mounted) return;
        const tutors = tutorsResp?.success ? tutorsResp.data : [];
        setTutor(tutors.find((t) => t.id === tutorId));
        if (studentResp?.success) setCurrentStudent(studentResp.data);
        else if (authStudent) setCurrentStudent(authStudent);
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
  }, [api, authStudent, authUser?.id, tutorId]);

  useFocusEffect(
    useCallback(() => {
      const id = authStudent?.id ?? authUser?.id;
      if (id) {
        CoinManager.syncBalance(id).catch(() => {});
      }
      loadStudentProfile().catch(() => {});
    }, [authStudent?.id, authUser?.id, loadStudentProfile]),
  );

  // Bottom sheet state
  const [isSheetOpen, setSheetOpen] = useState(false);
  const toggleSheet = () => setSheetOpen((prev) => !prev);

  // 現在のユーザー（student）の情報を取得はサービスから取得済み

  const openCoinManagement = useCallback((): boolean => {
    const tryNavigate = (nav: NavigationLike | null | undefined) => {
      if (!nav || typeof nav.navigate !== 'function') {
        return false;
      }
      const state = typeof nav.getState === 'function' ? nav.getState() : undefined;
      if (state?.routeNames?.includes('CoinManagement')) {
        (nav.navigate as unknown as (routeName: string, params?: unknown) => void)(
          'CoinManagement',
        );
        return true;
      }
      if (state?.routeNames?.includes('Home')) {
        (nav.navigate as unknown as (routeName: string, params?: unknown) => void)('Home', {
          screen: 'CoinManagement',
        });
        return true;
      }
      return false;
    };

    if (tryNavigate(navigation)) return true;
    const parent = navigation.getParent?.();
    if (tryNavigate(parent as NavigationLike | null | undefined)) return true;
    const grandParent = typeof parent?.getParent === 'function' ? parent.getParent() : undefined;
    if (tryNavigate(grandParent as NavigationLike | null | undefined)) return true;
    return false;
  }, [navigation]);

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
        `マッチング申請には${MATCHING_COST}コインが必要です。\n\nコイン購入画面に移動しますか？`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'コイン購入',
            onPress: () => {
              const navigated = openCoinManagement();
              if (!navigated) {
                Alert.alert('ご案内', 'ホームタブの「コイン管理」からコインを購入できます。');
              }
            },
          },
        ],
      );
      return;
    }

    // メッセージ入力モーダルを表示
    setMatchMessage('');
    setScheduleNote('');
    setMessageError('');
    setShowMatchModal(true);
  };

  const handleSendMatchRequest = () => {
    // メッセージのバリデーション
    if (matchMessage.trim().length < 20) {
      setMessageError('メッセージは20文字以上で入力してください。');
      return;
    }

    setMessageError('');
    setShowMatchModal(false);

    // 確認ダイアログ
    if (!currentStudent) {
      Alert.alert('エラー', 'ログイン済みの生徒情報が取得できませんでした。');
      return;
    }

    Alert.alert(
      'マッチング申請',
      `${tutor.name}さんにマッチング申請を送信しますか？\n\n必要コイン：${MATCHING_COST}コイン\n残高：${currentStudent?.coins ?? 0}コイン → ${(currentStudent?.coins ?? 0) - MATCHING_COST}コイン`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '申請する',
          onPress: async () => {
            setIsLoading(true);
            try {
              const api = getApiClient();
              const response = await api.student.sendMatchRequest(
                currentStudent.id,
                tutorId,
                matchMessage.trim(),
                scheduleNote.trim() || undefined,
              );

              if (response.success) {
                // 残高を更新（モックデータから取得）
                const updatedStudent = await api.student.getProfile(currentStudent.id);
                if (updatedStudent.success) {
                  setCurrentStudent(updatedStudent.data);
                  await CoinManager.syncBalance(updatedStudent.data.id);
                }

                Alert.alert(
                  '申請完了',
                  `${tutor.name}さんにマッチング申請を送信しました！\n相手の返答をお待ちください。`,
                  [{ text: 'OK', onPress: () => navigation.goBack() }],
                );
              } else {
                Alert.alert('エラー', response.error || 'マッチング申請に失敗しました。');
              }
            } catch {
              Alert.alert('エラー', 'ネットワークエラーが発生しました。');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleToggleFavorite = () => {
    if (!currentStudent || !tutor) return;

    const wasFavorite = isFavorite(tutorId);
    toggleFavorite(tutorId, currentStudent.id);

    const action = wasFavorite ? '削除' : '追加';
    setTimeout(() => {
      Alert.alert('お気に入り', `${tutor.name}さんをお気に入り${action}しました`, [{ text: 'OK' }]);
    }, 100);
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
      {tutor.online_available && (
        <View style={styles.onlineTag}>
          <Text style={styles.onlineTagText}>オンライン授業可</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScreenContainer
      withScroll={false}
      contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
    >
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
        <Section title="指導科目" style={{ marginHorizontal: spacing.lg }}>
          {renderSubjectTags()}
        </Section>

        {/* 自己紹介 */}
        <Section title="自己紹介" style={{ marginHorizontal: spacing.lg }}>
          <Text style={styles.introText}>
            {tutor.bio ||
              `こんにちは！${tutor.name}です。${tutor.school}で勉強しています。\n\n得意科目は${tutor.subjects_taught.slice(0, 2).join('、')}です。丁寧に指導させていただきます。一緒に頑張りましょう！`}
          </Text>
        </Section>

        {/* 基本情報 */}
        <Section title="基本情報" style={{ marginHorizontal: spacing.lg }}>
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
        </Section>

        {/* 底部の余白 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* マッチング申請とお気に入りボタン */}
      <View style={[styles.bottomContainer, { paddingBottom: spacing.lg + insets.bottom }]}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.favoriteButtonBottom}
            onPress={handleToggleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name={isFavorite(tutorId) ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorite(tutorId) ? colors.error : colors.gray600}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.matchButton, isLoading && styles.matchButtonDisabled]}
            onPress={handleMatchingRequest}
            disabled={isLoading}
          >
            <MaterialIcons
              name="person-add"
              size={20}
              color={colors.white}
              style={styles.matchButtonIcon}
            />
            <Text style={styles.matchButtonText}>
              {isLoading ? 'マッチング申請中...' : `マッチング申請 (${MATCHING_COST}コイン)`}
            </Text>
          </TouchableOpacity>
        </View>
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

      {/* マッチング申請メッセージ入力モーダル */}
      <Modal
        visible={showMatchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowMatchModal(false)}
          />
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Animated.View
              style={[styles.modalContent, animatedModalStyle]}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>マッチング申請</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowMatchModal(false)}
                >
                  <MaterialIcons name="close" size={24} color={colors.gray600} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>{tutor?.name}さんへのメッセージ（20文字以上）</Text>
                <Text style={styles.modalDescription}>
                  どのような勉強をしたいか、どのような支援を求めているかを具体的に教えてください。
                </Text>
                <TextInput
                  style={[styles.messageInput, messageError ? styles.messageInputError : null]}
                  placeholder="例：数学の微積分を基礎から教えてほしいです。特に応用問題が苦手で、解法のコツを教えていただけると嬉しいです。"
                  placeholderTextColor={colors.gray400}
                  value={matchMessage}
                  onChangeText={(text) => {
                    setMatchMessage(text);
                    if (messageError && text.trim().length >= 20) {
                      setMessageError('');
                    }
                  }}
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                  textAlignVertical="top"
                />
                <View style={styles.messageInputFooter}>
                  {messageError ? (
                    <Text style={styles.modalErrorText}>{messageError}</Text>
                  ) : (
                    <Text style={styles.characterCount}>
                      {matchMessage.length}/300文字 （最低20文字）
                    </Text>
                  )}
                </View>

                {/* 希望日程入力欄 */}
                <Text style={styles.scheduleLabel}>希望日程（任意）</Text>
                <Text style={styles.scheduleDescription}>
                  どのくらいの頻度で授業を希望するか、詳細を教えてください。
                </Text>
                <TextInput
                  style={styles.scheduleInput}
                  placeholder="例）週2回・1回90分、テスト前は週3回希望"
                  placeholderTextColor={colors.gray400}
                  value={scheduleNote}
                  onChangeText={setScheduleNote}
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                  textAlignVertical="top"
                  accessibilityLabel="希望する日程"
                />
                <Text style={styles.scheduleCharacterCount}>{scheduleNote.length}/300文字</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowMatchModal(false)}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    matchMessage.trim().length < 20 ? styles.sendButtonDisabled : null,
                  ]}
                  onPress={handleSendMatchRequest}
                  disabled={matchMessage.trim().length < 20}
                >
                  <Text
                    style={[
                      styles.sendButtonText,
                      matchMessage.trim().length < 20 ? styles.sendButtonTextDisabled : null,
                    ]}
                  >
                    申請する（{MATCHING_COST}コイン）
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  onlineTag: {
    alignItems: 'center',
    backgroundColor: colors.secondary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full || 999,
  },
  onlineTagText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.secondary,
    fontWeight: '600',
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
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButtonBottom: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gray300,
    marginRight: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  matchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
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
  favoriteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerRightButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // マッチング申請モーダルのスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    pointerEvents: 'auto',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalTitle: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '600',
    color: colors.gray900,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalLabel: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  modalDescription: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
    minHeight: 100,
    maxHeight: 120,
  },
  messageInputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  messageInputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  modalErrorText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.error,
  },
  characterCount: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg + spacing.md,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray700,
    fontWeight: '500',
  },
  sendButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  sendButtonText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.white,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: colors.gray500,
  },
  // 希望日程入力欄用スタイル
  scheduleLabel: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  scheduleDescription: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  scheduleInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
    minHeight: 80,
    maxHeight: 100,
  },
  scheduleCharacterCount: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
