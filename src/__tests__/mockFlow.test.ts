import { mockDb } from '@/services/api/mock';
import { MockEscrowService } from '@/services/api/mock/escrowService';
import { MockMatchingService } from '@/services/api/mock/matchingService';
import type { Lesson } from '@/services/api/types';

// 簡易テスト：matching → approve → lesson 完了までのHappyPathと通知・台帳の基本確認

describe('Mock flow: matching -> approve -> lesson complete', () => {
  it('should create match, approve, and generate notifications', async () => {
    const matching = new MockMatchingService();
    const escrow = new MockEscrowService();

    // arrange: counters
    const beforeNotifs = (mockDb.notifications || []).length;

    // act: send match request
    const res = await matching.sendMatchRequest(
      'student-1',
      '1',
      'メッセージ20文字以上ありますよね、テスト用です。',
    );
    expect(res.success).toBeTruthy();

    const match = res.data;
    expect(match.status).toBe('pending');

    // approve
    const appr = await matching.approveMatchRequest(match.id);
    expect(appr.success).toBeTruthy();
    expect(appr.data.status).toBe('approved');

    // lesson mock: 対象の lesson を作って完了（擬似）
    const lessonId = 'lesson-test-1';
    mockDb.lessons.push({
      id: lessonId,
      tutor_id: '1',
      student_id: 'student-1',
      subject: '数学',
      status: 'approved',
      scheduled_at: new Date().toISOString(),
      duration_minutes: 60,
      coin_cost: 120,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Lesson);

    const complete = await escrow.completeLesson(lessonId);
    expect(complete.success).toBeTruthy();
    expect(complete.data.status).toBe('completed');

    // notify increased
    const afterNotifs = (mockDb.notifications || []).length;
    expect(afterNotifs).toBeGreaterThan(beforeNotifs);
  });
});
