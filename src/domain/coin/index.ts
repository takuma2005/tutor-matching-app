import { MockCoinGateway } from './mockGateway';
import { ProdCoinGateway } from './prodGateway';
import type { CoinGateway } from './types';

import { API_CONFIG } from '@/services/api/mock';

// In the future, import and return a real gateway here

export function getCoinGateway(): CoinGateway {
  if (API_CONFIG.USE_MOCK) {
    return new MockCoinGateway();
  }
  return new ProdCoinGateway();
}
