import { MaterialIcons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ChatStackParamList } from '../navigation/ChatStackNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { getApiClient } from '@/services/api/mock';
import type { Tutor, Student } from '@/services/api/types';

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
};

type Props = StackScreenProps<ChatStackParamList, 'ChatDetail'>;

// モックメッセージデータ
const mockMessages: Message[] = [
  {
    id: 'msg_1',
    senderId: 'tutor_1',
    text: 'こんにちは！数学の授業について相談したいとのことですが、どの分野でお困りでしょうか？',
    timestamp: new Date('2024-01-15T10:00:00'),
    isRead: true,
  },
  {
    id: 'msg_2',
    senderId: 'student_1',
    text: '微分積分でつまずいています。特に部分積分が理解できなくて...',
    timestamp: new Date('2024-01-15T10:05:00'),
    isRead: true,
  },
  {
    id: 'msg_3',
    senderId: 'tutor_1',
    text: '部分積分は確かに難しいところですね。まずは基本的な公式から確認しましょう。今度の土曜日の午後はいかがですか？',
    timestamp: new Date('2024-01-15T10:10:00'),
    isRead: true,
  },
  {
    id: 'msg_4',
    senderId: 'student_1',
    text: '土曜日の午後で大丈夫です！何時頃がよろしいでしょうか？',
    timestamp: new Date('2024-01-15T10:12:00'),
    isRead: true,
  },
  {
    id: 'msg_5',
    senderId: 'tutor_1',
    text: '2時からはいかがでしょうか？約2時間程度を予定しています。',
    timestamp: new Date('2024-01-15T10:30:00'),
    isRead: false,
  },
];

export default function ChatDetailScreen({ route, navigation }: Props) {
  const { tutorId } = route.params;
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [tutor, setTutor] = useState<Tutor | undefined>(undefined);

  React.useEffect(() => {
    const api = getApiClient();
    let mounted = true;
    Promise.all([
      api.student.getProfile('student-1'),
      api.student.searchTutors(undefined, 1, 200),
    ]).then(([profileResp, tutorsResp]) => {
      if (!mounted) return;
      if (profileResp?.success) setCurrentStudent(profileResp.data);
      if (tutorsResp?.success) {
        const found = tutorsResp.data.find((t) => t.id === tutorId);
        setTutor(found);
      }
    });
    return () => {
      mounted = false;
    };
  }, [tutorId]);

  useEffect(() => {
    // 画面に入ったら最新メッセージまでスクロール
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  if (!tutor) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>チャットが見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSendMessage = () => {
    if (inputText.trim() === '' || isLoading) return;
    if (!currentStudent) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentStudent.id,
      text: inputText.trim(),
      timestamp: new Date(),
      isRead: false,
    };

    setIsLoading(true);

    // メッセージ送信シミュレート
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // 送信完了後、最新メッセージまでスクロール
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
      setIsLoading(false);
    }, 500);
  };

  const handleLessonRequest = () => {
    Alert.alert('授業を申請', '先輩に授業を申請しますか？日時と詳細を設定できます。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '申請する',
        onPress: () => {
          // TODO: 授業申請画面への遷移
          Alert.alert('実装予定', '授業申請機能は次のアップデートで利用可能になります。', [
            { text: 'OK' },
          ]);
        },
      },
    ]);
  };

  const formatMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === (currentStudent?.id ?? '');
    const showTimestamp =
      index === 0 ||
      messages[index - 1]?.senderId !== item.senderId ||
      item.timestamp.getTime() - messages[index - 1]?.timestamp.getTime() > 5 * 60 * 1000; // 5分以上間隔

    return (
      <View style={styles.messageContainer}>
        <View
          style={[styles.messageBubble, isOwnMessage ? styles.ownMessage : styles.otherMessage]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
          {showTimestamp && (
            <Text
              style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
              ]}
            >
              {formatMessageTime(item.timestamp)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.tutorInfo}>
            <View style={styles.headerAvatar}>
              <MaterialIcons name="person" size={20} color={colors.gray400} />
              {tutor.online_available && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.tutorDetails}>
              <Text style={styles.tutorName}>{tutor.name}</Text>
              <Text style={styles.tutorStatus}>
                {tutor.online_available ? 'オンライン' : '最終ログイン: 2時間前'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.lessonButton} onPress={handleLessonRequest}>
          <MaterialIcons name="school" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* メッセージリスト */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* 入力エリア */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="メッセージを入力..."
              placeholderTextColor={colors.gray400}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (inputText.trim() === '' || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={inputText.trim() === '' || isLoading}
            >
              <MaterialIcons
                name="send"
                size={20}
                color={inputText.trim() === '' || isLoading ? colors.gray400 : colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  tutorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  tutorDetails: {
    flex: 1,
  },
  tutorName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray900,
    marginBottom: 2,
  },
  tutorStatus: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray500,
  },
  lessonButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '20',
  },
  content: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray600,
    textAlign: 'center',
  },
  messageContainer: {
    marginVertical: spacing.xs / 2,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  ownMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: spacing.xs,
  },
  otherMessage: {
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  messageText: {
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
  },
  ownMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.gray900,
  },
  messageTime: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xs / 2,
  },
  ownMessageTime: {
    color: colors.white + 'CC', // 80% opacity
    textAlign: 'right',
  },
  otherMessageTime: {
    color: colors.gray500,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    padding: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.gray900,
    maxHeight: 100,
    minHeight: 40,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray300,
  },
});
