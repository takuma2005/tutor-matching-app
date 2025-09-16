import uuid from 'react-native-uuid';

import type { ApiResponse } from '../types';
import { mockDb } from './data';

export type NotificationType =
  | 'match_request_received'
  | 'match_request_approved'
  | 'match_request_rejected'
  | 'match_request_cancelled'
  | 'lesson_request_received'
  | 'lesson_request_approved'
  | 'lesson_request_rejected'
  | 'lesson_started'
  | 'lesson_completed'
  | 'message_received'
  | 'payment_received';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string;
  related_type?: 'match' | 'lesson' | 'message' | 'payment';
  created_at: string;
}

export class MockNotificationService {
  // 通知を作成
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: 'match' | 'lesson' | 'message' | 'payment',
  ): Promise<ApiResponse<Notification>> {
    try {
      const notification: Notification = {
        id: String(uuid.v4()),
        user_id: userId,
        type,
        title,
        message,
        is_read: false,
        related_id: relatedId,
        related_type: relatedType,
        created_at: new Date().toISOString(),
      };

      // mockDbに通知配列がない場合は作成
      if (!mockDb.notifications) {
        mockDb.notifications = [];
      }

      mockDb.notifications.push(notification);

      return {
        success: true,
        data: notification,
      };
    } catch {
      return {
        success: false,
        error: '通知の作成に失敗しました。',
        data: {} as Notification,
      };
    }
  }

  // ユーザーの通知一覧を取得
  async getUserNotifications(
    userId: string,
    limit: number = 50,
  ): Promise<ApiResponse<Notification[]>> {
    try {
      if (!mockDb.notifications) {
        mockDb.notifications = [];
      }

      const userNotifications = mockDb.notifications
        .filter((n: Notification) => n.user_id === userId)
        .sort(
          (a: Notification, b: Notification) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, limit);

      return {
        success: true,
        data: userNotifications,
      };
    } catch {
      return {
        success: false,
        error: '通知の取得に失敗しました。',
        data: [],
      };
    }
  }

  // 通知を既読にする
  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    try {
      if (!mockDb.notifications) {
        return {
          success: false,
          error: '通知が見つかりません。',
          data: {} as Notification,
        };
      }

      const notification = mockDb.notifications.find((n: Notification) => n.id === notificationId);
      if (!notification) {
        return {
          success: false,
          error: '通知が見つかりません。',
          data: {} as Notification,
        };
      }

      notification.is_read = true;

      return {
        success: true,
        data: notification,
      };
    } catch {
      return {
        success: false,
        error: '通知の更新に失敗しました。',
        data: {} as Notification,
      };
    }
  }

  // 全ての通知を既読にする
  async markAllAsRead(userId: string): Promise<ApiResponse<number>> {
    try {
      if (!mockDb.notifications) {
        return {
          success: true,
          data: 0,
        };
      }

      let updatedCount = 0;
      mockDb.notifications.forEach((n: Notification) => {
        if (n.user_id === userId && !n.is_read) {
          n.is_read = true;
          updatedCount++;
        }
      });

      return {
        success: true,
        data: updatedCount,
      };
    } catch {
      return {
        success: false,
        error: '通知の更新に失敗しました。',
        data: 0,
      };
    }
  }

  // 未読通知数を取得
  async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    try {
      if (!mockDb.notifications) {
        return {
          success: true,
          data: 0,
        };
      }

      const unreadCount = mockDb.notifications.filter(
        (n: Notification) => n.user_id === userId && !n.is_read,
      ).length;

      return {
        success: true,
        data: unreadCount,
      };
    } catch {
      return {
        success: false,
        error: '未読数の取得に失敗しました。',
        data: 0,
      };
    }
  }

  // マッチング申請受信通知を作成
  async createMatchRequestNotification(
    tutorId: string,
    studentId: string,
    studentName: string,
    matchId: string,
  ): Promise<void> {
    await this.createNotification(
      tutorId,
      'match_request_received',
      '新しいマッチング申請',
      `${studentName}さんから申請が届きました`,
      matchId,
      'match',
    );
  }

  // マッチング承認通知を作成
  async createMatchApprovalNotification(
    studentId: string,
    tutorId: string,
    tutorName: string,
    matchId: string,
  ): Promise<void> {
    await this.createNotification(
      studentId,
      'match_request_approved',
      'マッチング承認',
      `${tutorName}先輩が申請を承認しました！チャットを開始できます。`,
      matchId,
      'match',
    );
  }

  // マッチング拒否通知（後輩向け）
  async createMatchRejectionNotificationForStudent(
    studentId: string,
    tutorName: string,
    matchId: string,
  ): Promise<void> {
    await this.createNotification(
      studentId,
      'match_request_rejected',
      'マッチング申請が拒否されました',
      `${tutorName}先輩が申請を拒否しました。コインは返金されました。`,
      matchId,
      'match',
    );
  }

  // マッチング拒否通知（先輩向け）
  async createMatchRejectionNotificationForTutor(
    tutorId: string,
    studentName: string,
    matchId: string,
  ): Promise<void> {
    await this.createNotification(
      tutorId,
      'match_request_rejected',
      '申請を拒否しました',
      `${studentName}さんの申請を拒否しました。`,
      matchId,
      'match',
    );
  }

  // マッチングキャンセル通知（後輩向け）
  async createMatchCancellationNotificationForStudent(
    studentId: string,
    tutorName: string,
    matchId: string,
  ): Promise<void> {
    await this.createNotification(
      studentId,
      'match_request_cancelled',
      'マッチング申請をキャンセルしました',
      `${tutorName}先輩への申請をキャンセルし、コインを返金しました。`,
      matchId,
      'match',
    );
  }

  // マッチングキャンセル通知（先輩向け）
  async createMatchCancellationNotificationForTutor(
    tutorId: string,
    studentName: string,
    matchId: string,
  ): Promise<void> {
    await this.createNotification(
      tutorId,
      'match_request_cancelled',
      '申請がキャンセルされました',
      `${studentName}さんが申請をキャンセルしました。`,
      matchId,
      'match',
    );
  }

  // 授業申請通知を作成
  async createLessonRequestNotification(
    tutorId: string,
    studentId: string,
    studentName: string,
    subject: string,
    lessonId: string,
  ): Promise<void> {
    await this.createNotification(
      tutorId,
      'lesson_request_received',
      '授業申請',
      `${studentName}さんから${subject}の授業申請が届きました`,
      lessonId,
      'lesson',
    );
  }

  // 授業承認通知を作成
  async createLessonApprovalNotification(
    studentId: string,
    tutorId: string,
    tutorName: string,
    subject: string,
    lessonId: string,
  ): Promise<void> {
    await this.createNotification(
      studentId,
      'lesson_request_approved',
      '授業承認',
      `${tutorName}先輩が${subject}の授業を承認しました`,
      lessonId,
      'lesson',
    );
  }

  // 授業完了通知を作成
  async createLessonCompletedNotification(
    tutorId: string,
    studentId: string,
    studentName: string,
    subject: string,
    amount: number,
    lessonId: string,
  ): Promise<void> {
    await this.createNotification(
      tutorId,
      'payment_received',
      '授業料受取',
      `${studentName}さんとの${subject}授業が完了し、${amount}コインを受け取りました`,
      lessonId,
      'payment',
    );
  }

  // メッセージ受信通知を作成
  async createMessageNotification(
    receiverId: string,
    senderId: string,
    senderName: string,
    messageId: string,
  ): Promise<void> {
    await this.createNotification(
      receiverId,
      'message_received',
      '新着メッセージ',
      `${senderName}さんからメッセージが届きました`,
      messageId,
      'message',
    );
  }
}

// 通知データをmockDbに追加
declare module './data' {
  interface MockDb {
    notifications?: Notification[];
  }
}

// シングルトンインスタンスをエクスポート
export const mockNotificationService = new MockNotificationService();
