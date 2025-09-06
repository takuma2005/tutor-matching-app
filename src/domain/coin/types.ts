// Domain types and gateway contract for coin operations

import type { CoinTransaction } from '@/services/api/types';

export type ChargeReason =
  | 'purchase' // purchasing coins (positive)
  | 'lesson' // paying for a lesson (negative)
  | 'matching' // matching request fee (negative)
  | 'bonus' // bonus/top-up (positive)
  | 'adjust'; // manual adjustment

export interface CoinGateway {
  // Query current balance for a user
  getBalance(userId: string): Promise<number>;

  // Purchase coins (top-up)
  purchase(userId: string, amount: number, paymentMethodId: string): Promise<void>;

  // Apply a delta to balance and persist a transaction (positive or negative)
  applyDelta(
    userId: string,
    amount: number,
    reason: ChargeReason,
    description?: string,
  ): Promise<void>;

  // Fetch transaction history (optional for UI)
  getHistory(userId: string, page?: number, limit?: number): Promise<CoinTransaction[]>;
}
