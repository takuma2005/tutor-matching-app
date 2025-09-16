import { COIN_CONSTANTS } from '@/constants/coinPlans';

describe('CoinManager', () => {
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
    const managerModule =
      require('@/domain/coin/coinManager') as typeof import('@/domain/coin/coinManager');
    const eventsModule =
      require('@/domain/coin/coinEvents') as typeof import('@/domain/coin/coinEvents');
    return {
      mockDb: dataModule.mockDb,
      CoinManager: managerModule.CoinManager,
      coinEvents: eventsModule.coinEvents,
    };
  };

  it('syncBalanceで取得した残高をイベント経由で通知する', async () => {
    const { mockDb, CoinManager, coinEvents } = setup();
    const studentId = mockDb.students[0].id;
    const listener = jest.fn();
    const unsubscribe = coinEvents.onBalanceChanged(listener);

    const balance = await CoinManager.syncBalance(studentId);

    expect(balance).toBe(mockDb.students[0].coins);
    expect(listener).toHaveBeenCalledWith(balance);
    unsubscribe();
  });

  it('purchaseは購入後の残高とイベントを返す', async () => {
    const { mockDb, CoinManager, coinEvents } = setup();
    const studentId = mockDb.students[0].id;
    const beforeBalance = mockDb.students[0].coins;
    const listener = jest.fn();
    const unsubscribe = coinEvents.onBalanceChanged(listener);

    const balance = await CoinManager.purchase(studentId, 300, 'pm_card_visa');

    expect(balance).toBe(beforeBalance + 300);
    expect(mockDb.students[0].coins).toBe(beforeBalance + 300);
    expect(listener).toHaveBeenCalledWith(beforeBalance + 300);
    unsubscribe();
  });

  it('applyDeltaで減算する場合も残高と取引が更新される', async () => {
    const { mockDb, CoinManager, coinEvents } = setup();
    const studentId = mockDb.students[0].id;
    const beforeBalance = mockDb.students[0].coins;
    const beforeTxCount = mockDb.coinTransactions.length;
    const listener = jest.fn();
    const unsubscribe = coinEvents.onBalanceChanged(listener);

    const balance = await CoinManager.applyDelta(
      studentId,
      -COIN_CONSTANTS.MATCHING_COST,
      'lesson',
      '授業テスト',
    );

    expect(balance).toBe(beforeBalance - COIN_CONSTANTS.MATCHING_COST);
    expect(mockDb.students[0].coins).toBe(beforeBalance - COIN_CONSTANTS.MATCHING_COST);
    expect(mockDb.coinTransactions.length).toBe(beforeTxCount + 1);
    expect(mockDb.coinTransactions.at(-1)).toMatchObject({
      user_id: studentId,
      type: 'spend',
      description: '授業テスト',
    });
    expect(listener).toHaveBeenCalledWith(beforeBalance - COIN_CONSTANTS.MATCHING_COST);
    unsubscribe();
  });

  it('applyDeltaでボーナス付与した場合に自動説明文が付与される', async () => {
    const { mockDb, CoinManager } = setup();
    const studentId = mockDb.students[0].id;
    const beforeTxCount = mockDb.coinTransactions.length;

    await CoinManager.applyDelta(studentId, 120, 'bonus');

    expect(mockDb.coinTransactions.length).toBe(beforeTxCount + 1);
    const lastTx = mockDb.coinTransactions.at(-1);
    expect(lastTx?.description).toContain('ボーナス付与');
    expect(lastTx?.amount).toBe(120);
  });
});
