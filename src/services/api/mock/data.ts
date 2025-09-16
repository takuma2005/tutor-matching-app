// モックアダプター用のテストデータ

import {
  Student,
  Tutor,
  Lesson,
  CoinTransaction,
  TimeSlot,
  MatchRequest,
  Message,
  ChatRoom,
  ChatModerationReport,
  ChatBlock,
} from '../types';
import type { Notification } from './notificationService';

// テスト用の時間スロット
const weekdayMorning: TimeSlot[] = [
  { day_of_week: 1, start_time: '09:00', end_time: '12:00' },
  { day_of_week: 2, start_time: '09:00', end_time: '12:00' },
  { day_of_week: 3, start_time: '09:00', end_time: '12:00' },
];

const weekdayEvening: TimeSlot[] = [
  { day_of_week: 1, start_time: '18:00', end_time: '21:00' },
  { day_of_week: 2, start_time: '18:00', end_time: '21:00' },
  { day_of_week: 3, start_time: '18:00', end_time: '21:00' },
  { day_of_week: 4, start_time: '18:00', end_time: '21:00' },
  { day_of_week: 5, start_time: '18:00', end_time: '21:00' },
];

const weekendAfternoon: TimeSlot[] = [
  { day_of_week: 0, start_time: '13:00', end_time: '17:00' },
  { day_of_week: 6, start_time: '13:00', end_time: '17:00' },
];

// モック生徒データ
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: '田中花子',
    email: 'hanako.tanaka@example.com',
    role: 'student' as const,
    age: 16,
    grade: '高校2年生',
    subjects_interested: ['数学', '英語', '物理'],
    interested_subjects: ['数学', '英語', '物理'], // alias for compatibility
    learning_goals: '大学受験対策',
    preferred_schedule: '平日夜間',
    coins: 500,
    school: '都立青山高等学校',
    phone: '090-1234-5678',
    bio: 'こんにちは！田中花子です。数学と英語の勉強をがんばっています。特に数学の関数が苦手なので、分かりやすく教えてくれる先生を探しています。よろしくお願いします！',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces&auto=format',
    avatar_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces&auto=format', // for compatibility
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
  },
  {
    id: 'student-2',
    name: '山田太郎',
    email: 'taro.yamada@example.com',
    role: 'student' as const,
    age: 17,
    grade: '高校3年生',
    subjects_interested: ['化学', '生物', '数学'],
    interested_subjects: ['化学', '生物', '数学'],
    learning_goals: '医学部受験対策',
    preferred_schedule: '土日昼間',
    coins: 750,
    school: '私立桜丘高等学校',
    phone: '090-2345-6789',
    bio: '医学部を目指している高校3年生です。特に化学と生物の理解を深めたいと思っています。一緒にがんばりましょう！',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces&auto=format',
    avatar_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces&auto=format',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-22T14:30:00Z',
  },
];

