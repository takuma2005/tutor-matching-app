// RealtimeService のモック実装（ポーリングベース）

import type { RealtimeService, NotificationPayload, Lesson } from '../types';
import { mockDb } from './data';

// ユーティリティ: 安全な間隔（ms）
const POLL_INTERVAL_MS = 1000;

class MockRealtimeService implements RealtimeService {
  // ユーザーの通知購読
  subscribeToUserNotifications(
    userId: string,
    callback: (payload: NotificationPayload) => void,
  ): () => void {
    let disposed = false;
    // 既知IDを記憶（重複防止）
    const seen = new Set<string>();

    // 初期ロード時点の通知を既知にする
    if (mockDb.notifications && mockDb.notifications.length > 0) {
      mockDb.notifications.filter((n) => n.user_id === userId).forEach((n) => seen.add(n.id));
    }

    const timer = setInterval(() => {
      if (disposed) return;

      const list = (mockDb.notifications || [])
        .filter((n) => n.user_id === userId)
        // 時系列で安全に逐次発火
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      for (const n of list) {
        if (!seen.has(n.id)) {
          seen.add(n.id);
          const payload: NotificationPayload = {
            type:
              n.type === 'payment_received'
                ? 'payment_success'
                : n.type === 'lesson_request_approved'
                  ? 'lesson_completed' // 近似マッピング（型の都合上）
                  : 'lesson_booked',
            message: n.message,
            data: {
              related_id: n.related_id,
              related_type: n.related_type,
              title: n.title,
            },
            created_at: n.created_at,
          };
          try {
            callback(payload);
          } catch (e) {
            // 購読側のエラーは握りつぶす
            // eslint-disable-next-line no-console
            console.warn('Realtime notification callback error:', e);
          }
        }
      }
    }, POLL_INTERVAL_MS);

    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }

  // 授業更新の購読
  subscribeLessonUpdates(lessonId: string, callback: (lesson: Lesson) => void): () => void {
    let disposed = false;
    let lastUpdatedAt: string | undefined;

    const timer = setInterval(() => {
      if (disposed) return;
      const lesson = mockDb.lessons.find((l) => l.id === lessonId);
      if (!lesson) return;

      if (!lastUpdatedAt) {
        lastUpdatedAt = lesson.updated_at;
        return;
      }

      if (lesson.updated_at !== lastUpdatedAt) {
        lastUpdatedAt = lesson.updated_at;
        try {
          callback({ ...lesson });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Realtime lesson callback error:', e);
        }
      }
    }, POLL_INTERVAL_MS);

    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }
}

export const mockRealtimeService: RealtimeService = new MockRealtimeService();
export default MockRealtimeService;
