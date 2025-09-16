import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';

import Card from '@/components/common/Card';
import ScreenContainer from '@/components/common/ScreenContainer';
import { useUser } from '@/contexts/UserContext';
import { CoinManager } from '@/domain/coin/coinManager';
import { getApiClient } from '@/services/api/mock';
import { MockEscrowService } from '@/services/api/mock/escrowService';
import { mockRealtimeService } from '@/services/api/mock/realtimeService';
import type { Lesson as ApiLesson, Tutor } from '@/services/api/types';
import { colors, spacing, typography, borderRadius } from '@/styles/theme';

type LessonStatus =
  | 'pending'
  | 'approved'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

type Lesson = {
  id: string;
  tutorId: string;
  studentId: string;
  subject: string;
  scheduledAt: Date;
  duration: number; // minutes
  status: LessonStatus;
  escrow_status?: 'none' | 'reserved' | 'escrowed' | 'released' | 'refunded';
  price: number;
  notes?: string;
};

// サービスから取得するため、ローカルモックは削除

export default function LessonScreen() {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const escrowService = new MockEscrowService();

  // API Lesson -> 画面表示用 Lesson への変換
  const mapApiLessonToLocal = useCallback(
    (l: ApiLesson): Lesson => ({
      id: l.id,
      tutorId: l.tutor_id,
      studentId: l.student_id,
      subject: l.subject,
      scheduledAt: new Date(l.scheduled_at),
      duration: l.duration_minutes,
      status: l.status,
      escrow_status: l.escrow_status,
      price: l.coin_cost,
      notes: l.lesson_notes,
    }),
    [],
  );

  React.useEffect(() => {
    const api = getApiClient();
    const studentId = user?.id;
    if (!studentId) {
      setLessons([]);
      return;
    }

    let mounted = true;
    Promise.all([
      api.student.getLessons(studentId, undefined, 1, 100),
      api.student.searchTutors(undefined, 1, 200),
    ]).then(([lessonsResp, tutorsResp]) => {
      if (!mounted) return;
      const srvLessons = lessonsResp?.success ? lessonsResp.data : [];
      const mapped: Lesson[] = srvLessons.map((l) => mapApiLessonToLocal(l));
      setLessons(mapped);
      if (tutorsResp?.success) setTutors(tutorsResp.data);
    });
    return () => {
      mounted = false;
    };
  }, [mapApiLessonToLocal, user?.id]);

  const now = Date.now();

  // レッスンID集合が変わったときだけ購読を貼り替える
  const lessonIdsKey = useMemo(
    () =>
      lessons
        .map((l) => l.id)
        .sort()
        .join(','),
    [lessons],
  );

  React.useEffect(() => {
    if (lessons.length === 0) return;
    const unsubs = lessons.map((l) =>
      mockRealtimeService.subscribeLessonUpdates(l.id, (srv) => {
        // srv は API 型。ローカル表示用にマップして差し替え
        setLessons((prev) =>
          prev.map((it) =>
            it.id === srv.id ? mapApiLessonToLocal(srv as unknown as ApiLesson) : it,
          ),
        );
      }),
    );
    return () => {
      unsubs.forEach((u) => u());
    };
  }, [lessonIdsKey, mapApiLessonToLocal]);
  const upcomingLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const t = lesson.scheduledAt.getTime();
      const isFuture = t >= now;
      const isUpcomingStatus =
        lesson.status === 'pending' ||
        lesson.status === 'approved' ||
        lesson.status === 'in_progress';
      return isUpcomingStatus && (isFuture || lesson.status === 'in_progress');
    });
  }, [lessons, now]);

  const historyLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const t = lesson.scheduledAt.getTime();
      const isPast = t < now;
      const isHistoryStatus = lesson.status === 'completed' || lesson.status === 'cancelled';
      return isHistoryStatus || isPast;
    });
  }, [lessons, now]);

  // 表示対象（チューターが見つかるものだけ）
  const visibleUpcomingLessons = useMemo(() => {
    if (tutors.length === 0) return upcomingLessons;
    const tutorIds = new Set(tutors.map((t) => t.id));
    return upcomingLessons.filter((l) => tutorIds.has(l.tutorId));
  }, [upcomingLessons, tutors]);

  const visibleHistoryLessons = useMemo(() => {
    if (tutors.length === 0) return historyLessons;
    const tutorIds = new Set(tutors.map((t) => t.id));
    return historyLessons.filter((l) => tutorIds.has(l.tutorId));
  }, [historyLessons, tutors]);

  const getStatusColor = (status: LessonStatus) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'approved':
        return colors.success;
      case 'in_progress':
        return colors.primary;
      case 'completed':
        return colors.primary;
      case 'cancelled':
      case 'rejected':
        return colors.error;
      default:
        return colors.gray500;
    }
  };

  const getStatusText = (status: LessonStatus) => {
    switch (status) {
      case 'pending':
        return '承認待ち';
      case 'approved':
        return '承認済み';
      case 'in_progress':
        return '授業中';
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      case 'rejected':
        return '拒否';
      default:
        return status;
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // エスクロー操作ボタンをレンダリング
  const renderActionButtons = (item: Lesson) => {
    switch (item.status) {
      case 'approved':
      case 'in_progress':
        return (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              disabled={isLoading}
              onPress={() => handleCompleteLesson(item)}
            >
              <Text style={styles.completeButtonText}>
                {isLoading ? '処理中...' : '完了にする'}
              </Text>
            </TouchableOpacity>

            {item.status === 'approved' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                disabled={isLoading}
                onPress={() => handleCancelLesson(item)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'pending':
        return (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              disabled={isLoading}
              onPress={() => handleCancelLesson(item)}
            >
              <Text style={styles.cancelButtonText}>申請キャンセル</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  // 授業完了処理
  const handleCompleteLesson = async (lesson: Lesson) => {
    Alert.alert('授業完了', 'この授業を完了し、先生に送金しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '完了する',
        onPress: async () => {
          setIsLoading(true);
          try {
            const response = await escrowService.completeLesson(lesson.id);

            if (response.success) {
              // レッスンリストを更新
              setLessons((prev) =>
                prev.map((l) =>
                  l.id === lesson.id ? { ...l, status: 'completed', escrow_status: 'released' } : l,
                ),
              );

              // コイン残高を更新（ユーザーコンテキストから）
              if (user) {
                CoinManager.syncBalance(user.id);
              }

              Alert.alert('完了しました', '授業が完了し、先生に送金しました。');
            } else {
              Alert.alert('エラー', response.error || '完了処理に失敗しました。');
            }
          } catch {
            Alert.alert('エラー', 'ネットワークエラーが発生しました。');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  // 授業キャンセル処理
  const handleCancelLesson = async (lesson: Lesson) => {
    const hoursUntil = (lesson.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);

    if (lesson.status === 'approved' && hoursUntil < 12) {
      Alert.alert('キャンセル不可', '開始12時間前を過ぎているため、キャンセルできません。');
      return;
    }

    Alert.alert(
      'キャンセル確認',
      `この授業をキャンセルし、${lesson.price.toLocaleString()}コインを返金しますか？`,
      [
        { text: '戻る', style: 'cancel' },
        {
          text: 'キャンセルする',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const response = await escrowService.cancelLesson(lesson.id);

              if (response.success) {
                // レッスンリストを更新
                setLessons((prev) =>
                  prev.map((l) =>
                    l.id === lesson.id
                      ? { ...l, status: 'cancelled', escrow_status: 'refunded' }
                      : l,
                  ),
                );

                // コイン残高を更新
                if (user) {
                  CoinManager.syncBalance(user.id);
                }

                Alert.alert('キャンセル完了', '返金処理が完了しました。');
              } else {
                Alert.alert('エラー', response.error || 'キャンセル処理に失敗しました。');
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

  const renderLessonItem = ({ item }: { item: Lesson }) => {
    // tutors フィルタ済みのため、ここでは常に存在する前提
    const tutor = tutors.find((t) => t.id === item.tutorId) as Tutor;

    return (
      <TouchableOpacity style={styles.lessonCard}>
        <View style={styles.lessonHeader}>
          <View style={styles.tutorInfo}>
            <View style={styles.tutorAvatar}>
              {tutor.avatar_url ? (
                <Image source={{ uri: tutor.avatar_url }} style={styles.tutorAvatarImage} />
              ) : (
                <MaterialIcons name="person" size={20} color={colors.gray400} />
              )}
            </View>
            <View style={styles.tutorDetails}>
              <Text style={styles.tutorName}>{tutor.name}</Text>
              <Text style={styles.subject}>{item.subject}</Text>
            </View>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.lessonDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={16} color={colors.gray500} />
            <Text style={styles.detailText}>
              {formatDateTime(item.scheduledAt)} ({item.duration}分)
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="monetization-on" size={16} color={colors.gray500} />
            <Text style={styles.detailText}>{item.price.toLocaleString()}コイン</Text>
          </View>
          {item.notes && (
            <View style={styles.detailRow}>
              <MaterialIcons name="note" size={16} color={colors.gray500} />
              <Text style={styles.detailText}>{item.notes}</Text>
            </View>
          )}
        </View>

        {/* エスクロー操作ボタン */}
        {renderActionButtons(item)}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer
      withScroll={false}
      contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
      bottomSpacing={spacing.xl}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {}}>
          <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>授業</Text>
        <TouchableOpacity style={styles.headerRightButton} onPress={() => {}}>
          <MaterialIcons name="refresh" size={24} color={colors.gray900} />
        </TouchableOpacity>
      </View>
      {/* タブ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.activeTabText]}>
            予定 ({visibleUpcomingLessons.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            履歴 ({visibleHistoryLessons.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 授業リスト */}
      <FlatList
        data={selectedTab === 'upcoming' ? visibleUpcomingLessons : visibleHistoryLessons}
        renderItem={renderLessonItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={{ alignItems: 'center' }}>
            <MaterialIcons
              name={selectedTab === 'upcoming' ? 'event-note' : 'history'}
              size={64}
              color={colors.gray300}
            />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'upcoming'
                ? '予定された授業がありません'
                : '完了した授業がありません'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'upcoming'
                ? 'チャットから先輩に授業を申請してみましょう'
                : '授業を完了すると履歴に表示されます'}
            </Text>
          </Card>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  },
  headerRightButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray50,
    marginHorizontal: spacing.md, // リストと左右余白を揃える
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm, // コンパクトに調整
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: colors.primary, // アクティブはプライマリで視認性向上
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.gray700,
    fontWeight: typography.fontWeights.medium,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  lessonCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tutorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tutorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  tutorAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tutorDetails: {
    flex: 1,
  },
  tutorName: {
    fontSize: typography.fontSizes.md || 16,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray900,
    marginBottom: 2,
  },
  subject: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full || 999,
  },
  statusText: {
    fontSize: typography.fontSizes.xs || 12,
    fontWeight: typography.fontWeights.semibold,
  },
  lessonDetails: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.gray700,
    flex: 1,
  },
  actionButtons: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  actionButtonsRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  completeButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.gray600,
  },
  completeButtonText: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  cancelButtonText: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg || 18,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray600,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.md || 16,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
});
