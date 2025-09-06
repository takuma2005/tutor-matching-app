import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { ComponentProps } from 'react';
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography, borderRadius } from '../styles/theme';

import type { Notification, NotificationType } from '@/services/api/mock/notificationService';
import { MockNotificationService } from '@/services/api/mock/notificationService';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

// 通知サービスから型をインポート
type LocalNotification = Notification & {
  timestamp: Date;
  actionRequired?: boolean;
};

// モック通知データ
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'lesson_request',
    title: '授業申請',
    message: '田中先輩から数学の授業申請が届いています。',
    timestamp: new Date('2024-01-15T14:30:00'),
    isRead: false,
    actionRequired: true,
  },
  {
    id: '2',
    type: 'lesson_confirmed',
    title: '授業確定',
    message: '明日14:00からの英語の授業が確定しました。',
    timestamp: new Date('2024-01-15T10:15:00'),
    isRead: false,
  },
  {
    id: '3',
    type: 'message',
    title: '新しいメッセージ',
    message: '山田先輩からメッセージが届きました。',
    timestamp: new Date('2024-01-14T16:45:00'),
    isRead: true,
  },
  {
    id: '4',
    type: 'lesson_reminder',
    title: '授業リマインダー',
    message: '1時間後に物理の授業があります。準備はお済みですか？',
    timestamp: new Date('2024-01-13T13:00:00'),
    isRead: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'システム通知',
    message: 'アプリが最新バージョンに更新されました。',
    timestamp: new Date('2024-01-12T09:00:00'),
    isRead: true,
  },
];

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const notificationService = useMemo(() => new MockNotificationService(), []);

  const loadNotifications = useCallback(async () => {
    try {
      // 現在は学生 ID をハードコード
      const response = await notificationService.getUserNotifications('student-1');

      if (response.success) {
        const transformedNotifications: LocalNotification[] = response.data.map((n) => ({
          ...n,
          timestamp: new Date(n.created_at),
          isRead: n.is_read,
          actionRequired: ['match_request_received', 'lesson_request_received'].includes(n.type),
        }));

        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [notificationService]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadNotifications();
    }, [loadNotifications]),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadNotifications();
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'match_request_received':
      case 'match_request_approved':
      case 'match_request_rejected':
        return 'person-add';
      case 'lesson_request_received':
      case 'lesson_request_approved':
      case 'lesson_request_rejected':
        return 'school';
      case 'lesson_started':
      case 'lesson_completed':
        return 'event-available';
      case 'message_received':
        return 'message';
      case 'payment_received':
        return 'monetization-on';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'match_request_received':
        return colors.warning;
      case 'match_request_approved':
        return colors.success;
      case 'match_request_rejected':
        return colors.error;
      case 'lesson_request_received':
        return colors.warning;
      case 'lesson_request_approved':
        return colors.success;
      case 'lesson_request_rejected':
        return colors.error;
      case 'lesson_started':
      case 'lesson_completed':
        return colors.primary;
      case 'message_received':
        return colors.info;
      case 'payment_received':
        return colors.success;
      default:
        return colors.gray400;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diff / (1000 * 60));
      return `${diffMinutes}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else if (diffDays === 1) {
      return '昨日';
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return timestamp.toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
      });
    }
  };

  const handleNotificationPress = async (notification: LocalNotification) => {
    // 未読の場合は既読にする
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // 通知タイプに応じて適切な画面に遷移
    // TODO: ナビゲーション実装
    switch (notification.type) {
      case 'match_request_received':
      case 'match_request_approved':
        // マッチング申請画面へ遷移
        break;
      case 'lesson_request_received':
      case 'lesson_request_approved':
        // 授業管理画面へ遷移
        break;
      case 'message_received':
        // チャット画面へ遷移
        break;
      default:
        break;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead('student-1');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const addDemoNotifications = async () => {
    try {
      await Promise.all([
        notificationService.createNotification(
          'student-1',
          'message_received',
          '新着メッセージ',
          'テスト本文',
        ),
        notificationService.createNotification(
          'student-1',
          'match_request_received',
          'マッチング申請',
          '田中先輩からの申請が届きました',
        ),
        notificationService.createNotification(
          'student-1',
          'lesson_request_approved',
          '授業申請承認',
          '英語の授業が承認されました',
        ),
        notificationService.createNotification(
          'student-1',
          'payment_received',
          '入金',
          'コインの入金が反映されました',
        ),
      ]);
      loadNotifications();
    } catch (error) {
      console.error('Failed to create demo notifications:', error);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconBackground,
              { backgroundColor: getNotificationColor(item.type) + '20' },
            ]}
          >
            <MaterialIcons
              name={getNotificationIcon(item.type) as MaterialIconName}
              size={20}
              color={getNotificationColor(item.type)}
            />
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
              {item.title}
            </Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
          <Text style={[styles.message, !item.isRead && styles.unreadMessage]} numberOfLines={2}>
            {item.message}
          </Text>
          {item.actionRequired && (
            <View style={styles.actionBadge}>
              <Text style={styles.actionText}>要対応</Text>
            </View>
          )}
        </View>
      </View>

      <MaterialIcons name="chevron-right" size={20} color={colors.gray400} />
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>通知</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {__DEV__ && (
            <TouchableOpacity style={styles.demoButton} onPress={addDemoNotifications}>
              <Text style={styles.demoText}>デモ追加</Text>
            </TouchableOpacity>
          )}
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
              <Text style={styles.markAllText}>すべて既読</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 通知リスト */}
      <FlatList
        data={[...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={64} color={colors.gray300} />
            <Text style={styles.emptyTitle}>通知はありません</Text>
            <Text style={styles.emptySubtitle}>新しい通知が届くとここに表示されます</Text>
          </View>
        }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes?.h2 || 24,
    fontWeight: '700',
    color: colors.gray900,
    marginRight: spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full || 999,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  unreadBadgeText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '700',
  },
  markAllButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  markAllText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.primary,
    fontWeight: '500',
  },
  demoText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  unreadNotification: {
    backgroundColor: colors.primary + '05',
  },
  notificationContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '500',
    color: colors.gray700,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadTitle: {
    fontWeight: '600',
    color: colors.gray900,
  },
  timestamp: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
  },
  message: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    lineHeight: 18,
  },
  unreadMessage: {
    color: colors.gray700,
  },
  actionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  actionText: {
    fontSize: 10,
    color: colors.warning,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray600,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
  },
});
