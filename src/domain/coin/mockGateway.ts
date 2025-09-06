import type { CoinGateway, ChargeReason } from './types';

import { mockCoinService } from '@/services/api/mock';
import type { CoinTransaction } from '@/services/api/types';

export class MockCoinGateway implements CoinGateway {
  async getBalance(userId: string): Promise<number> {
    const res = await mockCoinService.getBalance(userId);
    if (res.success) return res.data.balance;
    return 0;
  }

  async purchase(userId: string, amount: number, paymentMethodId: string): Promise<void> {
    const res = await mockCoinService.purchaseCoins(userId, amount, paymentMethodId);
    if (!res.success) throw new Error(res.error ?? 'purchase failed');
  }

  async applyDelta(
    userId: string,
    amount: number,
    reason: ChargeReason,
    description?: string,
  ): Promise<void> {
    // Map to unified transaction types: purchase | spend | refund
    const txType: CoinTransaction['type'] =
      amount >= 0 ? (reason === 'purchase' ? 'purchase' : 'refund') : 'spend';

    await mockCoinService.addMockTransaction({
      user_id: userId,
      amount,
      type: txType,
      description: description ?? this.defaultDescription(amount, reason),
    });
  }

  async getHistory(userId: string, page = 1, limit = 20): Promise<CoinTransaction[]> {
    const res = await mockCoinService.getTransactionHistory(userId, page, limit);
    if (!res.success) return [];
    return res.data;
  }

  private defaultDescription(amount: number, reason: ChargeReason) {
    const abs = Math.abs(amount);
    if (reason === 'purchase') return `コイン購入 (+${abs}コイン)`;
    if (reason === 'bonus') return `ボーナス付与 (+${abs}コイン)`;
    if (reason === 'lesson') return `授業支払い (-${abs}コイン)`;
    if (reason === 'matching') return `マッチング申請 (-${abs}コイン)`;
    return `${amount >= 0 ? '返金/調整' : '支出/調整'} (${amount >= 0 ? '+' : '-'}${abs}コイン)`;
  }
}
