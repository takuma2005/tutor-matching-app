import type { ChatService, ChatRoom, Message, MessageStatus } from '@/services/api/types';

const MOCK_DELAY = { SHORT: 200, MEDIUM: 500, LONG: 1000 } as const;

// メモリ内データストア（開発用）
let chatRooms: ChatRoom[] = [
  {
    id: 'room_1',
    tutorId: '1', // 既存mockTutorに合わせる
    studentId: 'student-1',
    createdAt: new Date('2024-01-15T09:00:00'),
    updatedAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: 'room_2',
    tutorId: '2',
    studentId: 'student-1',
    createdAt: new Date('2024-01-14T14:00:00'),
    updatedAt: new Date('2024-01-14T15:45:00'),
  },
  {
    id: 'room_3',
    tutorId: '3',
    studentId: 'student-1',
    createdAt: new Date('2024-01-13T16:00:00'),
    updatedAt: new Date('2024-01-13T18:20:00'),
  },
];

let messages: Message[] = [
  {
    id: 'msg_1',
    chatRoomId: 'room_1',
    senderId: '1',
    text: 'こんにちは！数学の授業、明日の3時からでいかがでしょうか？課題も用意してお待ちしています。',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'delivered',
  },
  {
    id: 'msg_2',
    chatRoomId: 'room_2',
    senderId: 'student-1',
    text: '英語の文法でわからないところがあります。教えていただけますか？特に関係代名詞の使い方が...',
    timestamp: new Date('2024-01-14T15:45:00'),
    status: 'read',
  },
  {
    id: 'msg_3',
    chatRoomId: 'room_3',
    senderId: '3',
    text: 'お疲れさまでした！今日の授業、いかがでしたか？復習問題も送っておきますね。',
    timestamp: new Date('2024-01-13T18:20:00'),
    status: 'read',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockChatService: ChatService = {
  async getChatRooms(studentId: string) {
    await delay(MOCK_DELAY.SHORT);
    const studentRooms = chatRooms.filter((r) => r.studentId === studentId);

    const roomsWithLast = studentRooms.map((room) => {
      const roomMessages = messages
        .filter((m) => m.chatRoomId === room.id)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const last = roomMessages[0];
      return {
        ...room,
        lastMessage: last,
        messageCount: roomMessages.length,
      };
    });

    return { success: true, data: roomsWithLast } as const;
  },

  async getMessages(chatRoomId: string, page = 1, limit = 100) {
    await delay(MOCK_DELAY.SHORT);
    const all = messages
      .filter((m) => m.chatRoomId === chatRoomId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const start = (page - 1) * limit;
    const end = start + limit;
    const slice = all.slice(start, end);

    return {
      success: true,
      data: slice,
      pagination: {
        page,
        limit,
        total: all.length,
        has_more: end < all.length,
      },
    } as const;
  },

  async sendMessage(chatRoomId: string, senderId: string, text: string) {
    await delay(MOCK_DELAY.MEDIUM);
    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      chatRoomId,
      senderId,
      text: text.trim(),
      timestamp: new Date(),
      status: 'sent',
    };
    messages.push(newMsg);

    const roomIdx = chatRooms.findIndex((r) => r.id === chatRoomId);
    if (roomIdx !== -1) {
      chatRooms[roomIdx] = { ...chatRooms[roomIdx], updatedAt: new Date() };
    }

    return { success: true, data: newMsg } as const;
  },

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    await delay(MOCK_DELAY.SHORT);
    const idx = messages.findIndex((m) => m.id === messageId);
    if (idx === -1)
      return { success: false, error: 'MessageNotFound', data: undefined as any } as const;
    messages[idx] = { ...messages[idx], status };
    return { success: true, data: messages[idx] } as const;
  },

  async createChatRoom(tutorId: string, studentId: string) {
    await delay(API_CONFIG.MOCK_DELAY.SHORT);
    const existing = chatRooms.find((r) => r.tutorId === tutorId && r.studentId === studentId);
    if (existing) return { success: true, data: existing } as const;

    const room: ChatRoom = {
      id: `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      tutorId,
      studentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    chatRooms.push(room);
    return { success: true, data: room } as const;
  },
};
