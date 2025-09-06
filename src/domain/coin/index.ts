import { MockCoinGateway } from './mockGateway';
import type { CoinGateway } from './types';

import { API_CONFIG } from '@/services/api/mock';

// In the future, import and return a real gateway here
// import { ProdCoinGateway } from './prodGateway';

export function getCoinGateway(): CoinGateway {
  if (API_CONFIG.USE_MOCK) {
    return new MockCoinGateway();
  }
  // return new ProdCoinGateway();
  return new MockCoinGateway();
}