// モック先輩（家庭教師）データ
export const mockTutors: Tutor[] = [
  {
    id: '1',
    name: '佐藤太郎',
    email: 'taro.sato@example.com',
    role: 'tutor' as const,
    hourly_rate: 1500,
    subjects_taught: ['数学', '物理'],
    experience_years: 3,
    bio: '東京大学工学部、2年生です！数学と物理が大好きで、分かりやすく教えることを心がけています。一緒にガンバっていきましょう！',
    qualifications: [],
    availability: weekdayEvening,
    rating: 4.8,
    total_lessons: 156,
    school: '東京大学',
    grade: '大学2年',
    location: '東京都文京区',
    online_available: true,
    avatar_url:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=120&h=120&fit=crop&crop=faces&auto=format',
    created_at: '2023-09-01T08:00:00Z',
    updated_at: '2024-01-18T12:00:00Z',
  },
  {
    id: '2',
    name: '山田英子',
    email: 'eiko.yamada@example.com',
    role: 'tutor' as const,
    hourly_rate: 1800, // 1,800コイン/時（約2,250円）
    subjects_taught: ['英語', '国語'],
    experience_years: 2,
    bio: '慶應義塾大学文学部、3年生です。英語と国語を楽しく学びたい方、お気軽に声をかけてください☆ ラインでもOKです！',
    qualifications: ['英検2級取得予定'],
    availability: weekdayMorning,
    rating: 4.6,
    total_lessons: 89,
    school: '慶應義塾大学',
    grade: '大学3年',
    location: '東京都渋谷区',
    online_available: true,
    avatar_url:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=120&h=120&fit=crop&crop=faces&auto=format',
    created_at: '2023-11-15T10:00:00Z',
    updated_at: '2024-01-19T16:45:00Z',
  },
  {
    id: '3',
    name: '鉛木健一',
    email: 'kenichi.suzuki@example.com',
    role: 'tutor' as const,
    hourly_rate: 2000, // 2,000コイン/時（約2,500円）
    subjects_taught: ['化学', '生物'],
    experience_years: 1,
    bio: '東京医科歯科大学医学部、4年生です。理系科目が大好きで、特に化学と生物は任せてください！医学部受験の経験もお伝えできます。',
    qualifications: ['医学部在籍'],
    availability: weekendAfternoon,
    rating: 4.9,
    total_lessons: 203,
    school: '東京医科歯科大学',
    grade: '大学4年',
    location: '東京都文京区',
    online_available: false,
    avatar_url:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&h=120&fit=crop&crop=faces&auto=format',
    created_at: '2023-08-01T07:00:00Z',
    updated_at: '2024-01-17T11:30:00Z',
  },
  {
    id: '4',
    name: '田中みなみ',
    email: 'minami.tanaka@example.com',
    role: 'tutor' as const,
    hourly_rate: 1400,
    subjects_taught: ['数学', '英語'],
    experience_years: 1,
    bio: '早稲田大学教育学部、1年生です。将来は小学校の先生になりたいです！今は勉強を教えることで経験を積みたいと思っています。一緒にガンバりましょう！',
    qualifications: [],
    availability: weekdayEvening,
    rating: 4.3,
    total_lessons: 32,
    school: '早稲田大学',
    grade: '大学1年',
    location: '東京都新宿区',
    online_available: true,
    avatar_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces&auto=format',
    created_at: '2024-01-01T09:00:00Z',
    updated_at: '2024-01-20T10:30:00Z',
  },
  {
    id: 'tutor-5',
    name: '高橋ゆうと',
    email: 'yuto.takahashi@example.com',
    role: 'tutor' as const,
    hourly_rate: 2200,
    subjects_taught: ['数学', '物理', '化学'],
    experience_years: 4,
    bio: '京都大学理学部、修士課程1年生です。高校時代から数学、理科の指導をしてきました。理系の勉強で困っている方、お気軽にどうぞ！',
    qualifications: ['大学院在籍'],
    availability: [...weekdayEvening, ...weekendAfternoon],
    rating: 4.7,
    total_lessons: 184,
    school: '京都大学',
    grade: '修士1年',
    location: '京都市左京区',
    online_available: true,
    avatar_url:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=faces&auto=format',
    created_at: '2023-06-15T11:00:00Z',
    updated_at: '2024-01-22T14:20:00Z',
  },
  {
    id: 'tutor-6',
    name: '佐藤さくら',
    email: 'sakura.sato@example.com',
    role: 'tutor' as const,
    hourly_rate: 1600,
    subjects_taught: ['英語', '現代文'],
    experience_years: 2,
    bio: '上智大学文学部、3年生です。海外留学の経験もあります。英語は楽しく学べることが一番です！一緒に英語を好きになっていきましょう❤',
    qualifications: ['留学経験あり'],
    availability: weekdayMorning,
    rating: 4.5,
    total_lessons: 67,
    school: '上智大学',
    grade: '大学3年',
    location: '東京都千代田区',
    online_available: true,
    avatar_url:
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=120&h=120&fit=crop&crop=faces&auto=format',
    created_at: '2023-10-12T13:30:00Z',
    updated_at: '2024-01-21T09:15:00Z',
  },
  {
    id: 'tutor-7',
    name: '中村ひろし',
    email: 'hiroshi.nakamura@example.com',
    role: 'tutor' as const,
    hourly_rate: 1900,
    subjects_taught: ['数学', '情報'],
    experience_years: 3,
    bio: '筑波大学情報学群、3年生です。プログラミングと数学が得意です。理系科目を理論的に理解してもらいます！',
    qualifications: ['情報処理技術者試験合格'],
    availability: weekdayEvening,
    rating: 4.6,
    total_lessons: 98,
    school: '筑波大学',
    grade: '大学3年',
    location: '茨城県つくば市',
    online_available: true,
    avatar_url:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=faces&auto=format',
    created_at: '2023-07-20T14:00:00Z',
    updated_at: '2024-01-23T16:00:00Z',
  },
  {
    id: 'tutor-8',
    name: '伊藤みか',
    email: 'mika.ito@example.com',
    role: 'tutor' as const,
    hourly_rate: 1750,
    subjects_taught: ['英語', '社会'],
    experience_years: 2,
    bio: '立教大学文学部、4年生です。英語教育学が専攻です。TOEIC900点で、英会話も教えます。楽しく一緒に学びましょう！',
    qualifications: ['TOEIC900点', '英語教育学専攻'],
    availability: weekdayMorning,
    rating: 4.8,
    total_lessons: 145,
    school: '立教大学',
    grade: '大学4年',
    location: '京都市北区',
    online_available: true,
    avatar_url:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces&auto=format',
    created_at: '2023-09-05T11:00:00Z',
    updated_at: '2024-01-24T13:45:00Z',
  },
];
// 日時生成ヘルパー（現在時刻基準で相対的に生成）
const toIso = (d: Date) => d.toISOString();
const atTime = (date: Date, hh: number, mm: number) => {
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
};
const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// モックレッスンデータ
export const mockLessons: Lesson[] = [
  {
    id: 'lesson-1',
    tutor_id: 'tutor-1',
    student_id: 'student-1',
    subject: '数学',
    status: 'completed',
    scheduled_at: toIso(addDays(atTime(new Date(), 0, 0), -230)),
    duration_minutes: 60,
    coin_cost: 100,
    lesson_notes: '二次方程式の解き方を学習しました',
    tutor_feedback: 'よく理解できていました。次回は応用問題に挑戦しましょう',
    student_rating: 5,
    created_at: toIso(addDays(new Date(), -235)),
    updated_at: toIso(addDays(new Date(), -230)),
  },
  {
    id: 'lesson-2',
    tutor_id: 'tutor-2',
    student_id: 'student-1',
    subject: '英語',
    status: 'scheduled',
    scheduled_at: toIso(addDays(atTime(new Date(), 10, 0), 10)),
    duration_minutes: 90,
    coin_cost: 150,
    created_at: toIso(addDays(new Date(), -1)),
    updated_at: toIso(addDays(new Date(), -1)),
  },
  // 未来のモック授業（ホームの「授業の予定」に反映）
  {
    id: 'lesson-3',
    tutor_id: '1',
    student_id: 'student-1',
    subject: '数学',
    status: 'scheduled',
    scheduled_at: toIso(addDays(atTime(new Date(), 10, 0), 2)),
    duration_minutes: 60,
    coin_cost: 120,
    created_at: toIso(new Date()),
    updated_at: toIso(new Date()),
  },
  {
    id: 'lesson-4',
    tutor_id: '2',
    student_id: 'student-1',
    subject: '英語',
    status: 'scheduled',
    scheduled_at: toIso(addDays(atTime(new Date(), 18, 30), 6)),
    duration_minutes: 90,
    coin_cost: 180,
    created_at: toIso(new Date()),
    updated_at: toIso(new Date()),
  },
];

