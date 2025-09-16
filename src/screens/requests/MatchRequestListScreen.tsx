import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
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

import { StandardScreen } from '../../components/templates';
import { colors, spacing, typography } from '../../styles/theme';

import type { RequestStackParamList } from '@/navigation/RequestStackNavigator';
import { getApiClient, mockApiClient } from '@/services/api/mock';
import type { MatchRequest, Student } from '@/services/api/types';

type EnrichedRequest = MatchRequest & { student?: Student };

export default function MatchRequestListScreen() {
  const navigation = useNavigation<StackNavigationProp<RequestStackParamList>>();
  const [requests, setRequests] = useState<EnrichedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const api = getApiClient() as typeof mockApiClient;
      const response = await api.tutor.getMatchRequests();

      if (!response.success) {
        throw new Error(response.error || '申請の取得に失敗しました。');
      }

      const uniqueStudentIds = Array.from(
        new Set<string>(response.data.map((req: MatchRequest) => req.student_id)),
      );
      const studentResponses = await Promise.all(
        uniqueStudentIds.map(async (id: string) => ({ id, res: await api.student.getProfile(id) })),
      );

      const studentMap = new Map<string, Student>();
      studentResponses.forEach(({ id, res }) => {
        if (res.success) {
          studentMap.set(id, res.data);
        }
      });

      setRequests(
        response.data.map((req: MatchRequest) => ({
          ...req,
          student: studentMap.get(req.student_id),
        })),
      );
    } catch (error) {
      console.error(error);
      Alert.alert('エラー', error instanceof Error ? error.message : '申請の取得に失敗しました。');
      setRequests([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRequests().catch(() => {});
    }, [loadRequests]),
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadRequests().catch(() => {});
  }, [loadRequests]);

  const getStatusMeta = useCallback((status: MatchRequest['status']) => {
    switch (status) {
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
        return { label: status, color: colors.gray500 };
    }
  }, []);

  const sortedRequests = useMemo(
    () =>
      [...requests].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [requests],
  );

  const renderRequest = useCallback(
    ({ item }: { item: EnrichedRequest }) => {
      const statusMeta = getStatusMeta(item.status);
      const createdAt = new Date(item.created_at);
      return (
        <TouchableOpacity
          style={styles.requestCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('MatchRequestDetail', { requestId: item.id })}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.studentName}>{item.student?.name || '不明な後輩'}</Text>
              <Text style={styles.subject}>{item.student?.grade}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusMeta.color + '20' }]}>
              <Text style={[styles.statusText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              申請日:{' '}
              {`${createdAt.getMonth() + 1}/${createdAt.getDate()} ${createdAt
                .getHours()
                .toString()
                .padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`}
            </Text>
            <Text style={styles.metaText}>{item.coin_cost}コイン</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [getStatusMeta, navigation],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>申請はまだありません</Text>
        <Text style={styles.emptyDescription}>後輩からの申請が届くとここに表示されます。</Text>
      </View>
    );
  }, [isLoading]);

  return (
    <StandardScreen title="申請管理" showBackButton={false}>
      {isLoading && !isRefreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sortedRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequest}
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
  requestCard: {
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
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  subject: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    marginTop: spacing.xs / 2,
  },
  message: {
    fontSize: typography.sizes?.body || 14,
    color: colors.gray700,
    lineHeight: 20,
    marginBottom: spacing.md,
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
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
