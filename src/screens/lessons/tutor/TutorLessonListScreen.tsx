import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { StandardScreen } from '../../../components/templates';
import { colors, spacing, typography } from '../../../styles/theme';

import { getApiClient, mockApiClient } from '@/services/api/mock';
import { MockEscrowService } from '@/services/api/mock/escrowService';
import type { Lesson, Student } from '@/services/api/types';

type EnrichedLesson = Lesson & {
  student?: Student;
};

export default function TutorLessonListScreen() {
  const [lessons, setLessons] = useState<EnrichedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const escrowService = React.useMemo(() => new MockEscrowService(), []);

  const loadLessons = useCallback(async () => {
    try {
      setIsLoading(true);
      const api = getApiClient() as typeof mockApiClient;
      const response = await api.tutor.getLessons(undefined, 1, 100);
      if (!response.success) {
        throw new Error(response.error || 'レッスンの取得に失敗しました。');
      }

      const uniqueStudentIds = Array.from(
        new Set(response.data.map((lesson) => lesson.student_id)),
      );
      const studentResponses = await Promise.all(
        uniqueStudentIds.map(async (id) => ({ id, res: await api.student.getProfile(id) })),
      );

      const studentMap = new Map<string, Student>();
      studentResponses.forEach(({ id, res }) => {
        if (res.success) {
          studentMap.set(id, res.data);
        }
      });

      setLessons(
        response.data.map((lesson: Lesson) => ({
          ...lesson,
          student: studentMap.get(lesson.student_id),
        })),
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        'エラー',
        error instanceof Error ? error.message : 'レッスンの取得に失敗しました。',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadLessons().catch(() => {});
  }, [loadLessons]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadLessons().catch(() => {});
  }, [loadLessons]);

  const getStatusMeta = useCallback((status: Lesson['status']) => {
    switch (status) {
      case 'pending':
        return { label: '承認待ち', color: colors.warning };
      case 'approved':
        return { label: '承認済み', color: colors.success };
      case 'in_progress':
        return { label: '授業中', color: colors.primary };
      case 'completed':
        return { label: '完了', color: colors.primary };
      case 'cancelled':
        return { label: 'キャンセル', color: colors.error };
      case 'rejected':
        return { label: '拒否', color: colors.error };
      case 'scheduled':
        return { label: '予定', color: colors.primary };
      default:
        return { label: status, color: colors.gray500 };
    }
  }, []);

  const handleApproveLesson = useCallback(
    (lesson: EnrichedLesson) => {
      Alert.alert('申請を承認', `${lesson.student?.name ?? '後輩'}さんの授業を承認しますか？`, [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '承認する',
          onPress: async () => {
            try {
              setProcessingId(lesson.id);
              const response = await escrowService.approveLesson(lesson.id);
              if (response.success) {
                setLessons((prev) =>
                  prev.map((item) =>
                    item.id === lesson.id ? { ...item, ...response.data } : item,
                  ),
                );
                Alert.alert('承認完了', '授業申請を承認しました。');
              } else {
                Alert.alert('エラー', response.error || '承認処理に失敗しました。');
              }
            } catch {
              Alert.alert('エラー', '承認処理中に問題が発生しました。');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]);
    },
    [escrowService],
  );

  const handleCompleteLesson = useCallback(
    (lesson: EnrichedLesson) => {
      Alert.alert('授業完了', `${lesson.student?.name ?? '後輩'}さんとの授業を完了しますか？`, [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '完了する',
          onPress: async () => {
            try {
              setProcessingId(lesson.id);
              const response = await escrowService.completeLesson(lesson.id);
              if (response.success) {
                setLessons((prev) =>
                  prev.map((item) =>
                    item.id === lesson.id ? { ...item, ...response.data } : item,
                  ),
                );
                Alert.alert('完了しました', '授業を完了として登録しました。');
              } else {
                Alert.alert('エラー', response.error || '完了処理に失敗しました。');
              }
            } catch {
              Alert.alert('エラー', '完了処理中に問題が発生しました。');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]);
    },
    [escrowService],
  );

  const sortedLessons = useMemo(
    () =>
      [...lessons].sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
      ),
    [lessons],
  );

  const renderLesson = useCallback(
    ({ item }: { item: EnrichedLesson }) => {
      const statusMeta = getStatusMeta(item.status);
      const scheduledDate = new Date(item.scheduled_at);
      return (
        <View style={styles.lessonCard}>
          <View style={styles.lessonHeader}>
            <View>
              <Text style={styles.studentName}>{item.student?.name ?? '不明な後輩'}</Text>
              <Text style={styles.studentMeta}>{item.student?.grade}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusMeta.color + '20' }]}>
              <Text style={[styles.statusText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>
          <Text style={styles.schedule}>
            {scheduledDate.toLocaleString('ja-JP', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <View style={styles.lessonInfo}>
            <Text style={styles.detailText}>科目: {item.subject}</Text>
            <Text style={styles.detailText}>{item.duration_minutes}分</Text>
            <Text style={styles.coinText}>{item.coin_cost}コイン</Text>
          </View>

          {item.lesson_notes && <Text style={styles.notes}>{item.lesson_notes}</Text>}

          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, processingId === item.id && styles.disabledButton]}
              onPress={() => handleApproveLesson(item)}
              disabled={processingId === item.id}
            >
              <Text style={styles.actionButtonText}>
                {processingId === item.id ? '処理中...' : '承認する'}
              </Text>
            </TouchableOpacity>
          )}

          {(item.status === 'approved' || item.status === 'in_progress') && (
            <TouchableOpacity
              style={[styles.completeButton, processingId === item.id && styles.disabledButton]}
              onPress={() => handleCompleteLesson(item)}
              disabled={processingId === item.id}
            >
              <Text style={styles.completeButtonText}>
                {processingId === item.id ? '処理中...' : '完了にする'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [getStatusMeta, handleApproveLesson, handleCompleteLesson, processingId],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>レッスンはまだありません</Text>
        <Text style={styles.emptyDescription}>授業申請を承認すると、ここに表示されます。</Text>
      </View>
    );
  }, [isLoading]);

  return (
    <StandardScreen title="レッスン管理" showBackButton={false}>
      {isLoading && !isRefreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sortedLessons}
          keyExtractor={(item) => item.id}
          renderItem={renderLesson}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </StandardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  studentName: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  studentMeta: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    marginTop: spacing.xs / 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  schedule: {
    fontSize: typography.sizes?.body || 14,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  lessonInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  detailText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
  },
  coinText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.warning,
    fontWeight: '600',
  },
  notes: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.sizes?.body || 14,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: typography.sizes?.body || 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.sizes?.body || 14,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
});
