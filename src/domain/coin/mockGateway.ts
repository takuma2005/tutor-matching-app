import type { CoinGateway, ChargeReason } from './types';

import { mockCoinService, mockStudentService } from '@/services/api/mock';
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
    // Use test helper to add a synthetic transaction and update mock balance
    await mockCoinService.addMockTransaction({
      user_id: userId,
      amount,
      type:
        reason === 'purchase'
          ? 'purchase'
          : reason === 'bonus'
            ? 'bonus'
            : reason === 'lesson' || reason === 'matching'
              ? 'lesson'
              : 'purchase', // fallback
      description: description ?? this.defaultDescription(amount, reason),
      stripe_payment_intent_id: undefined as any,
    });
  }

  async getHistory(userId: string, page = 1, limit = 20): Promise<CoinTransaction[]> {
    const res = await mockCoinService.getTransactionHistory(userId, page, limit);
    if (!res.success) return [];
    return res.data;
  }

  private defaultDescription(amount: number, reason: ChargeReason) {
    if (reason === 'purchase') return `コイン購入 (${amount}コイン)`;
    if (reason === 'bonus') return `ボーナス付与 (+${amount}コイン)`;
    if (reason === 'lesson') return `授業支払い (${amount}コイン)`;
    if (reason === 'matching') return `マッチング申請 (${amount}コイン)`;
    return `調整 (${amount}コイン)`;
  }
}
