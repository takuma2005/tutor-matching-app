import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ComponentProps } from 'react';
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';

import { colors, spacing, typography, borderRadius } from '../styles/theme';

import Card from '@/components/common/Card';
import ScreenContainer from '@/components/common/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import type { HomeStackParamList } from '@/navigation/HomeStackNavigator';
import type { Notification, NotificationType } from '@/services/api/mock/notificationService';
import { MockNotificationService } from '@/services/api/mock/notificationService';
import { mockRealtimeService } from '@/services/api/mock/realtimeService';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

// 通知サービスから型をインポート
type LocalNotification = Notification & {
  timestamp: Date;
  actionRequired?: boolean;
};

export default function NotificationScreen() {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList, 'Notification'>>();
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationService = useMemo(() => new MockNotificationService(), []);
  const { user: authUser, role } = useAuth();
  const userId = authUser?.id;

  const loadNotifications = useCallback(async () => {
    try {
      if (!userId) return;
      const [listRes, unreadRes] = await Promise.all([
        notificationService.getUserNotifications(userId),
        notificationService.getUnreadCount(userId),
      ]);

      if (listRes.success) {
        const transformedNotifications: LocalNotification[] = listRes.data.map((n) => ({
          ...n,
          timestamp: new Date(n.created_at),
          actionRequired: ['match_request_received', 'lesson_request_received'].includes(n.type),
        }));
        setNotifications(transformedNotifications);
      }

      if (unreadRes.success) {
        setUnreadCount(unreadRes.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [notificationService, userId]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      // Realtime 購読（新着通知）
      const unsubscribe = userId
        ? mockRealtimeService.subscribeToUserNotifications(userId, () => {
            // 新規通知が来たらリストと未読数を更新
            loadNotifications();
          })
        : () => {};
      return () => unsubscribe();
    }, [loadNotifications, userId]),
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
      case 'match_request_cancelled':
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
      case 'match_request_cancelled':
        return colors.info;
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
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    const parentNavigation = navigation.getParent<NavigationProp<ParamListBase>>();
    const navigateToTab = (route: string, params?: object) => {
      if (parentNavigation) {
        (parentNavigation as unknown as { navigate: (r: string, p?: object) => void }).navigate(
          route,
          params,
        );
      }
    };

    switch (notification.type) {
      case 'match_request_received':
        if (role === 'tutor') {
          if (notification.related_id) {
            navigateToTab('Requests', {
              screen: 'MatchRequestDetail',
              params: { requestId: notification.related_id },
            });
          } else {
            navigateToTab('Requests', { screen: 'MatchRequestList' });
          }
        } else {
          navigateToTab('MyPage', { screen: 'MatchRequests' });
        }
        break;
      case 'match_request_approved':
      case 'match_request_rejected':
      case 'match_request_cancelled':
        navigateToTab('MyPage', { screen: 'MatchRequests' });
        break;
      case 'lesson_request_received':
        if (role === 'tutor') {
          navigateToTab('Lesson', { screen: 'TutorLessonList' });
        } else {
          navigateToTab('Lesson', { screen: 'StudentLessonList' });
        }
        break;
      case 'lesson_request_approved':
      case 'lesson_request_rejected':
      case 'lesson_started':
      case 'lesson_completed':
        if (role === 'tutor') {
          navigateToTab('Lesson', { screen: 'TutorLessonList' });
        } else {
          navigateToTab('Lesson', { screen: 'StudentLessonList' });
        }
        break;
      case 'payment_received':
        navigateToTab('Lesson', { screen: 'TutorLessonList' });
        break;
      case 'message_received':
        navigateToTab('Chat', { screen: 'ChatMain' });
        break;
      default:
        break;
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!userId) return;
      await notificationService.markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const addDemoNotifications = async () => {
    try {
      if (!userId) return;
      await Promise.all([
        notificationService.createNotification(
          userId,
          'message_received',
          '新着メッセージ',
          'テスト本文',
        ),
        notificationService.createNotification(
          userId,
          'match_request_received',
          'マッチング申請',
          '田中先輩からの申請が届きました',
        ),
        notificationService.createNotification(
          userId,
          'lesson_request_approved',
          '授業申請承認',
          '英語の授業が承認されました',
        ),
        notificationService.createNotification(
          userId,
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

  const renderNotification = ({ item }: { item: LocalNotification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.is_read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      {/* 左上：種類アイコン */}
      <View style={styles.typeIconWrapper}>
        <MaterialIcons
          name={getNotificationIcon(item.type) as MaterialIconName}
          size={20}
          color={getNotificationColor(item.type)}
        />
      </View>

      {/* 中央：人物アイコンとその下にテキスト */}
      <View style={styles.contentArea}>
        <View style={styles.avatarCircle}>
          <Image
            source={{
              uri: item.message.includes('田中')
                ? 'https://randomuser.me/api/portraits/men/1.jpg'
                : item.message.includes('佐藤')
                  ? 'https://randomuser.me/api/portraits/women/2.jpg'
                  : item.message.includes('高橋')
                    ? 'https://randomuser.me/api/portraits/men/3.jpg'
                    : item.message.includes('中村')
                      ? 'https://randomuser.me/api/portraits/women/4.jpg'
                      : item.message.includes('山田')
                        ? 'https://randomuser.me/api/portraits/men/5.jpg'
                        : 'https://randomuser.me/api/portraits/men/6.jpg',
            }}
            style={styles.avatarImage}
            defaultSource={{
              uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            }}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.message, !item.is_read && styles.unreadMessage]}>
            {item.message}
          </Text>
          {item.actionRequired && (
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>要対応</Text>
            </View>
          )}
        </View>
      </View>

      {/* 右上：時刻 */}
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
    </TouchableOpacity>
  );

  // パフォーマンス最適化用のメモ化
  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [notifications],
  );

  return (
    <ScreenContainer
      withScroll={false}
      contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
    >
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
          {userId && unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
              <Text style={styles.markAllText}>すべて既読</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 通知リスト */}
      <FlatList
        data={sortedNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={100}
        initialNumToRender={10}
        windowSize={10}
        ListEmptyComponent={
          <Card style={{ alignItems: 'center' }}>
            <MaterialIcons name="notifications-none" size={64} color={colors.gray300} />
            <Text style={styles.emptyTitle}>通知はありません</Text>
            <Text style={styles.emptySubtitle}>新しい通知が届くとここに表示されます</Text>
          </Card>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
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
  demoButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  demoText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: spacing.xs,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    position: 'relative',
    backgroundColor: colors.white,
  },
  unreadNotification: {
    backgroundColor: colors.primary + '15',
  },
  contentArea: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: spacing.sm,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.xl,
    marginTop: spacing.xs + 2, // アイコンとの隙間を2px追加
    justifyContent: 'center',
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  typeIconWrapper: {
    position: 'relative',
    marginTop: 2,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  unreadDot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  notificationTitle: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.gray900,
    flexShrink: 1,
    marginRight: spacing.xs,
  },
  unreadTitle: {
    fontWeight: '600',
    color: colors.gray900,
  },
  timestamp: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
  },
  messageWrapper: {
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  message: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray700,
    lineHeight: 20,
  },
  unreadMessage: {
    color: colors.gray700,
  },
  titleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginTop: 2,
  },
  actionBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full || 12,
    alignSelf: 'flex-start',
    marginTop: spacing.xs / 2,
    minHeight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadgeText: {
    fontSize: 10,
    color: colors.warning,
    fontWeight: '700',
    textAlign: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
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
