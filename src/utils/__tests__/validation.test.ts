import {
  COIN_CONSTANTS,
  COIN_PACKAGES,
  calculateCoinValue,
  calculateSavings,
} from '@/constants/coinPlans';
import {
  formatHourlyRate,
  validateHourlyRate,
  validateHourlyRateRealtime,
  validateStudentProfile,
  validateTutorProfile,
} from '@/utils/validation';

describe('validateHourlyRate', () => {
  it('下限未満の値を拒否してエラーメッセージを返す', () => {
    const result = validateHourlyRate(COIN_CONSTANTS.MIN_HOURLY_RATE - 1);
    expect(result.success).toBe(false);
    expect(result.errors?.hourlyRate).toContain(`${COIN_CONSTANTS.MIN_HOURLY_RATE}`);
  });

  it('下限ちょうどの値を受け入れて同じ値を返す', () => {
    const result = validateHourlyRate(COIN_CONSTANTS.MIN_HOURLY_RATE);
    expect(result.success).toBe(true);
    expect(result.data).toBe(COIN_CONSTANTS.MIN_HOURLY_RATE);
  });

  it('上限を超える値を拒否して50,000コイン以下を求める', () => {
    const result = validateHourlyRate(50001);
    expect(result.success).toBe(false);
    expect(result.errors?.hourlyRate).toContain('50,000コイン以下');
  });
});

describe('validateTutorProfile', () => {
  it('完全なプロフィールを正常に通過させる', () => {
    const profile = {
      name: '佐藤太郎',
      school: '東京大学',
      grade: '大学2年',
      bio: '数学が得意です',
      hourlyRate: COIN_CONSTANTS.MIN_HOURLY_RATE + 300,
      subjects: ['数学'],
      onlineAvailable: true,
    };

    const result = validateTutorProfile(profile);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject(profile);
  });

  it('必須項目の欠落と料金下限違反をすべて検知する', () => {
    const profile = {
      name: '',
      school: '',
      grade: '',
      bio: '',
      hourlyRate: COIN_CONSTANTS.MIN_HOURLY_RATE - 100,
      subjects: [] as string[],
      onlineAvailable: false,
    };

    const result = validateTutorProfile(profile);
    expect(result.success).toBe(false);
    expect(result.errors).toMatchObject({
      name: expect.any(String),
      school: expect.any(String),
      grade: expect.any(String),
      hourlyRate: expect.stringContaining(`${COIN_CONSTANTS.MIN_HOURLY_RATE}`),
      subjects: expect.stringContaining('少なくとも1つ'),
    });
  });
});

describe('validateStudentProfile', () => {
  it('正しい学生プロフィールを検証する', () => {
    const profile = {
      name: '山田花子',
      school: '都立青山高校',
      grade: '高校2年',
      bio: '英語をがんばっています',
      interestedSubjects: ['英語', '数学'],
    };

    const result = validateStudentProfile(profile);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject(profile);
  });

  it('必須フィールド欠落を網羅的に検知する', () => {
    const profile = {
      name: '',
      school: '',
      grade: '',
      interestedSubjects: [] as string[],
    };

    const result = validateStudentProfile(profile);
    expect(result.success).toBe(false);
    expect(result.errors).toMatchObject({
      name: expect.any(String),
      school: expect.any(String),
      grade: expect.any(String),
      interestedSubjects: expect.stringContaining('少なくとも1つ'),
    });
  });
});

describe('validateHourlyRateRealtime', () => {
  it('空文字はエラーを表示しない', () => {
    expect(validateHourlyRateRealtime('')).toBeNull();
  });

  it('数値変換できない入力にはメッセージを表示する', () => {
    expect(validateHourlyRateRealtime('abc')).toBe('数値を入力してください');
  });

  it('下限未満の数値文字列は料金下限のメッセージを返す', () => {
    const error = validateHourlyRateRealtime(String(COIN_CONSTANTS.MIN_HOURLY_RATE - 50));
    expect(error).toContain(`${COIN_CONSTANTS.MIN_HOURLY_RATE}`);
  });

  it('下限以上の数値文字列はエラーを返さない', () => {
    expect(validateHourlyRateRealtime(String(COIN_CONSTANTS.MIN_HOURLY_RATE + 200))).toBeNull();
  });
});

describe('formatHourlyRate', () => {
  it('下限値をフォーマットして有効フラグを返す', () => {
    const formatted = formatHourlyRate(COIN_CONSTANTS.MIN_HOURLY_RATE);
    expect(formatted.coinText).toBe(`${COIN_CONSTANTS.MIN_HOURLY_RATE.toLocaleString()} コイン/時`);
    expect(formatted.yenText).toBe(
      `約 ${Math.round(calculateCoinValue(COIN_CONSTANTS.MIN_HOURLY_RATE)).toLocaleString()} 円相当`,
    );
    expect(formatted.isValid).toBe(true);
  });

  it('下限未満の値はisValid=falseになる', () => {
    const formatted = formatHourlyRate(COIN_CONSTANTS.MIN_HOURLY_RATE - 100);
    expect(formatted.isValid).toBe(false);
  });
});

describe('calculateSavings', () => {
  it('コインパッケージのお得度を正しく計算する', () => {
    const targetPlan = COIN_PACKAGES.find((plan) => plan.id === 'value');
    expect(targetPlan).toBeDefined();
    if (!targetPlan) return;

    const result = calculateSavings(targetPlan);
    const basePrice = Math.round(targetPlan.coins * 1.25);
    expect(result.basePrice).toBe(basePrice);
    expect(result.savings).toBe(basePrice - targetPlan.price);
    expect(result.savingsPercent).toBe(
      result.savings > 0 ? Math.round((result.savings / basePrice) * 100) : 0,
    );
  });
});
