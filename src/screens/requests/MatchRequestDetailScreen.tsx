import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { StandardScreen } from '../../components/templates';
import { colors, spacing, typography } from '../../styles/theme';

import type { RequestStackParamList } from '@/navigation/RequestStackNavigator';
import { getApiClient, mockApiClient } from '@/services/api/mock';
import type { MatchRequest, Student } from '@/services/api/types';

type RequestDetailRoute = RouteProp<RequestStackParamList, 'MatchRequestDetail'>;

export default function MatchRequestDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RequestDetailRoute>();
  const [request, setRequest] = useState<MatchRequest | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRequest = useCallback(async () => {
    try {
      setIsLoading(true);
      const api = getApiClient() as typeof mockApiClient;
      const response = await api.tutor.getMatchRequests();
      if (!response.success) {
        throw new Error(response.error || '申請の取得に失敗しました。');
      }
      const found = response.data.find((item: MatchRequest) => item.id === route.params.requestId);
      if (!found) {
        throw new Error('指定された申請が見つかりませんでした。');
      }
      setRequest(found);
      const studentResponse = await api.student.getProfile(found.student_id);
      if (studentResponse.success) {
        setStudent(studentResponse.data);
      } else {
        setStudent(null);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'エラー',
        error instanceof Error ? error.message : '申請情報の取得に失敗しました。',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } finally {
      setIsLoading(false);
    }
  }, [navigation, route.params.requestId]);

  useFocusEffect(
    useCallback(() => {
      loadRequest().catch(() => {});
    }, [loadRequest]),
  );

  const handleApprove = useCallback(() => {
    if (!request) return;
    Alert.alert('申請を承認', `${student?.name ?? '後輩'}さんの申請を承認しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '承認する',
        onPress: async () => {
          try {
            setIsProcessing(true);
            const api = getApiClient() as typeof mockApiClient;
            const response = await api.tutor.approveMatchRequest(request.id);
            if (response.success) {
              setRequest(response.data);
              Alert.alert('承認完了', '申請を承認しました。', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } else {
              Alert.alert('エラー', response.error || '承認処理に失敗しました。');
            }
          } catch {
            Alert.alert('エラー', '承認処理中に問題が発生しました。');
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  }, [navigation, request, student?.name]);

  const handleReject = useCallback(() => {
    if (!request) return;
    Alert.alert('申請を拒否', `${student?.name ?? '後輩'}さんの申請を拒否しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '拒否する',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsProcessing(true);
            const api = getApiClient() as typeof mockApiClient;
            const response = await api.tutor.rejectMatchRequest(request.id);
            if (response.success) {
              setRequest(response.data);
              Alert.alert('拒否完了', '申請を拒否しました。', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } else {
              Alert.alert('エラー', response.error || '拒否処理に失敗しました。');
            }
          } catch {
            Alert.alert('エラー', '拒否処理中に問題が発生しました。');
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  }, [navigation, request, student?.name]);

  const formattedDate = useMemo(() => {
    if (!request) return '';
    const date = new Date(request.created_at);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [request]);

  const statusMeta = useMemo(() => {
    if (!request) return { label: '', color: colors.gray500 };
    switch (request.status) {
      case 'pending':
        return { label: '承認待ち', color: colors.warning };
      case 'approved':
        return { label: '承認済み', color: colors.success };
      case 'rejected':
        return { label: '拒否', color: colors.error };
      case 'cancelled':
        return { label: 'キャンセル', color: colors.gray500 };
      case 'expired':
        return { label: '期限切れ', color: colors.gray400 };
      default:
        return { label: request.status, color: colors.gray500 };
    }
  }, [request]);

  if (isLoading) {
    return (
      <StandardScreen title="申請詳細" showBackButton>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </StandardScreen>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <StandardScreen title="申請詳細" showBackButton>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.studentName}>{student?.name ?? '不明な後輩'}</Text>
              <Text style={styles.studentMeta}>{student?.grade}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusMeta.color + '20' }]}>
              <Text style={[styles.statusText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>
          <Text style={styles.metaText}>申請ID: {request.id}</Text>
          <Text style={styles.date}>申請日: {formattedDate}</Text>
          <Text style={styles.date}>必要コイン: {request.coin_cost}コイン</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>メッセージ</Text>
          <Text style={styles.messageText}>{request.message}</Text>
        </View>

        {request.schedule_note && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>希望スケジュール</Text>
            <Text style={styles.scheduleText}>{request.schedule_note}</Text>
          </View>
        )}

        {request.status === 'pending' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.approveButton, isProcessing && styles.disabledButton]}
              onPress={handleApprove}
              disabled={isProcessing}
            >
              <Text style={styles.approveButtonText}>
                {isProcessing ? '処理中...' : '承認する'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectButton, isProcessing && styles.disabledButton]}
              onPress={handleReject}
              disabled={isProcessing}
            >
              <Text style={styles.rejectButtonText}>拒否する</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </StandardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  studentName: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  studentMeta: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
  },
  date: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginTop: spacing.xs / 2,
  },
  metaText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  messageText: {
    fontSize: typography.sizes?.body || 14,
    color: colors.gray700,
    lineHeight: 22,
  },
  scheduleText: {
    fontSize: typography.sizes?.body || 14,
    color: colors.gray700,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  approveButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: colors.white,
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: colors.white,
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
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
});
