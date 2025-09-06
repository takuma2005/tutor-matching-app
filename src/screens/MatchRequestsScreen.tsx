import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiClient } from '@/services/api/mock';
import type { MatchRequest, Tutor } from '@/services/api/types';
import { colors, spacing, typography, borderRadius } from '@/styles/theme';

export default function MatchRequestsScreen() {
  const [matchRequests, setMatchRequests] = useState<(MatchRequest & { tutor?: Tutor })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  const loadMatchRequests = useCallback(async () => {
    try {
      const api = getApiClient();
      const status = activeTab === 'pending' ? 'pending' : undefined;
      const response = await api.student.getMatchRequests(status);

      if (response.success) {
        // 家庭教師情報を取得
        const tutorsResponse = await api.student.searchTutors(undefined, 1, 100);
        const tutors = tutorsResponse.success ? tutorsResponse.data : [];

        const requestsWithTutors = response.data.map((request) => ({
          ...request,
          tutor: tutors.find((t) => t.id === request.tutor_id),
        }));

        setMatchRequests(requestsWithTutors);
      }
    } catch (error) {
      console.error('Failed to load match requests:', error);
      Alert.alert('エラー', 'マッチング申請の読み込みに失敗しました。');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadMatchRequests();
    }, [loadMatchRequests]),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMatchRequests();
  };

  const handleCancelRequest = (matchId: string, tutorName: string) => {
    Alert.alert(
      '申請をキャンセル',
      `${tutorName}さんへのマッチング申請をキャンセルしますか？\n\n支払ったコインは返金されます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '申請をキャンセル',
          style: 'destructive',
          onPress: async () => {
            try {
              const api = getApiClient();
              const response = await api.student.cancelMatchRequest(matchId);

              if (response.success) {
                Alert.alert('キャンセル完了', 'マッチング申請をキャンセルしました。');
                loadMatchRequests();
              } else {
                Alert.alert('エラー', response.error || 'キャンセルに失敗しました。');
              }
            } catch (error) {
              Alert.alert('エラー', 'ネットワークエラーが発生しました。');
            }
          },
        },
      ],
    );
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '承認待ち';
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '拒否';
      case 'cancelled':
        return 'キャンセル';
      case 'expired':
        return '期限切れ';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'cancelled':
        return colors.gray500;
      case 'expired':
        return colors.gray400;
      default:
        return colors.gray500;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderMatchRequest = ({ item }: { item: MatchRequest & { tutor?: Tutor } }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.tutorInfo}>
          <Text style={styles.tutorName}>{item.tutor?.name || '不明な先輩'}</Text>
          <Text style={styles.tutorSchool}>
            {item.tutor?.school} {item.tutor?.grade}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.requestMessage} numberOfLines={2}>
        {item.message}
      </Text>

      <View style={styles.requestFooter}>
        <View style={styles.requestMeta}>
          <Text style={styles.metaText}>申請日: {formatDate(item.created_at)}</Text>
          <Text style={styles.metaText}>{item.coin_cost}コイン</Text>
        </View>

        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelRequest(item.id, item.tutor?.name || '先輩')}
          >
            <Text style={styles.cancelButtonText}>キャンセル</Text>
          </TouchableOpacity>
        )}
      </View>

      {item.expires_at && item.status === 'pending' && (
        <Text style={styles.expiryText}>期限: {formatDate(item.expires_at)}</Text>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="inbox" size={48} color={colors.gray400} />
      <Text style={styles.emptyTitle}>
        {activeTab === 'pending' ? '承認待ちの申請はありません' : '申請履歴はありません'}
      </Text>
      <Text style={styles.emptyDescription}>
        {activeTab === 'pending'
          ? '先輩に申請を送ると、ここに表示されます。'
          : 'マッチング申請を行うと、ここに履歴が表示されます。'}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>マッチング申請</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>マッチング申請</Text>
      </View>

      {/* タブ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            承認待ち
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>すべて</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={matchRequests}
        renderItem={renderMatchRequest}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: typography.sizes?.h2 || 24,
    fontWeight: '700',
    color: colors.gray900,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  requestCard: {
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
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tutorInfo: {
    flex: 1,
  },
  tutorName: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  tutorSchool: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full || 999,
  },
  statusText: {
    fontSize: typography.sizes?.caption || 12,
    fontWeight: '600',
  },
  requestMessage: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray700,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestMeta: {
    flex: 1,
  },
  metaText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    marginBottom: 2,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  cancelButtonText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.error,
    fontWeight: '500',
  },
  expiryText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.warning,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray700,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray500,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
});
