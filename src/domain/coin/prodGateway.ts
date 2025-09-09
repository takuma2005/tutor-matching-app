import type { CoinGateway, ChargeReason } from './types';

import { getApiClient } from '@/services/api/mock';
import type { CoinTransaction } from '@/services/api/types';

// Production gateway skeleton.
// Replace method bodies with real API integrations (e.g., Supabase/Stripe) later.
export class ProdCoinGateway implements CoinGateway {
  async getBalance(userId: string): Promise<number> {
    const api = getApiClient();
    const res = await api.coin.getBalance(userId);
    if (res.success) return res.data.balance;
    throw new Error('Failed to fetch balance');
  }

  async purchase(userId: string, amount: number, paymentMethodId: string): Promise<void> {
    const api = getApiClient();
    const res = await api.coin.purchaseCoins(userId, amount, paymentMethodId);
    if (!res.success) throw new Error('Failed to purchase coins');
  }

  async applyDelta(
    _userId: string,
    _amount: number,
    _reason: ChargeReason,
    _description?: string,
  ): Promise<void> {
    // TODO: implement with production API (e.g., escrow hold/capture/refund or ledger adjustment)
    // For now, throw to make it explicit during integration testing.
    throw new Error('applyDelta is not implemented for ProdCoinGateway yet');
  }

  async getHistory(userId: string, page = 1, limit = 20): Promise<CoinTransaction[]> {
    const api = getApiClient();
    const res = await api.coin.getTransactionHistory(userId, page, limit);
    if (!res.success) throw new Error('Failed to fetch transactions');
    return res.data;
  }
}
