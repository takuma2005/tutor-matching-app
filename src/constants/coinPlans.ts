// コイン購入プランの定数定義
// requirements.md に基づく正式プラン（1コイン = 1.25円）

export type CoinPackage = {
  id: string;
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  label?: string;
};

// 1コイン = 1.25円の基準レート
export const COIN_YEN_RATE = 1.25;

// 公式コイン購入プラン（requirements.md準拠）
export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'trial',
    coins: 400,
    price: 490,
    label: 'お試し',
  },
  {
    id: 'popular',
    coins: 1250,
    price: 1480,
    popular: true,
    label: '人気No.1',
  },
  {
    id: 'monthly',
    coins: 4300,
    price: 4900,
    label: '1ヶ月分',
  },
  {
    id: 'value',
    coins: 8800,
    price: 9800,
    label: 'お得パック',
  },
];

// コイン関連の基本定数
export const COIN_CONSTANTS = {
  // マッチング料（初回マッチ成立時のみ）
  MATCHING_COST: 300,

  // 授業料の最低料金（全カテゴリ統一）
  MIN_HOURLY_RATE: 1200, // ¥1,500相当

  // 出金手数料
  WITHDRAWAL_FEE_BELOW_100K: 300,
  WITHDRAWAL_FEE_ABOVE_100K: 0,

  // プラットフォーム収益率
  PLATFORM_FEE_RATE: 0.15, // 15%

  // コイン有効期限（MVP: 無期限）
  EXPIRY_DAYS: null,
} as const;

// 料金計算ユーティリティ
export const calculateCoinValue = (coins: number): number => {
  return coins * COIN_YEN_RATE;
};

export const calculateCoinsFromYen = (yen: number): number => {
  return Math.round(yen / COIN_YEN_RATE);
};

// お得度計算
export const calculateSavings = (
  packagePlan: CoinPackage,
): {
  basePrice: number;
  savings: number;
  savingsPercent: number;
} => {
  const basePrice = Math.round(packagePlan.coins * COIN_YEN_RATE);
  const actualPrice = packagePlan.price;
  const savings = basePrice - actualPrice;
  const savingsPercent = savings > 0 ? Math.round((savings / basePrice) * 100) : 0;

  return {
    basePrice,
    savings,
    savingsPercent,
  };
};
