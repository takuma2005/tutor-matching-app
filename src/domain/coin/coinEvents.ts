// Lightweight event hub for coin-related updates

export type BalanceChangedHandler = (newBalance: number) => void;

class CoinEvents {
  private balanceListeners: Set<BalanceChangedHandler> = new Set();

  onBalanceChanged(handler: BalanceChangedHandler) {
    this.balanceListeners.add(handler);
    return () => this.balanceListeners.delete(handler);
  }

  emitBalanceChanged(newBalance: number) {
    for (const h of this.balanceListeners) h(newBalance);
  }
}

export const coinEvents = new CoinEvents();
export default coinEvents;
