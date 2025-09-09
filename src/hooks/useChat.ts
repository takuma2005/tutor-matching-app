// チャット機能用のカスタムHook
// モック・Supabase切り替え可能な設計

import React, { useState, useEffect, useCallback, useRef } from 'react';

import type {
  ChatRepository,
  ChatHookState,
  ChatHookActions,
  TypingInfo as _TypingInfo,
  ChatError,
} from '@/interfaces/ChatRepository';
import type { Message } from '@/services/api/types';
import { MockChatRepository } from '@/services/mock/MockChatRepository';

// 設定値
const TYPING_TIMEOUT = 3000; // 3秒でタイピング自動停止
const TYPING_DEBOUNCE = 500; // 500ms内の連続入力は1回とみなす
const RETRY_DELAY = 1000; // リトライ間隔

interface UseChatOptions {
  roomId: string;
  currentUserId: string;
  repository?: ChatRepository; // テスト用にリポジトリをインジェクト可能
}

export const useChat = ({
  roomId,
  currentUserId,
  repository,
}: UseChatOptions): ChatHookState & ChatHookActions => {
  // リポジトリの初期化（実際のアプリでは環境変数で切り替え）
  const chatRepository = React.useMemo(() => repository || new MockChatRepository(), [repository]);

  // State
  const [state, setState] = useState<ChatHookState>({
    messages: [],
    isLoading: true,
    error: null,
    hasMore: true,
    typingUsers: new Set(),
  });

  // Refs
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isTypingRef = useRef(false);
  const unsubscribesRef = useRef<(() => void)[]>([]);

  // メッセージ読み込み
  const loadMessages = useCallback(
    async (before?: string) => {
      try {
        setState((prev) => ({ ...prev, error: null }));

        const messages = await chatRepository.listMessages(roomId, {
          limit: 50,
          before,
        });

        setState((prev) => ({
          ...prev,
          messages: before ? [...prev.messages, ...messages] : messages,
          hasMore: messages.length === 50,
          isLoading: false,
        }));
      } catch (error) {
        const chatError = error as ChatError;
        setState((prev) => ({
          ...prev,
          error: chatError.message || 'メッセージの読み込みに失敗しました',
          isLoading: false,
        }));
      }
    },
    [roomId, chatRepository],
  );

  // 初回メッセージ読み込み
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // メッセージ購読設定
  useEffect(() => {
    const unsubscribeMessages = chatRepository.subscribeMessages(roomId, (message) => {
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
    });

    const unsubscribeTyping = chatRepository.subscribeTyping(roomId, (typingInfo) => {
      setState((prev) => {
        const newTypingUsers = new Set(prev.typingUsers);

        if (typingInfo.isTyping && typingInfo.userId !== currentUserId) {
          newTypingUsers.add(typingInfo.userId);
        } else {
          newTypingUsers.delete(typingInfo.userId);
        }

        return {
          ...prev,
          typingUsers: newTypingUsers,
        };
      });
    });

    unsubscribesRef.current = [unsubscribeMessages, unsubscribeTyping];

    return () => {
      unsubscribesRef.current.forEach((unsubscribe) => unsubscribe());
    };
  }, [roomId, currentUserId, chatRepository]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // アクション: メッセージ送信
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // 楽観的更新（一時的にメッセージを表示）
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        chatRoomId: roomId,
        senderId: currentUserId,
        text: text.trim(),
        timestamp: new Date(),
        status: 'sending',
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, tempMessage],
      }));

      try {
        // タイピング停止
        if (isTypingRef.current) {
          await chatRepository.setTyping(roomId, currentUserId, false);
          isTypingRef.current = false;
        }

        const sentMessage = await chatRepository.sendMessage(roomId, currentUserId, text.trim());

        // 一時メッセージを実際のメッセージで置換
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) => (msg.id === tempMessage.id ? sentMessage : msg)),
        }));
      } catch (error) {
        const chatError = error as ChatError;

        // 送信失敗したメッセージを削除
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter((msg) => msg.id !== tempMessage.id),
          error: chatError.message || 'メッセージの送信に失敗しました',
        }));
      }
    },
    [roomId, currentUserId, chatRepository],
  );

  // アクション: 過去メッセージ読み込み
  const loadMoreMessages = useCallback(async () => {
    if (!state.hasMore || state.isLoading) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    await loadMessages(state.messages[0]?.id);
  }, [state.hasMore, state.isLoading, state.messages, loadMessages]);

  // アクション: タイピング開始
  const startTyping = useCallback(async () => {
    if (isTypingRef.current) return;

    try {
      await chatRepository.setTyping(roomId, currentUserId, true);
      isTypingRef.current = true;

      // 自動停止タイマー設定
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(async () => {
        if (isTypingRef.current) {
          await chatRepository.setTyping(roomId, currentUserId, false);
          isTypingRef.current = false;
        }
      }, TYPING_TIMEOUT);
    } catch (error) {
      console.warn('Failed to start typing:', error);
    }
  }, [roomId, currentUserId, chatRepository]);

  // アクション: タイピング停止
  const stopTyping = useCallback(async () => {
    if (!isTypingRef.current) return;

    try {
      await chatRepository.setTyping(roomId, currentUserId, false);
      isTypingRef.current = false;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = undefined;
      }
    } catch (error) {
      console.warn('Failed to stop typing:', error);
    }
  }, [roomId, currentUserId, chatRepository]);

  // アクション: リトライ
  const retry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      isLoading: true,
    }));

    setTimeout(() => {
      loadMessages();
    }, RETRY_DELAY);
  }, [loadMessages]);

  return {
    ...state,
    sendMessage,
    loadMoreMessages,
    startTyping,
    stopTyping,
    retry,
  };
};

// デバウンス機能付きのタイピング制御用Hook
export const useTypingManager = (
  startTyping: () => void,
  stopTyping: () => void,
  debounceMs: number = TYPING_DEBOUNCE,
) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      startTyping();
      isTypingRef.current = true;
    }

    // デバウンス処理
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        stopTyping();
        isTypingRef.current = false;
      }
    }, debounceMs);
  }, [startTyping, stopTyping, debounceMs]);

  const handleStopTyping = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (isTypingRef.current) {
      stopTyping();
      isTypingRef.current = false;
    }
  }, [stopTyping]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    handleTyping,
    handleStopTyping,
  };
};
