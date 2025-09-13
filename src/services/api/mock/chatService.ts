import { mockDb } from './data';
import { mockNotificationService } from './notificationService';

import type { ChatService, ChatRoom, Message, MessageStatus } from '@/services/api/types';
import { MockChatRepository } from '@/services/mock/MockChatRepository';

const repo = new MockChatRepository();
const overlayStatus = new Map<string, MessageStatus>(); // ChatService独自のstatus上書き

export const mockChatService: ChatService = {
  async getChatRooms(studentId: string) {
    const rooms = await repo.getChatRooms(studentId);
    // lastMessage と件数は簡易に取得（モックのため効率より簡便性優先）
    const withMeta = await Promise.all(
      rooms.map(async (room) => {
        const msgs = await repo.listMessages(room.id, { limit: 50 });
        const last = msgs[msgs.length - 1];
        return { ...room, lastMessage: last, messageCount: msgs.length } as ChatRoom & {
          lastMessage?: Message;
          messageCount?: number;
        };
      }),
    );
    return { success: true, data: withMeta } as const;
  },

  async getMessages(chatRoomId: string, page = 1, limit = 100) {
    const upto = page * limit;
    const fetched = await repo.listMessages(chatRoomId, { limit: upto });
    // repo は古い順で返すため、末尾が新しい
    const total = fetched.length; // 簡易: 取得範囲内での件数
    const start = Math.max(0, total - limit);
    const slice = fetched
      .slice(start)
      .map((m) => ({ ...m, status: overlayStatus.get(m.id) || m.status }));

    return {
      success: true,
      data: slice,
      pagination: {
        page,
        limit,
        total,
        has_more: total > limit * page,
      },
    } as const;
  },

  async sendMessage(chatRoomId: string, senderId: string, text: string) {
    const newMsg = await repo.sendMessage(chatRoomId, senderId, text.trim());

    // 通知: 受信者に新着メッセージを通知
    const rooms = await repo.getChatRooms(senderId); // 簡易: 相手ID判定のためのフォールバック
    const room = rooms.find((r) => r.id === chatRoomId) as ChatRoom | undefined;
    if (room) {
      const receiverId = senderId === room.studentId ? room.tutorId : room.studentId;
      const senderName =
        mockDb.students.find((s) => s.id === senderId)?.name ||
        mockDb.tutors.find((t) => t.id === senderId)?.name ||
        'ユーザー';
      await mockNotificationService.createMessageNotification(
        receiverId,
        senderId,
        senderName,
        newMsg.id,
      );
    }

    return { success: true, data: newMsg } as const;
  },

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    // Repository は status 更新APIを持たないため、Service 層で上書き管理
    overlayStatus.set(messageId, status);
    // 直近のメッセージ実体を取得して返す（簡易）
    const rooms = await repo.getChatRooms('student-1'); // 簡易: 実際には現在ユーザーIDが必要
    for (const room of rooms) {
      const msgs = await repo.listMessages(room.id, { limit: 50 });
      const found = msgs.find((m) => m.id === messageId);
      if (found) {
        return { success: true, data: { ...found, status } } as const;
      }
    }
    return {
      success: false,
      error: 'MessageNotFound',
      data: undefined as unknown as Message,
    } as const;
  },

  async createChatRoom(tutorId: string, studentId: string) {
    await delay(MOCK_DELAY.SHORT);
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
