// 擬似リアルタイム機能付きのモックチャットRepository
// setInterval によるbot自動応答とタイピングインジケーター

import uuid from 'react-native-uuid';

import type {
  ChatRepository,
  PaginationParams,
  TypingInfo,
  ChatError as _ChatError,
} from '@/interfaces/ChatRepository';
import { mockStudents } from '@/services/api/mock/data';
import type { Message, ChatRoom } from '@/services/api/types';

// モック用のデータストレージ
interface MockChatData {
  rooms: ChatRoom[];
  messages: { [roomId: string]: Message[] };
  typingStates: { [roomId: string]: { [userId: string]: TypingInfo } };
}

const defaultStudentId = mockStudents[0]?.id ?? 'student-1';

const mockData: MockChatData = {
  rooms: [
    {
      id: 'room-1',
      tutorId: '1',
      studentId: defaultStudentId,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      id: 'room-2',
      tutorId: '2',
      studentId: defaultStudentId,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date(),
    },
  ],
  messages: {
    'room-1': [
      {
        id: 'msg-1',
        chatRoomId: 'room-1',
        senderId: '1',
        text: 'こんにちは！数学の質問があれば何でも聞いてください。',
        timestamp: new Date('2024-01-01T10:00:00'),
        status: 'read',
      },
      {
        id: 'msg-2',
        chatRoomId: 'room-1',
        senderId: defaultStudentId,
        text: 'よろしくお願いします！二次関数の問題で困っています。',
        timestamp: new Date('2024-01-01T10:05:00'),
        status: 'read',
      },
    ],
    'room-2': [
      {
        id: 'msg-3',
        chatRoomId: 'room-2',
        senderId: '2',
        text: '英語のライティングについて相談しましょう！',
        timestamp: new Date('2024-01-02T14:00:00'),
        status: 'read',
      },
    ],
  },
  typingStates: {},
};

// Bot自動応答のテンプレート
const BOT_RESPONSES = [
  'そうですね、その通りです！',
  'なるほど、いい質問ですね。',
  'それについて詳しく説明しますね。',
  'まずは基本から確認しましょう。',
  'わからないところがあれば遠慮なく聞いてください！',
  '次のステップに進みましょう。',
  '理解できましたか？',
  '練習問題を一緒にやってみましょう。',
];

export class MockChatRepository implements ChatRepository {
  private messageSubscriptions: Map<string, ((message: Message) => void)[]> = new Map();
  private typingSubscriptions: Map<string, ((typingInfo: TypingInfo) => void)[]> = new Map();
  private botResponseTimers: Map<string, NodeJS.Timeout> = new Map();

  async listMessages(roomId: string, params?: PaginationParams): Promise<Message[]> {
    // 遅延をシミュレート
    await this.delay(200);

    const messages = mockData.messages[roomId] || [];
    const limit = params?.limit || 50;

    // 新しい順でソートして取得
    const sortedMessages = [...messages].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    // before パラメータがある場合はカーソル位置から取得
    let filteredMessages = sortedMessages;
    if (params?.before) {
      const beforeIndex = sortedMessages.findIndex((msg) => msg.id === params.before);
      if (beforeIndex > -1) {
        filteredMessages = sortedMessages.slice(beforeIndex + 1);
      }
    }

    return filteredMessages.slice(0, limit).reverse(); // 古い順に戻す
  }

  async sendMessage(roomId: string, senderId: string, text: string): Promise<Message> {
    await this.delay(300);

    const message: Message = {
      id: String(uuid.v4()),
      chatRoomId: roomId,
      senderId,
      text: text.trim(),
      timestamp: new Date(),
      status: 'sent',
    };

    // メッセージを保存
    if (!mockData.messages[roomId]) {
      mockData.messages[roomId] = [];
    }
    mockData.messages[roomId].push(message);

    // 購読者に通知
    this.notifyMessageSubscribers(roomId, message);

    // Bot自動応答をスケジュール（学生からのメッセージの場合）
    if (senderId.includes('student')) {
      this.scheduleBotResponse(roomId, senderId);
    }

    return message;
  }