// モックコイン取引データ
export const mockCoinTransactions: CoinTransaction[] = [
  {
    id: 'tx-1',
    user_id: 'student-1',
    amount: 1000,
    type: 'purchase',
    description: 'コイン購入 (1000コイン)',
    stripe_payment_intent_id: 'pi_test_1234567890',
    created_at: '2024-01-01T12:00:00Z',
  },
  {
    id: 'tx-2',
    user_id: 'student-1',
    amount: -100,
    type: 'spend',
    description: 'レッスン料金 (数学 - 佐藤太郎先生)',
    created_at: '2024-01-15T19:00:00Z',
  },
  {
    id: 'tx-3',
    user_id: 'student-1',
    amount: 500,
    type: 'purchase',
    description: 'コイン購入 (500コイン)',
    stripe_payment_intent_id: 'pi_test_0987654321',
    created_at: '2024-01-18T15:30:00Z',
  },
];

// モックマッチング申請データ
export const mockMatchRequests: MatchRequest[] = [
  {
    id: 'match-1',
    student_id: 'student-1',
    tutor_id: '1',
    message:
      '数学の微積分を基礎から教えてほしいです。特に応用問題が苦手で、解法のコツを教えていただけると嬉しいです。',
    schedule_note:
      '週に2回、土日の午前と水曜日の午後を希望します。最初の1月は基礎から始めたいです。',
    status: 'approved',
    coin_cost: 300,
    created_at: toIso(addDays(new Date(), -5)),
    updated_at: toIso(addDays(new Date(), -4)),
  },
  {
    id: 'match-2',
    student_id: 'student-1',
    tutor_id: '2',
    message: '英語の会話を練習したいです。TOEICのスコアを600点以上にしたいと思っています。',
    schedule_note:
      'テスト前は集中的に週に3回、普段は週に1回でお願いします。平日の夜19時以降が理想です。',
    status: 'pending',
    coin_cost: 300,
    created_at: toIso(addDays(new Date(), -2)),
    updated_at: toIso(addDays(new Date(), -2)),
    expires_at: toIso(addDays(new Date(), 5)),
  },
];

// モックチャットルームデータ
export const mockChatRooms: ChatRoom[] = [
  // テスト用の初期データは空で開始
];

// モックメッセージデータ
export const mockMessages: Message[] = [
  // テスト用の初期データは空で開始
];

const mockChatModerationReports: ChatModerationReport[] = [];
const mockChatBlocks: ChatBlock[] = [];

// メインのMockDB
export const mockDb = {
  students: mockStudents,
  tutors: mockTutors,
  lessons: mockLessons,
  coinTransactions: mockCoinTransactions,
  matchRequests: mockMatchRequests,
  chatRooms: mockChatRooms,
  messages: mockMessages,
  chatModerationReports: mockChatModerationReports,
  chatBlocks: mockChatBlocks,
  notifications: [] as Notification[],
};

// ヘルパー関数
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const generateId = (): string => Math.random().toString(36).slice(2, 11);

export const getCurrentTimestamp = (): string => new Date().toISOString();
