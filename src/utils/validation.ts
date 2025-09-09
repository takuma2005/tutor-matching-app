// プロフィール料金バリデーション機能
// Zod スキーマベースの入力検証

import { z } from 'zod';

import { COIN_CONSTANTS, calculateCoinValue } from '@/constants/coinPlans';

// 料金バリデーション用のZodスキーマ
export const hourlyRateSchema = z
  .number({
    message: '時給は数値で入力してください',
  })
  .min(COIN_CONSTANTS.MIN_HOURLY_RATE, {
    message: `時給は最低 ${COIN_CONSTANTS.MIN_HOURLY_RATE} コイン（約 ${Math.round(calculateCoinValue(COIN_CONSTANTS.MIN_HOURLY_RATE))} 円相当）以上で設定してください`,
  })
  .max(50000, {
    message: '時給は50,000コイン以下で設定してください',
  });

// プロフィール全体のバリデーションスキーマ（先輩用）
export const tutorProfileSchema = z.object({
  name: z.string().min(1, { message: '名前を入力してください' }),
  school: z.string().min(1, { message: '学校名を入力してください' }),
  grade: z.string().min(1, { message: '学年を選択してください' }),
  bio: z.string().optional(),
  hourlyRate: hourlyRateSchema,
  subjects: z.array(z.string()).min(1, { message: '少なくとも1つの科目を選択してください' }),
  onlineAvailable: z.boolean().default(false),
});

// 学生用のプロフィールスキーマ
export const studentProfileSchema = z.object({
  name: z.string().min(1, { message: '名前を入力してください' }),
  school: z.string().min(1, { message: '学校名を入力してください' }),
  grade: z.string().min(1, { message: '学年を選択してください' }),
  bio: z.string().optional(),
  interestedSubjects: z
    .array(z.string())
    .min(1, { message: '少なくとも1つの科目を選択してください' }),
});

// バリデーション結果の型
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: { [key: string]: string };
};

// 料金バリデーション関数
export const validateHourlyRate = (rate: number): ValidationResult<number> => {
  try {
    const validatedRate = hourlyRateSchema.parse(rate);
    return {
      success: true,
      data: validatedRate,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: {
          hourlyRate: error.issues[0]?.message || '料金の設定に問題があります',
        },
      };
    }
    return {
      success: false,
      errors: {
        hourlyRate: '料金の検証中にエラーが発生しました',
      },
    };
  }
};

// 先輩プロフィール全体のバリデーション
export const validateTutorProfile = (
  profile: unknown,
): ValidationResult<z.infer<typeof tutorProfileSchema>> => {
  try {
    const validatedProfile = tutorProfileSchema.parse(profile);
    return {
      success: true,
      data: validatedProfile,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: { [key: string]: string } = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: {
        general: 'プロフィールの検証中にエラーが発生しました',
      },
    };
  }
};

// 学生プロフィール全体のバリデーション
export const validateStudentProfile = (
  profile: unknown,
): ValidationResult<z.infer<typeof studentProfileSchema>> => {
  try {
    const validatedProfile = studentProfileSchema.parse(profile);
    return {
      success: true,
      data: validatedProfile,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: { [key: string]: string } = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: {
        general: 'プロフィールの検証中にエラーが発生しました',
      },
    };
  }
};

// リアルタイムバリデーション用のヘルパー（入力中の検証）
export const validateHourlyRateRealtime = (rateString: string): string | null => {
  if (!rateString.trim()) return null;

  const rate = parseInt(rateString, 10);
  if (isNaN(rate)) {
    return '数値を入力してください';
  }

  const result = validateHourlyRate(rate);
  return result.errors?.hourlyRate || null;
};

// 料金表示用のフォーマット関数
export const formatHourlyRate = (
  rate: number,
): {
  coinText: string;
  yenText: string;
  isValid: boolean;
} => {
  const yenValue = Math.round(calculateCoinValue(rate));
  const isValid = rate >= COIN_CONSTANTS.MIN_HOURLY_RATE;

  return {
    coinText: `${rate.toLocaleString()} コイン/時`,
    yenText: `約 ${yenValue.toLocaleString()} 円相当`,
    isValid,
  };
};

// バリデーションエラーメッセージを統一する
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: '必須項目です',
  INVALID_EMAIL: '有効なメールアドレスを入力してください',
  PASSWORD_TOO_SHORT: 'パスワードは8文字以上で入力してください',
  PHONE_INVALID: '有効な電話番号を入力してください',
  MIN_HOURLY_RATE: `時給は最低 ${COIN_CONSTANTS.MIN_HOURLY_RATE} コイン以上で設定してください`,
  MESSAGE_TOO_SHORT: 'メッセージは20文字以上で入力してください',
  SELECT_AT_LEAST_ONE: '少なくとも1つ選択してください',
} as const;
