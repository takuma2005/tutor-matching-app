// モックアダプター用のテストデータ

import { Student, Tutor, Lesson, CoinTransaction, TimeSlot } from '../types';

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
    avatar: 'https://via.placeholder.com/120/F472B6/FFFFFF?text=花子',
    avatar_url: 'https://via.placeholder.com/120/F472B6/FFFFFF?text=花子', // for compatibility
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
  },
];

// モック先輩（家庭教師）データ
export const mockTutors: Tutor[] = [
  {
    id: '1',
    name: '佐藤太郎',
    email: 'taro.sato@example.com',
    hourly_rate: 1500, // 1,500コイン/時（約1,875円）
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
    name: '鈴木健一',
    email: 'kenichi.suzuki@example.com',
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
    hourly_rate: 1600,
    subjects_taught: ['英語', '現代文'],
    experience_years: 2,
    bio: '上智大学文学部、2年生です。海外留学の経験もあります。英語は楽しく学べることが一番です！一緒に英語を好きになっていきましょう❤',
    qualifications: ['留学経験あり'],
    availability: weekdayMorning,
    rating: 4.5,
    total_lessons: 67,
    school: '上智大学',
    grade: '大学2年',
    location: '東京都千代田区',
    online_available: true,
    avatar_url:
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=120&h=120&fit=crop&crop=faces&auto=format',
    created_at: '2023-10-12T13:30:00Z',
    updated_at: '2024-01-21T09:15:00Z',
  },
];

// モックレッスンデータ
export const mockLessons: Lesson[] = [
  {
    id: 'lesson-1',
    tutor_id: 'tutor-1',
    student_id: 'student-1',
    subject: '数学',
    status: 'completed',
    scheduled_at: '2024-01-15T19:00:00Z',
    duration_minutes: 60,
    coin_cost: 100,
    lesson_notes: '二次方程式の解き方を学習しました',
    tutor_feedback: 'よく理解できていました。次回は応用問題に挑戦しましょう',
    student_rating: 5,
    created_at: '2024-01-10T14:00:00Z',
    updated_at: '2024-01-15T20:00:00Z',
  },
  {
    id: 'lesson-2',
    tutor_id: 'tutor-2',
    student_id: 'student-1',
    subject: '英語',
    status: 'scheduled',
    scheduled_at: '2024-01-25T10:00:00Z',
    duration_minutes: 90,
    coin_cost: 150,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-20T09:00:00Z',
  },
  // 追加: 未来のモック授業（ホームの「授業の予定」に反映されます）
  {
    id: 'lesson-3',
    tutor_id: '1',
    student_id: 'student-1',
    subject: '数学',
    status: 'scheduled',
    scheduled_at: '2025-09-08T10:00:00Z',
    duration_minutes: 60,
    coin_cost: 120,
    created_at: '2025-09-06T09:00:00Z',
    updated_at: '2025-09-06T09:00:00Z',
  },
  {
    id: 'lesson-4',
    tutor_id: '2',
    student_id: 'student-1',
    subject: '英語',
    status: 'scheduled',
    scheduled_at: '2025-09-12T18:30:00Z',
    duration_minutes: 90,
    coin_cost: 180,
    created_at: '2025-09-06T09:00:00Z',
    updated_at: '2025-09-06T09:00:00Z',
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

// ヘルパー関数
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const generateId = (): string => Math.random().toString(36).slice(2, 11);

export const getCurrentTimestamp = (): string => new Date().toISOString();