  subscribeMessages(roomId: string, callback: (message: Message) => void): () => void {
    if (!this.messageSubscriptions.has(roomId)) {
      this.messageSubscriptions.set(roomId, []);
    }

    const subscribers = this.messageSubscriptions.get(roomId)!;
    subscribers.push(callback);

    // アンサブスクライブ関数を返す
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  async setTyping(roomId: string, userId: string, isTyping: boolean): Promise<void> {
    await this.delay(50);

    if (!mockData.typingStates[roomId]) {
      mockData.typingStates[roomId] = {};
    }

    const typingInfo: TypingInfo = {
      userId,
      isTyping,
      timestamp: new Date(),
    };

    if (isTyping) {
      mockData.typingStates[roomId][userId] = typingInfo;
    } else {
      delete mockData.typingStates[roomId][userId];
    }

    // 購読者に通知
    this.notifyTypingSubscribers(roomId, typingInfo);
  }

  subscribeTyping(roomId: string, callback: (typingInfo: TypingInfo) => void): () => void {
    if (!this.typingSubscriptions.has(roomId)) {
      this.typingSubscriptions.set(roomId, []);
    }

    const subscribers = this.typingSubscriptions.get(roomId)!;
    subscribers.push(callback);

    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  async getChatRooms(userId: string): Promise<ChatRoom[]> {
    await this.delay(400);

    return mockData.rooms.filter((room) => room.tutorId === userId || room.studentId === userId);
  }

  async createChatRoom(tutorId: string, studentId: string): Promise<ChatRoom> {
    await this.delay(500);

    const chatRoom: ChatRoom = {
      id: String(uuid.v4()),
      tutorId,
      studentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockData.rooms.push(chatRoom);
    mockData.messages[chatRoom.id] = [];

    return chatRoom;
  }

  // プライベートヘルパーメソッド
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private notifyMessageSubscribers(roomId: string, message: Message): void {
    const subscribers = this.messageSubscriptions.get(roomId);
    if (subscribers) {
      subscribers.forEach((callback) => callback(message));
    }
  }

  private notifyTypingSubscribers(roomId: string, typingInfo: TypingInfo): void {
    const subscribers = this.typingSubscriptions.get(roomId);
    if (subscribers) {
      subscribers.forEach((callback) => callback(typingInfo));
    }
  }

  private scheduleBotResponse(roomId: string, excludeUserId: string): void {
    // 既存のタイマーをクリア
    const existingTimer = this.botResponseTimers.get(roomId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 1-3秒後にBot応答を送信
    const delay = Math.random() * 2000 + 1000;

    const timer = setTimeout(async () => {
      try {
        // ルーム内の他のユーザー（家庭教師）を取得
        const room = mockData.rooms.find((r) => r.id === roomId);
        if (!room) return;

        const botUserId = room.tutorId === excludeUserId ? room.studentId : room.tutorId;

        // タイピング状態をシミュレート
        await this.setTyping(roomId, botUserId, true);

        // 500ms-1500msタイピング後にメッセージ送信
        setTimeout(
          async () => {
            await this.setTyping(roomId, botUserId, false);

            const randomResponse = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
            await this.sendMessage(roomId, botUserId, randomResponse);
          },
          Math.random() * 1000 + 500,
        );
      } catch (error) {
        console.warn('Bot response failed:', error);
      } finally {
        this.botResponseTimers.delete(roomId);
      }
    }, delay);

    this.botResponseTimers.set(roomId, timer);
  }

  // テスト/開発用メソッド
  public resetData(): void {
    mockData.messages = {};
    mockData.typingStates = {};
    mockData.rooms = [];
  }

  public addMockMessage(roomId: string, message: Omit<Message, 'id' | 'timestamp'>): void {
    const fullMessage: Message = {
      ...message,
      id: String(uuid.v4()),
      timestamp: new Date(),
    };

    if (!mockData.messages[roomId]) {
      mockData.messages[roomId] = [];
    }
    mockData.messages[roomId].push(fullMessage);
  }
}
