import type { NotificationType } from '@/services/api/mock/notificationService';

describe('MockNotificationService', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_API_MODE = 'mock';
    process.env.EXPO_PUBLIC_USE_MOCK = 'true';
  });

  const setup = () => {
    const dataModule =
      require('@/services/api/mock/data') as typeof import('@/services/api/mock/data');
    const serviceModule =
      require('@/services/api/mock/notificationService') as typeof import('@/services/api/mock/notificationService');
    return {
      mockDb: dataModule.mockDb,
      notificationService: serviceModule.mockNotificationService,
    };
  };

  it('通知を作成するとmockDbに保存される', async () => {
    const { mockDb, notificationService } = setup();
    const beforeCount = mockDb.notifications.length;

    const result = await notificationService.createNotification(
      'user-1',
      'match_request_received',
      'タイトル',
      '本文',
      'match-1',
      'match',
    );

    expect(result.success).toBe(true);
    expect(mockDb.notifications.length).toBe(beforeCount + 1);
    expect(mockDb.notifications.at(-1)).toMatchObject({
      user_id: 'user-1',
      type: 'match_request_received' as NotificationType,
      related_id: 'match-1',
    });
  });

  it('ユーザー通知は最新順に制限件数で取得できる', async () => {
    const { mockDb, notificationService } = setup();

    await notificationService.createNotification('user-2', 'message_received', 'A', 'A body');
    await notificationService.createNotification('user-2', 'message_received', 'B', 'B body');
    await notificationService.createNotification('user-2', 'message_received', 'C', 'C body');

    mockDb.notifications[0].created_at = '2024-01-01T00:00:00Z';
    mockDb.notifications[1].created_at = '2024-02-01T00:00:00Z';
    mockDb.notifications[2].created_at = '2024-03-01T00:00:00Z';

    const result = await notificationService.getUserNotifications('user-2', 2);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].title).toBe('C');
    expect(result.data[1].title).toBe('B');
  });

  it('markAsReadで既読状態に変更できる', async () => {
    const { notificationService } = setup();
    const createResult = await notificationService.createNotification(
      'user-3',
      'message_received',
      'テスト',
      '本文',
    );

    const result = await notificationService.markAsRead(createResult.data.id);

    expect(result.success).toBe(true);
    expect(result.data.is_read).toBe(true);
  });

  it('存在しないIDのmarkAsReadはエラーを返す', async () => {
    const { notificationService } = setup();

    const result = await notificationService.markAsRead('missing');

    expect(result.success).toBe(false);
    expect(result.error).toContain('通知が見つかりません');
  });

  it('markAllAsReadは未読件数を返し全て既読にする', async () => {
    const { mockDb, notificationService } = setup();
    await notificationService.createNotification('user-4', 'message_received', 'N1', 'body1');
    await notificationService.createNotification('user-4', 'message_received', 'N2', 'body2');
    mockDb.notifications.push({
      id: 'other-user-notif',
      user_id: 'other',
      type: 'message_received',
      title: 'Other',
      message: 'Other body',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    const result = await notificationService.markAllAsRead('user-4');

    expect(result.success).toBe(true);
    expect(result.data).toBe(2);
    expect(mockDb.notifications.filter((n) => n.user_id === 'user-4').every((n) => n.is_read)).toBe(
      true,
    );
  });

  it('未読件数APIはユーザー単位でカウントする', async () => {
    const { mockDb, notificationService } = setup();
    await notificationService.createNotification('user-5', 'message_received', 'Unread1', 'body');
    const second = await notificationService.createNotification(
      'user-5',
      'message_received',
      'Unread2',
      'body',
    );

    // 手動で1件だけ既読にする
    const target = mockDb.notifications.find((n) => n.id === second.data.id);
    if (target) target.is_read = true;

    const result = await notificationService.getUnreadCount('user-5');

    expect(result.success).toBe(true);
    expect(result.data).toBe(1);
  });
});
