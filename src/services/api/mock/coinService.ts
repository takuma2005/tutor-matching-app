// コインサービスのモック実装（台帳を mockDb に一元化）

import { CoinService, CoinTransaction, ApiResponse, PaginatedResponse } from '../types';
import { mockDb, delay, generateId, getCurrentTimestamp } from './data';

class MockCoinService implements CoinService {
  async getBalance(userId: string): Promise<ApiResponse<{ balance: number }>> {
    await delay(200);

    const student = mockDb.students.find((s) => s.id === userId);

    if (!student) {
      return {
        data: null as unknown as { balance: number },
        success: false,
        error: 'ユーザーが見つかりません',
      };
    }

    return {
      data: { balance: student.coins },
      success: true,
    };
  }

  async purchaseCoins(
    userId: string,
    amount: number,
    paymentMethodId: string,
  ): Promise<ApiResponse<CoinTransaction>> {
    await delay(1200); // 決済処理時間をシミュレート

    if (amount <= 0) {
      return {
        data: null as unknown as CoinTransaction,
        success: false,
        error: '購入金額は0より大きい必要があります',
      };
    }

    const student = mockDb.students.find((s) => s.id === userId);
    if (!student) {
      return {
        data: null as unknown as CoinTransaction,
        success: false,
        error: 'ユーザーが見つかりません',
      };
    }

    // Stripe決済をシミュレート
    if (paymentMethodId.startsWith('pm_card_')) {
      // カード決済のシミュレーション
      if (paymentMethodId === 'pm_card_declined') {
        return {
          data: null as unknown as CoinTransaction,
          success: false,
          error: 'カードが拒否されました。別のカードを試してください',
        };
      }
    }

    // 取引レコードを作成
    const transaction: CoinTransaction = {
      id: `tx-${generateId()}`,
      user_id: userId,
      amount,
      type: 'purchase',
      description: `コイン購入 (${amount}コイン)`,
      stripe_payment_intent_id: `pi_${generateId()}`,
      created_at: getCurrentTimestamp(),
    };

    // 台帳へ記録（mockDb に一元化）
    mockDb.coinTransactions.push(transaction);

    // ユーザーのコインを更新
    const studentIndex = mockDb.students.findIndex((s) => s.id === userId);
    mockDb.students[studentIndex].coins += amount;

    return {
      data: transaction,
      success: true,
    };
  }

  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<CoinTransaction>> {
    await delay(300);

    // ユーザーの取引のみフィルタリング（mockDb を参照）
    const userTransactions = mockDb.coinTransactions.filter((tx) => tx.user_id === userId);

    // 日付順でソート（新しい順）
    userTransactions.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    // ページネーション
    const total = userTransactions.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = userTransactions.slice(startIndex, endIndex);

    return {
      data: paginatedTransactions,
      success: true,
      pagination: {
        page,
        limit,
        total,
        has_more: endIndex < total,
      },
    };
  }

  // テスト用メソッド（本番では削除）
  async addMockTransaction(transaction: Omit<CoinTransaction, 'id' | 'created_at'>): Promise<void> {
    const fullTransaction: CoinTransaction = {
      ...transaction,
      id: `tx-${generateId()}`,
      created_at: getCurrentTimestamp(),
    };

    // 台帳へ追加
    mockDb.coinTransactions.push(fullTransaction);

    // ユーザーのコイン残高を更新
    const studentIndex = mockDb.students.findIndex((s) => s.id === transaction.user_id);
    if (studentIndex !== -1) {
      mockDb.students[studentIndex].coins += transaction.amount;
    }
  }

  getMockTransactions(): CoinTransaction[] {
    return [...mockDb.coinTransactions];
  }

  // コイン購入パッケージの定義（constants/coinPlans.ts から取得）
  getCoinPackages() {
    // コンスタンツファイルからインポートすることを推奨
    const { COIN_PACKAGES } = require('@/constants/coinPlans');
    return COIN_PACKAGES;
  }
}

export const mockCoinService = new MockCoinService();
export default MockCoinService;
