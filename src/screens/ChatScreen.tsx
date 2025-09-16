import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';

import { colors, spacing, typography } from '../styles/theme';

import ScreenContainer from '@/components/common/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { getApiClient } from '@/services/api/mock';
import type {
  Student,
  Tutor,
  ChatRoom,
  Message,
  MessageStatus as _MessageStatus,
} from '@/services/api/types';
// ルーム・メッセージの型は API の型を使用するためローカル定義は削除

// モックチャットルームデータは不使用。APIから取得します。

// ナビゲーション用の型定義
type ChatStackParamList = {
  ChatMain: undefined;
  ChatDetail: {
    chatRoomId: string;
    tutorId: string;
  };
};

type ChatScreenNavigationProp = StackNavigationProp<ChatStackParamList, 'ChatMain'>;

type Props = {
  navigation: ChatScreenNavigationProp;
};

export default function ChatScreen({ navigation }: Props) {
  const [chatRooms, setChatRooms] = useState<(ChatRoom & { lastMessage?: Message })[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const api = React.useMemo(() => getApiClient(), []);
  const { student: authStudent, user: authUser } = useAuth();

  const loadChatRooms = useCallback(
    async (studentId: string) => {
      const resp = await api.chat.getChatRooms(studentId);
      if (resp.success) {
        const rooms = resp.data.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        setChatRooms(rooms);
      }
    },
    [api],
  );

  useEffect(() => {
    let mounted = true;
    const studentId = authStudent?.id ?? authUser?.id;
    if (!studentId) {
      setCurrentStudent(null);
      return () => {
        mounted = false;
        if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      };
    }
    Promise.all([
      api.student.getProfile(studentId),
      api.student.searchTutors(undefined, 1, 200),
    ]).then(async ([profileResp, tutorsResp]) => {
      if (!mounted) return;
      if (profileResp?.success) {
        setCurrentStudent(profileResp.data);
        await loadChatRooms(profileResp.data.id);
      } else if (authStudent) {
        setCurrentStudent(authStudent);
        await loadChatRooms(authStudent.id);
      }
      if (tutorsResp?.success) setTutors(tutorsResp.data);
    });
    return () => {
      mounted = false;
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [api, authStudent, authUser?.id, loadChatRooms]);

  useFocusEffect(
    useCallback(() => {
      if (currentStudent) loadChatRooms(currentStudent.id);
    }, [currentStudent, loadChatRooms]),
  );

  const handleRefresh = useCallback(() => {
    if (!currentStudent) return;
    setIsRefreshing(true);
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(async () => {
      await loadChatRooms(currentStudent.id);
      setIsRefreshing(false);
    }, 800);
  }, [currentStudent, loadChatRooms]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨日';
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
    }
  };

  const renderChatRoom = ({ item }: { item: ChatRoom & { lastMessage?: Message } }) => {
    const tutor = tutors.find((t) => t.id === item.tutorId);
    if (!tutor) return null;

    const last = item.lastMessage;
    const isOwnMessage = last?.senderId === (currentStudent?.id ?? '');
    const hasNewMessage = !!last && !isOwnMessage && last.status !== 'read';

    return (
      <TouchableOpacity
        style={[styles.chatRoomItem, hasNewMessage && styles.chatRoomItemUnread]}
        onPress={() => {
          navigation.navigate('ChatDetail', {
            chatRoomId: item.id,
            tutorId: item.tutorId,
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {tutor.avatar_url ? (
            <Image source={{ uri: tutor.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={24} color={colors.gray400} />
            </View>
          )}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.tutorName, hasNewMessage && styles.tutorNameUnread]}>
              {tutor.name}
            </Text>
            <View style={styles.timestampContainer}>
              <Text style={[styles.timestamp, hasNewMessage && styles.timestampUnread]}>
                {last ? formatTime(new Date(last.timestamp)) : ''}
              </Text>
            </View>
          </View>

          <View style={styles.messageRow}>
            <Text
              style={[styles.lastMessage, hasNewMessage && styles.lastMessageUnread]}
              numberOfLines={2}
            >
              {last
                ? last.text.length <= 60
                  ? last.text
                  : last.text.slice(0, 60) + '...'
                : 'メッセージなし'}
            </Text>
            {hasNewMessage && <View style={styles.newMessageDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer
      withScroll={false}
      contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
    >
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>チャット</Text>
      </View>

      {/* チャットリスト */}
      {chatRooms.length > 0 ? (
        <FlatList
          data={chatRooms}
          renderItem={renderChatRoom}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={64} color={colors.gray300} />
          <Text style={styles.emptyTitle}>まだチャットがありません</Text>
          <Text style={styles.emptySubtitle}>先輩とマッチングしてメッセージを始めましょう</Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  chatRoomItemUnread: {
    backgroundColor: colors.primary + '05',
    borderBottomColor: colors.primary + '10',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    height: 56,
  },
  title: {
    fontSize: typography.fontSizes?.lg || 18,
    fontWeight: typography.fontWeights?.semibold || '600',
    color: colors.gray900,
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  chatRoomItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gray200,
  },
  onlineIndicator: {
    // removed; replaced by onlineTagSmall
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
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
  tutorNameUnread: {
    color: colors.gray900,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  timestampUnread: {
    color: colors.primary,
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    lineHeight: 18,
  },
  lastMessageUnread: {
    color: colors.gray900,
    fontWeight: '500',
  },
  newMessageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
