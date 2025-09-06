import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { getApiClient } from '@/services/api/mock';
import type { Student, Tutor } from '@/services/api/types';

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
};

type ChatRoom = {
  id: string;
  tutorId: string;
  studentId: string;
  lastMessage?: Message;
  updatedAt: Date;
};

// モックチャットルームデータ
const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    tutorId: 'tutor_1',
    studentId: 'student_1',
    lastMessage: {
      id: 'msg_1',
      senderId: 'tutor_1',
      text: 'こんにちは！数学の授業、明日の3時からでいかがでしょうか？',
      timestamp: new Date('2024-01-15T10:30:00'),
      isRead: false,
    },
    updatedAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2',
    tutorId: 'tutor_2',
    studentId: 'student_1',
    lastMessage: {
      id: 'msg_2',
      senderId: 'student_1',
      text: '英語の文法でわからないところがあります。教えていただけますか？',
      timestamp: new Date('2024-01-14T15:45:00'),
      isRead: true,
    },
    updatedAt: new Date('2024-01-14T15:45:00'),
  },
  {
    id: '3',
    tutorId: 'tutor_3',
    studentId: 'student_1',
    lastMessage: {
      id: 'msg_3',
      senderId: 'tutor_3',
      text: 'お疲れさまでした！今日の授業、いかがでしたか？',
      timestamp: new Date('2024-01-13T18:20:00'),
      isRead: true,
    },
    updatedAt: new Date('2024-01-13T18:20:00'),
  },
];

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
  const [chatRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);

  React.useEffect(() => {
    const api = getApiClient();
    let mounted = true;
    Promise.all([
      api.student.getProfile('student-1'),
      api.student.searchTutors(undefined, 1, 200),
    ]).then(([profileResp, tutorsResp]) => {
      if (!mounted) return;
      if (profileResp?.success) setCurrentStudent(profileResp.data);
      if (tutorsResp?.success) setTutors(tutorsResp.data);
    });
    return () => {
      mounted = false;
    };
  }, []);

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

  const renderChatRoom = ({ item }: { item: ChatRoom }) => {
    const tutor = tutors.find((t) => t.id === item.tutorId);
    if (!tutor) return null;

    const isUnread =
      item.lastMessage &&
      !item.lastMessage.isRead &&
      item.lastMessage.senderId !== (currentStudent?.id ?? '');

    return (
      <TouchableOpacity
        style={styles.chatRoomItem}
        onPress={() => {
          navigation.navigate('ChatDetail', {
            chatRoomId: item.id,
            tutorId: item.tutorId,
          });
        }}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={24} color={colors.gray400} />
          </View>
          {tutor.online_available && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.tutorName}>{tutor.name}</Text>
            <Text style={styles.timestamp}>
              {item.lastMessage ? formatTime(item.lastMessage.timestamp) : ''}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text style={[styles.lastMessage, isUnread && styles.unreadMessage]} numberOfLines={2}>
              {item.lastMessage?.text || 'メッセージなし'}
            </Text>
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>NEW</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>チャット</Text>
        <TouchableOpacity style={styles.searchButton}>
          <MaterialIcons name="search" size={24} color={colors.gray600} />
        </TouchableOpacity>
      </View>

      {/* チャットリスト */}
      {chatRooms.length > 0 ? (
        <FlatList
          data={chatRooms.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())}
          renderItem={renderChatRoom}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={64} color={colors.gray300} />
          <Text style={styles.emptyTitle}>まだチャットがありません</Text>
          <Text style={styles.emptySubtitle}>先輩とマッチングしてメッセージを始めましょう</Text>
        </View>
      )}
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
  title: {
    fontSize: typography.sizes?.h2 || 24,
    fontWeight: '700',
    color: colors.gray900,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
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
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
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
  timestamp: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
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
  unreadMessage: {
    color: colors.gray900,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full || 999,
    marginLeft: spacing.sm,
  },
  unreadBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
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
