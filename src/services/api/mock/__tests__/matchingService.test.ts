import { COIN_CONSTANTS } from '@/constants/coinPlans';

const VALID_MESSAGE = 'この申請メッセージは20文字以上で丁寧に記載されています。';

describe('MockMatchingService', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_API_MODE = 'mock';
    process.env.EXPO_PUBLIC_USE_MOCK = 'true';
  });

  const setup = () => {
    const dataModule =
      require('@/services/api/mock/data') as typeof import('@/services/api/mock/data');
    const matchingModule =
      require('@/services/api/mock/matchingService') as typeof import('@/services/api/mock/matchingService');
    return {
      mockDb: dataModule.mockDb,
      matchingService: new matchingModule.MockMatchingService(),
    };
  };

  it('有効な申請はpendingで登録されコインを差し引く', async () => {
    const { mockDb, matchingService } = setup();
    const student = mockDb.students[0];
    const tutor = mockDb.tutors[0];
    const beforeCoins = student.coins;
    const beforeMatchCount = mockDb.matchRequests.length;
    const beforeNotificationCount = mockDb.notifications.length;

    const result = await matchingService.sendMatchRequest(
      student.id,
      tutor.id,
      VALID_MESSAGE,
      '週末希望',
    );

    expect(result.success).toBe(true);
    expect(result.data.status).toBe('pending');
    expect(student.coins).toBe(beforeCoins - COIN_CONSTANTS.MATCHING_COST);
    expect(mockDb.matchRequests.length).toBe(beforeMatchCount + 1);
    expect(mockDb.notifications.length).toBe(beforeNotificationCount + 1);
    expect(mockDb.notifications.at(-1)?.user_id).toBe(tutor.id);
  });

  it('メッセージが短い場合はエラーで処理されない', async () => {
    const { mockDb, matchingService } = setup();
    const student = mockDb.students[0];
    const tutor = mockDb.tutors[0];
    const beforeCoins = student.coins;

    const result = await matchingService.sendMatchRequest(
      student.id,
      tutor.id,
      '短いメッセージです',
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('20文字以上');
    expect(student.coins).toBe(beforeCoins);
  });

  it('コイン不足の場合はエラーを返し残高は変わらない', async () => {
    const { mockDb, matchingService } = setup();
    const student = mockDb.students.find((s) => s.id === 'student-2') ?? mockDb.students[0];
    const tutor = mockDb.tutors.find((t) => t.id === '3') ?? mockDb.tutors[0];
    student.coins = COIN_CONSTANTS.MATCHING_COST - 10;

    const result = await matchingService.sendMatchRequest(student.id, tutor.id, VALID_MESSAGE);

    expect(result.success).toBe(false);
    expect(result.error).toContain('コインが不足しています');
    expect(student.coins).toBe(COIN_CONSTANTS.MATCHING_COST - 10);
  });

  it('存在しない先輩への申請は失敗する', async () => {
    const { mockDb, matchingService } = setup();
    const student = mockDb.students[0];

    const result = await matchingService.sendMatchRequest(
      student.id,
      'missing-tutor',
      VALID_MESSAGE,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('家庭教師が見つかりません');
  });

  it('同じ組み合わせに対する重複pending申請は拒否される', async () => {
    const { mockDb, matchingService } = setup();
    const student = mockDb.students[1];
    const tutor = mockDb.tutors[2];

    const first = await matchingService.sendMatchRequest(student.id, tutor.id, VALID_MESSAGE);
    expect(first.success).toBe(true);
    const coinsAfterFirst = mockDb.students.find((s) => s.id === student.id)?.coins ?? 0;

    const second = await matchingService.sendMatchRequest(student.id, tutor.id, VALID_MESSAGE);
    expect(second.success).toBe(false);
    expect(second.error).toContain('既に送信されています');
    expect(mockDb.students.find((s) => s.id === student.id)?.coins).toBe(coinsAfterFirst);
  });

  it('getStudentMatchRequestsで期限切れをexpiredへ遷移させる', async () => {
    const { mockDb, matchingService } = setup();
    const pending = mockDb.matchRequests.find((req) => req.status === 'pending');
    expect(pending).toBeDefined();
    if (!pending) return;

    pending.expires_at = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const result = await matchingService.getStudentMatchRequests(pending.student_id);
    expect(result.success).toBe(true);
    const target = result.data.find((req) => req.id === pending.id);
    expect(target?.status).toBe('expired');
  });

  it('承認処理でステータス更新とチャット作成・通知が行われる', async () => {
    const { mockDb, matchingService } = setup();
    const student = mockDb.students[0];
    const tutor = mockDb.tutors[0];

    const createResult = await matchingService.sendMatchRequest(
      student.id,
      tutor.id,
      VALID_MESSAGE,
    );
    expect(createResult.success).toBe(true);
    const matchId = createResult.data.id;
    const beforeChatRooms = mockDb.chatRooms.length;
    const beforeNotifications = mockDb.notifications.length;

    const approve = await matchingService.approveMatchRequest(matchId);
    expect(approve.success).toBe(true);
    expect(approve.data.status).toBe('approved');
    expect(mockDb.chatRooms.length).toBe(beforeChatRooms + 1);
    expect(mockDb.notifications.length).toBe(beforeNotifications + 1);
    expect(mockDb.notifications.at(-1)?.user_id).toBe(student.id);
  });

  it('拒否処理で返金・通知が行われる', async () => {
    const { mockDb, matchingService } = setup();
    const student = mockDb.students.find((s) => s.id === 'student-2') ?? mockDb.students[0];
    const tutor = mockDb.tutors.find((t) => t.id === '3') ?? mockDb.tutors[0];
    const beforeCoins = student.coins;
    const beforeNotifications = mockDb.notifications.length;

    mockDb.matchRequests = mockDb.matchRequests.filter(
      (req) =>
        !(req.student_id === student.id && req.tutor_id === tutor.id && req.status === 'pending'),
    );

    const createResult = await matchingService.sendMatchRequest(
      student.id,
      tutor.id,
      VALID_MESSAGE,
    );
    expect(createResult.success).toBe(true);
    const afterRequestTxCount = mockDb.coinTransactions.length;
    const afterRequestNotifications = mockDb.notifications.length;

    const reject = await matchingService.rejectMatchRequest(createResult.data.id);
    expect(reject.success).toBe(true);
    expect(reject.data.status).toBe('rejected');
    expect(student.coins).toBe(beforeCoins);
    expect(mockDb.coinTransactions.length).toBe(afterRequestTxCount + 1);
    expect(mockDb.notifications.length).toBe(afterRequestNotifications + 2);
    expect(mockDb.notifications.length).toBe(beforeNotifications + 3);
  });

  it('キャンセル処理で返金・通知が行われる', async () => {
    const { mockDb, matchingService } = setup();
    const student = mockDb.students[1];
    const tutor = mockDb.tutors[0];
    const beforeCoins = student.coins;
    const beforeNotifications = mockDb.notifications.length;

    mockDb.matchRequests = mockDb.matchRequests.filter(
      (req) =>
        !(req.student_id === student.id && req.tutor_id === tutor.id && req.status === 'pending'),
    );

    const createResult = await matchingService.sendMatchRequest(
      student.id,
      tutor.id,
      VALID_MESSAGE,
    );
    expect(createResult.success).toBe(true);
    const afterRequestNotifications = mockDb.notifications.length;

    const cancel = await matchingService.cancelMatchRequest(createResult.data.id);
    expect(cancel.success).toBe(true);
    expect(cancel.data.status).toBe('cancelled');
    expect(student.coins).toBe(beforeCoins);
    expect(mockDb.notifications.length).toBe(afterRequestNotifications + 2);
    expect(mockDb.notifications.length).toBe(beforeNotifications + 3);
  });
});
