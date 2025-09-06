import coinEvents from './coinEvents';
import { getCoinGateway } from './index';
import type { ChargeReason } from './types';

const gateway = getCoinGateway();

export const CoinManager = {
  async syncBalance(userId: string) {
    const bal = await gateway.getBalance(userId);
    coinEvents.emitBalanceChanged(bal);
    return bal;
  },

  async purchase(userId: string, amount: number, paymentMethodId: string) {
    await gateway.purchase(userId, amount, paymentMethodId);
    const bal = await gateway.getBalance(userId);
    coinEvents.emitBalanceChanged(bal);
    return bal;
  },

  async applyDelta(userId: string, amount: number, reason: ChargeReason, description?: string) {
    await gateway.applyDelta(userId, amount, reason, description);
    const bal = await gateway.getBalance(userId);
    coinEvents.emitBalanceChanged(bal);
    return bal;
  },
};
