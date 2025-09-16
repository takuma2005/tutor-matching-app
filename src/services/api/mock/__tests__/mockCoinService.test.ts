import type { CoinTransaction } from '@/services/api/types';

describe('MockCoinService', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_API_MODE = 'mock';
    process.env.EXPO_PUBLIC_USE_MOCK = 'true';
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const setup = () => {
    const dataModule =
      require('@/services/api/mock/data') as typeof import('@/services/api/mock/data');
    jest.spyOn(dataModule, 'delay').mockImplementation(() => Promise.resolve());
    const serviceModule =
      require('@/services/api/mock/coinService') as typeof import('@/services/api/mock/coinService');
    return {
      mockDb: dataModule.mockDb,
      mockCoinService: serviceModule.mockCoinService,
    };
  };

  it('既存ユーザーの残高を取得できる', async () => {
    const { mockDb, mockCoinService } = setup();
    const studentId = mockDb.students[0]?.id ?? 'student-1';
    const result = await mockCoinService.getBalance(studentId);
    expect(result.success).toBe(true);
    expect(result.data.balance).toBe(mockDb.students[0].coins);
  });

  it('存在しないユーザーの残高取得は失敗する', async () => {
    const { mockCoinService } = setup();
    const result = await mockCoinService.getBalance('unknown-user');
    expect(result.success).toBe(false);
    expect(result.error).toBe('ユーザーが見つかりません');
  });

  it('正しい購入リクエストで残高と取引が更新される', async () => {
    const { mockDb, mockCoinService } = setup();
    const studentId = mockDb.students[0].id;
    const beforeBalance = mockDb.students[0].coins;
    const beforeTxCount = mockDb.coinTransactions.length;

    const result = await mockCoinService.purchaseCoins(studentId, 200, 'pm_card_visa');

    expect(result.success).toBe(true);
    expect(mockDb.students[0].coins).toBe(beforeBalance + 200);
    expect(mockDb.coinTransactions.length).toBe(beforeTxCount + 1);
    expect(mockDb.coinTransactions.at(-1)?.type).toBe('purchase');
  });

  it('0以下の購入金額は拒否され残高も変わらない', async () => {
    const { mockDb, mockCoinService } = setup();
    const studentId = mockDb.students[0].id;
    const beforeBalance = mockDb.students[0].coins;
    const beforeTxCount = mockDb.coinTransactions.length;

    const result = await mockCoinService.purchaseCoins(studentId, 0, 'pm_card_visa');

    expect(result.success).toBe(false);
    expect(mockDb.students[0].coins).toBe(beforeBalance);
    expect(mockDb.coinTransactions.length).toBe(beforeTxCount);
  });

  it('存在しないユーザーの購入はエラーになる', async () => {
    const { mockCoinService, mockDb } = setup();
    const beforeTxCount = mockDb.coinTransactions.length;

    const result = await mockCoinService.purchaseCoins('ghost', 100, 'pm_card_visa');

    expect(result.success).toBe(false);
    expect(result.error).toBe('ユーザーが見つかりません');
    expect(mockDb.coinTransactions.length).toBe(beforeTxCount);
  });

  it('カード拒否IDではエラーが返る', async () => {
    const { mockDb, mockCoinService } = setup();
    const studentId = mockDb.students[0].id;
    const beforeBalance = mockDb.students[0].coins;

    const result = await mockCoinService.purchaseCoins(studentId, 150, 'pm_card_declined');

    expect(result.success).toBe(false);
    expect(result.error).toContain('カードが拒否されました');
    expect(mockDb.students[0].coins).toBe(beforeBalance);
  });

  it('取引履歴はユーザー別にフィルタされ最新順で返る', async () => {
    const { mockDb, mockCoinService } = setup();
    const studentId = mockDb.students[0].id;

    const result = await mockCoinService.getTransactionHistory(studentId, 1, 2);

    expect(result.success).toBe(true);
    expect(result.data.every((tx) => tx.user_id === studentId)).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.pagination.has_more).toBe(true);
    const [first, second] = result.data;
    if (first && second) {
      expect(new Date(first.created_at).getTime()).toBeGreaterThanOrEqual(
        new Date(second.created_at).getTime(),
      );
    }
  });

  it('addMockTransactionは台帳と残高を更新する', async () => {
    const { mockDb, mockCoinService } = await setup();
    const studentId = mockDb.students[0].id;
    const beforeBalance = mockDb.students[0].coins;
    const beforeTxCount = mockDb.coinTransactions.length;

    await mockCoinService.addMockTransaction({
      user_id: studentId,
      amount: -50,
      type: 'spend',
      description: 'テスト支出',
    } as Omit<CoinTransaction, 'id' | 'created_at'>);

    expect(mockDb.students[0].coins).toBe(beforeBalance - 50);
    expect(mockDb.coinTransactions.length).toBe(beforeTxCount + 1);
    expect(mockCoinService.getMockTransactions().at(-1)?.description).toBe('テスト支出');
  });
});
