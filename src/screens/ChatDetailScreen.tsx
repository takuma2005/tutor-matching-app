import { MaterialIcons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Animated,
  Image,
  Keyboard,
  type KeyboardEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ChatStackParamList } from '../navigation/ChatStackNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { useAuth } from '@/contexts/AuthContext';
import { getApiClient } from '@/services/api/mock';
import type { Tutor, Student, Message as ApiMessage, MessageStatus } from '@/services/api/types';
// API の Message 型を利用するためローカル定義は削除
type Props = StackScreenProps<ChatStackParamList, 'ChatDetail'>;

export default function ChatDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = (() => {
    try {
      // useBottomTabBarHeight throws if not in a tab context; guard it
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useBottomTabBarHeight();
    } catch {
      return 56 + insets.bottom; // fallback
    }
  })();

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  React.useEffect(() => {
    const showEvt: 'keyboardWillShow' | 'keyboardDidShow' =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt: 'keyboardWillHide' | 'keyboardDidHide' =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: KeyboardEvent) => setKeyboardHeight(e.endCoordinates?.height ?? 0);
    const onHide = () => setKeyboardHeight(0);
    const subShow = Keyboard.addListener(showEvt, onShow);
    const subHide = Keyboard.addListener(hideEvt, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const inputExtraBottomSpace = spacing.sm; // 入力欄の直下に設ける余白
  const inputAreaHeight = spacing.md * 2 + 44 + 48 + spacing.sm + inputExtraBottomSpace;
  const bottomOffset = Math.max(tabBarHeight, keyboardHeight);
  const { tutorId, chatRoomId } = route.params;
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingAnimValue = useRef(new Animated.Value(0)).current;

  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [tutor, setTutor] = useState<Tutor | undefined>(undefined);
  const api = React.useMemo(() => getApiClient(), []);
  const { student: authStudent, user: authUser } = useAuth();
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [blockedByOtherUserId, setBlockedByOtherUserId] = useState<string | null>(null);

  const currentUserId = currentStudent?.id ?? authUser?.id ?? '';
  const hasBlockedTutor = blockedUserIds.includes(tutorId);
  const isBlockedByOther = Boolean(blockedByOtherUserId);
  const isChatBlocked = hasBlockedTutor || isBlockedByOther;

  const maxMessageLength = 1000;
  const remainingChars = maxMessageLength - inputText.length;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const studentId = authStudent?.id ?? authUser?.id;
      if (!studentId) {
        setCurrentStudent(null);
        setBlockedUserIds([]);
        setBlockedByOtherUserId(null);
        return;
      }

      const [profileResp, tutorsResp, messagesResp, moderationResp] = await Promise.all([
        api.student.getProfile(studentId),
        api.student.searchTutors(undefined, 1, 200),
        api.chat.getMessages(chatRoomId, 1, 200),
        api.chat.getModerationStatus(chatRoomId, studentId),
      ]);
      if (!mounted) return;
      if (profileResp?.success) setCurrentStudent(profileResp.data);
      else if (authStudent) setCurrentStudent(authStudent);
      if (tutorsResp?.success) {
        const found = tutorsResp.data.find((t) => t.id === tutorId);
        setTutor(found);
      }
      if (messagesResp?.success) {
        setMessages(messagesResp.data);

        // 未読メッセージを既読に更新
        const currentId = profileResp?.data?.id ?? authStudent?.id ?? null;
        const unreadMessages = messagesResp.data.filter(
          (msg) => msg.senderId !== currentId && msg.status !== 'read',
        );

        for (const message of unreadMessages) {
          try {
            await api.chat.updateMessageStatus(message.id, 'read', currentId ?? undefined);
          } catch (error) {
            console.warn('Failed to update message status:', error);
          }
        }

        if (unreadMessages.length > 0) {
          // 状態更新後のメッセージを再取得
          const updatedMessagesResp = await api.chat.getMessages(chatRoomId, 1, 200);
          if (updatedMessagesResp?.success && mounted) {
            setMessages(updatedMessagesResp.data);
          }
        }
      }

      if (moderationResp?.success && moderationResp.data) {
        setBlockedUserIds(moderationResp.data.blockedUsers);
        setBlockedByOtherUserId(moderationResp.data.blockedByOtherUserId);
      } else {
        setBlockedUserIds([]);
        setBlockedByOtherUserId(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api, authStudent, authUser?.id, chatRoomId, tutorId]);

  useEffect(() => {
    // 画面に入ったら最新メッセージまでスクロール
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // タイピングアニメーション
  useEffect(() => {
    if (isTyping) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimValue, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(typingAnimValue, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isTyping, typingAnimValue]);

  const handleSendMessage = useCallback(async () => {
    if (inputText.trim() === '' || isLoading || !currentUserId || isChatBlocked) return;
    const messageText = inputText.trim();

    const tempId = `temp_${Date.now()}`;
    const optimistic: ApiMessage = {
      id: tempId,
      chatRoomId,
      senderId: currentUserId,
      text: messageText,
      timestamp: new Date(),
      status: 'sending',
    };
    setMessages((prev) => [...prev, optimistic]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const sendResp = await api.chat.sendMessage(chatRoomId, currentUserId, messageText);
      if (!sendResp.success) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        Alert.alert('送信エラー', sendResp.error || 'メッセージを送信できませんでした。');
        return;
      }

      const sentMsg = sendResp.data;
      setMessages((prev) => prev.map((m) => (m.id === tempId ? sentMsg : m)));

      const senderId = currentUserId;

      setTimeout(async () => {
        try {
          await api.chat.updateMessageStatus(sentMsg.id, 'delivered', senderId);
          setMessages((prev) =>
            prev.map((m) => (m.id === sentMsg.id ? { ...m, status: 'delivered' } : m)),
          );
        } catch (error) {
          console.warn('Failed to update message status:', error);
        }
        if (Math.random() < 0.3 && messageText.includes('？')) {
          setIsTyping(true);
          const typingDuration = 2000 + Math.random() * 3000;
          setTimeout(() => {
            setIsTyping(false);
            const reply: ApiMessage = {
              id: `msg_auto_${Date.now()}`,
              chatRoomId,
              senderId: tutorId,
              text: 'ありがとうございます！詳しく説明させていただきますね。',
              timestamp: new Date(),
              status: 'sent',
            };
            setMessages((prev) => [...prev, reply]);
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }, typingDuration);
        }
      }, 800);
    } finally {
      setIsLoading(false);
    }
  }, [api, chatRoomId, currentUserId, inputText, isChatBlocked, isLoading, tutorId]);

  const handleLessonRequest = () => {
    navigation.navigate('LessonRequest', { tutorId, chatRoomId });
  };

  const handleReport = () => {
    if (!authUser?.id) {
      Alert.alert('エラー', 'ユーザー情報が取得できません。');
      return;
    }

    Alert.alert(
      '通報する',
      `${tutor?.name || 'このユーザー'}さんを通報しますか？\n\n不適切な行為や内容がある場合にご利用ください。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '通報する',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.chat.reportUser(
                chatRoomId,
                authUser.id,
                tutorId,
                'モック環境での通報',
              );

              if (response.success) {
                Alert.alert(
                  '通報完了',
                  '通報しました。運営チームが確認し、必要に応じて対応いたします。',
                );
              } else {
                Alert.alert('エラー', response.error || '通報に失敗しました。');
              }
            } catch (error) {
              console.error('通報エラー:', error);
              Alert.alert('エラー', '通報の送信に失敗しました。');
            }
          },
        },
      ],
    );
  };

  const handleBlock = () => {
    if (!authUser?.id) {
      Alert.alert('エラー', 'ユーザー情報が取得できません。');
      return;
    }

    if (hasBlockedTutor) {
      Alert.alert('情報', 'このユーザーは既にブロック済みです。');
      return;
    }

    Alert.alert(
      'ブロックする',
      `${tutor?.name || 'このユーザー'}さんをブロックしますか？\n\nブロックすると以下の制限がかかります：\n・ メッセージの送受信ができなくなる\n・ 新たなマッチングができなくなる`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ブロックする',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.chat.blockUser(chatRoomId, authUser.id, tutorId);
              if (response.success) {
                setBlockedUserIds((prev) => (prev.includes(tutorId) ? prev : [...prev, tutorId]));
                setIsTyping(false);
                Alert.alert('ブロック完了', 'ユーザーをブロックしました。', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert('エラー', response.error || 'ブロックに失敗しました。');
              }
            } catch (error) {
              console.error('ブロックエラー:', error);
              Alert.alert('エラー', 'ブロックに失敗しました。');
            }
          },
        },
      ],
    );
  };

  const handleMore = () => {
    Alert.alert('オプション', `${tutor?.name || 'ユーザー'}さんに関する操作`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '通報する', onPress: handleReport },
      { text: 'ブロックする', style: 'destructive', onPress: handleBlock },
    ]);
  };

  const formatMessageTime = (timestamp: Date) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sending':
        return <MaterialIcons name="access-time" size={12} color={colors.gray400} />;
      case 'sent':
        return <MaterialIcons name="done" size={12} color={colors.gray400} />;
      case 'delivered':
        return <MaterialIcons name="done-all" size={12} color={colors.gray400} />;
      case 'read':
        return <MaterialIcons name="done-all" size={12} color={colors.primary} />;
      default:
        return null;
    }
  };

  // 先輩/後輩 判定（簡易）
  const getRelationLabel = (t?: Tutor, s?: Student | null) => {
    if (!t || !s) return '';
    const level = (v?: string) => {
      const str = v || '';
      if (str.includes('博士')) return 5;
      if (str.includes('修士') || str.includes('院')) return 4;
      if (str.includes('大学')) return 3;
      if (str.includes('高校')) return 2;
      if (str.includes('中学')) return 1;
      return 0;
    };
    const tutorLevel = Math.max(level(t.grade), level(t.school));
    const studentLevel = Math.max(level(s.grade), level(s.school));
    if (tutorLevel > studentLevel) return '先輩';
    if (tutorLevel < studentLevel) return '後輩';
    return '同級生';
  };
  const relationLabel = getRelationLabel(tutor, currentStudent);

  const renderMessage = ({ item, index }: { item: ApiMessage; index: number }) => {
    const isOwnMessage = item.senderId === currentUserId;
    const showTimestamp =
      index === 0 ||
      messages[index - 1]?.senderId !== item.senderId ||
      item.timestamp.getTime() - messages[index - 1]?.timestamp.getTime() > 5 * 60 * 1000; // 5分以上間隔

    const sideMeta = showTimestamp ? (
      <View style={[styles.sideMeta, isOwnMessage ? styles.sideLeft : styles.sideRight]}>
        {isOwnMessage && <View style={styles.sideStatus}>{getMessageStatusIcon(item.status)}</View>}
        <Text style={styles.sideTime}>{formatMessageTime(item.timestamp)}</Text>
      </View>
    ) : null;

    return (
      <View style={styles.messageContainer}>
        <View style={[styles.messageRow, isOwnMessage ? styles.rowOwn : styles.rowOther]}>
          {isOwnMessage && sideMeta}
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
          </View>
          {!isOwnMessage && sideMeta}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Animated.View style={[styles.typingDot, { opacity: typingAnimValue }]} />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnimValue.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnimValue.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
              },
            ]}
          />
        </View>
        <Text style={styles.typingText}>{tutor?.name}が入力中...</Text>
      </View>
    );
  };

  if (!tutor) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>チャットが見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              {tutor.avatar_url ? (
                <Image source={{ uri: tutor.avatar_url }} style={styles.headerAvatarImage} />
              ) : (
                <MaterialIcons name="person" size={20} color={colors.gray400} />
              )}
            </View>
            <View style={styles.tutorDetails}>
              <Text style={styles.tutorName}>{tutor.name}</Text>
              {!!relationLabel && <Text style={styles.roleText}>{relationLabel}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.headerRightButtons}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('LessonHistory', { tutorId })}
          >
            <MaterialIcons name="assignment" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton} onPress={handleMore}>
            <MaterialIcons name="more-vert" size={20} color={colors.gray600} />
          </TouchableOpacity>
        </View>
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
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: bottomOffset + inputAreaHeight + spacing.sm },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (!isLoading)
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          }}
        />

        {/* タイピングインジケーター */}
        {renderTypingIndicator()}

        {/* 下部CTA：授業を申請する */}
        <View style={[styles.ctaContainer, { paddingBottom: spacing.sm + insets.bottom }]}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleLessonRequest}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={20} color={colors.white} style={styles.ctaIcon} />
            <Text style={styles.ctaButtonText}>新しい授業を申請</Text>
          </TouchableOpacity>
        </View>

        {/* 入力エリア（白いエリアを拡張し、その上部に申請ボタンを配置） */}
        <View
          style={[
            styles.inputContainer,
            { position: 'absolute', left: 0, right: 0, bottom: bottomOffset },
          ]}
        >
          <View style={styles.inlineCtaContainer}>
            <TouchableOpacity
              style={[styles.inlineCtaButton, isChatBlocked && styles.inlineCtaButtonDisabled]}
              onPress={handleLessonRequest}
              activeOpacity={0.85}
              disabled={isChatBlocked}
            >
              <MaterialIcons
                name="add"
                size={20}
                color={colors.white}
                style={styles.inlineCtaIcon}
              />
              <Text style={styles.inlineCtaText}>授業を申請</Text>
            </TouchableOpacity>
          </View>
          {remainingChars <= 50 && (
            <View style={styles.charCountContainer}>
              <Text style={[styles.charCount, remainingChars <= 0 && styles.charCountError]}>
                {remainingChars}
              </Text>
            </View>
          )}
          {isChatBlocked && (
            <View
              style={[
                styles.blockNotice,
                isBlockedByOther ? styles.blockNoticeDanger : styles.blockNoticeInfo,
              ]}
            >
              <MaterialIcons
                name={isBlockedByOther ? 'block' : 'privacy-tip'}
                size={16}
                color={isBlockedByOther ? colors.error : colors.gray600}
              />
              <Text style={styles.blockNoticeText}>
                {isBlockedByOther
                  ? '相手によってブロックされているためメッセージを送信できません。'
                  : 'このユーザーをブロックしているためメッセージを送信できません。'}
              </Text>
            </View>
          )}
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={[styles.textInput, inputText.length > 200 && styles.textInputExpanded]}
                placeholder={
                  isChatBlocked ? 'ブロック中はメッセージを送信できません' : 'メッセージを入力...'
                }
                placeholderTextColor={colors.gray400}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={maxMessageLength}
                editable={!isLoading && !isChatBlocked}
                textAlignVertical="top"
                returnKeyType="send"
                onSubmitEditing={handleSendMessage}
                blurOnSubmit={false}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                (inputText.trim() === '' || isLoading || isChatBlocked) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={inputText.trim() === '' || isLoading || isChatBlocked}
              activeOpacity={0.7}
              accessibilityLabel="メッセージを送信"
            >
              {isLoading ? (
                <MaterialIcons name="hourglass-empty" size={20} color={colors.white} />
              ) : (
                <MaterialIcons name="send" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
          {/* 入力欄の下に少し余白 */}
          <View style={{ height: spacing.sm }} />
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
    alignItems: 'center',
    justifyContent: 'center',
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
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    // removed; replaced by onlineTag
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
  roleText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray500,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  messageFooter: {
    // no longer used for time/status; kept for potential future use
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs / 2,
  },
  // Row that aligns bubble and side meta (time/status)
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    columnGap: spacing.xs,
  },
  rowOwn: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  sideMeta: {
    minWidth: 34,
  },
  sideLeft: {
    alignItems: 'flex-end',
    marginRight: spacing.xs / 2,
  },
  sideRight: {
    alignItems: 'flex-start',
    marginLeft: spacing.xs / 2,
  },
  sideStatus: {
    marginBottom: 2,
  },
  sideTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray500,
    marginTop: -8,
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
  messageStatus: {
    marginLeft: spacing.xs / 2,
  },
  typingContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray50,
  },
  typingBubble: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray400,
    marginHorizontal: 1,
  },
  typingText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray500,
    marginTop: spacing.xs / 2,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    padding: spacing.md,
  },
  lessonRequestCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl || 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  cardHeaderText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray900,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full || 12,
  },
  statusBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.warning,
  },
  cardContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardInfoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray700,
    marginLeft: spacing.sm,
    flex: 1,
  },
  ctaContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: borderRadius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaIcon: {
    marginRight: spacing.xs,
  },
  ctaButtonText: {
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.md,
  },
  inlineCtaContainer: {
    marginBottom: spacing.sm,
  },
  inlineCtaButton: {
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  inlineCtaButtonDisabled: {
    backgroundColor: colors.gray300,
    opacity: 0.7,
    shadowOpacity: 0,
    elevation: 0,
  },
  inlineCtaIcon: {
    marginRight: spacing.xs,
  },
  inlineCtaText: {
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.md,
  },
  charCountContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.xs / 2,
  },
  charCount: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray500,
  },
  charCountError: {
    color: colors.error,
    fontWeight: typography.fontWeights.semibold,
  },
  blockNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  blockNoticeInfo: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  blockNoticeDanger: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: colors.error,
  },
  blockNoticeText: {
    marginLeft: spacing.sm,
    color: colors.gray700,
    fontSize: typography.fontSizes.sm,
    flex: 1,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    marginRight: spacing.sm,
    height: 48,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: typography.fontSizes.md,
    color: colors.gray900,
    height: '100%',
    lineHeight: typography.lineHeights.normal * typography.fontSizes.md,
    textAlignVertical: 'center',
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    paddingBottom: Platform.OS === 'ios' ? 14 : 0,
  },
  textInputExpanded: {
    maxHeight: 150,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray400,
    shadowOpacity: 0,
    elevation: 0,
  },
});
