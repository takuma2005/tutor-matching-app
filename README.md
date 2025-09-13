# 家庭教師マッチングアプリ (Tutor Matching App)

A React Native mobile application built with Expo for connecting students with qualified tutors.

## Features

- **Student Profile Management**: Students can create profiles with learning goals and preferred subjects
- **Tutor Profile Management**: Tutors can showcase their expertise, availability, and rates
- **Smart Matching**: Algorithm-based matching between students and tutors based on subjects, schedule, and location
- **Session Booking**: Easy scheduling and booking system for tutoring sessions
- **Review System**: Rating and review system for both tutors and students
- **Chat Integration**: In-app messaging between matched users
- **Payment Integration**: Secure payment processing for tutoring sessions
- **Online & In-Person Sessions**: Support for both virtual and face-to-face tutoring

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Expo Router** (optional alternative to React Navigation)
- **State Management**: Context API or Redux Toolkit
- **Authentication**: Firebase Auth or Supabase Auth
- **Backend**: Firebase/Supabase or custom REST API
- **Real-time Chat**: Firebase Realtime Database or Socket.io
- **Payment Processing**: Stripe or PayPal

## Project Structure

```
src/
├── screens/          # Screen components
├── components/       # Reusable UI components
├── navigation/       # Navigation configuration
├── services/         # API calls and external services
├── utils/           # Utility functions and helpers
└── types/           # TypeScript type definitions

assets/
├── images/          # Image assets
└── icons/           # Icon assets
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device (for development)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd tutor-matching-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run start
   ```

4. Use Expo Go app to scan the QR code and run the app on your device

### Development Commands

- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser
- `npm run start` - Start the development server
- `npm run typecheck` - TypeScript type check (no emit)
- `npm run lint` - Lint the codebase with ESLint
- `npm run format` - Format the codebase with Prettier

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# API mode (mock | supabase)
# mock: use in-memory/mock API (default during development)
# supabase: use production stubs / real backend when integrated
EXPO_PUBLIC_API_MODE=mock
# Legacy (fallback only): EXPO_PUBLIC_USE_MOCK=true

# Development convenience: skip auth gate in development flows
EXPO_PUBLIC_SKIP_AUTH=true
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## 実運用セットアップガイド（Supabase & Stripe）

このセクションは、開発から本番までを安全に進めるための段階別のセットアップガイドです。秘密情報は必ずクライアント外（サーバー/EAS Secrets/.env.production など）に保持してください。

### ステージ構成（推奨）

- Dev（ローカル/テスト端末）
  - EXPO_PUBLIC_API_MODE=mock でモックAPIを使用
  - Supabase: テスト用プロジェクト、Anon keyのみ（Service Roleはクライアントに埋め込まない）
  - Stripe: テストモードのみ
- Staging/QA（実機検証）
  - 実際の Supabase + Stripe（テストモード）でエンドツーエンド検証
  - 本番と同じRLS/ポリシー/ウェブフックで動作確認
- Production（本番）
  - EXPO_PUBLIC_API_MODE=supabase（本番APIに切替）
  - ドメイン/ディープリンク設定、ストア配布設定、シークレットはEAS/サーバーのみに保管

---

### Supabase 設定

1. プロジェクト作成

- 新規プロジェクトを作成し、Region/Database Password を控える

2. クライアント環境変数（Expo）

- .env（またはEAS Secrets）に以下を設定

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- これらはクライアントに埋め込まれる前提の“公開鍵”扱い。安全な操作は行わない

3. サーバー環境変数（絶対にクライアントに出さない）

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

- Webhook処理、決済確定、バッチ等のサーバーサイドでのみ使用

4. 認証設定

- Email/パスワード or OAuth プロバイダ（Google/Apple等）を有効化
- リダイレクトURL（deeplink/Universal Links）を設定

5. RLS（Row Level Security）とポリシー

- テーブルごとに RLS を有効化し、最低限のポリシーを設定
- 例: lessons テーブルの本人アクセスのみ許可

```sql
-- RLS 有効化
alter table lessons enable row level security;

-- 生徒が自分のレッスンを読める
create policy "read_own_lessons"
  on lessons for select
  using (student_id = auth.uid());

-- 先輩が自分に紐づくレッスンを読める
create policy "tutor_read_own_lessons"
  on lessons for select
  using (tutor_id = auth.uid());
```

- 同様に match_requests, coin_transactions, notifications 等にも適切なRLSを設定

6. ストレージ（例: avatars バケット）

- バケット作成: avatars
- 読み取りは公開、書き込みは本人のみ等のポリシーを設定

```sql
create policy "avatar_read_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatar_write_self"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

7. サーバー/Edge Functions

- 決済の確定/返金、コイン反映、通知送信などはサーバーで実施
- Supabase Edge Functions もしくは別サーバー（Cloud Run/Vercel等）を用意

8. Deeplink/Universal Links（Expo）

- app.json で scheme/associatedDomains を設定し、Supabase のリダイレクトURLにも登録

---

### Stripe Connect 設定

1. 初期設定

- Stripe アカウント作成後、Connect（Express）を有効化
- ダッシュボードの API キーを取得（テスト/本番を明確に分離）

2. サーバー環境変数（クライアントに出さない）

```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

3. チューターのアカウント連携

- Connect Account（type=express）をサーバーで作成
- Account Link を発行し、チューターをオンボーディング
- 以降、チューターの accountId を Supabase などに保存

4. 課金フロー（エスクロー方針）

- 申請時: PaymentIntent を作成し（必要に応じて capture_method=manual）、生徒の支払いを確保
- 授業完了時: capture して売上確定、プラットフォーム手数料（application_fee_amount）を適用
- Connect への分配: PaymentIntent.transfer_data.destination を使用（Destination charges）
- 返金/キャンセル: PaymentIntent/Charge を cancel/refund

5. Webhook（必須）

- 推奨イベント: payment_intent.succeeded / payment_intent.amount_capturable_updated / charge.captured / charge.refunded / payment_intent.canceled
- 署名検証（STRIPE_WEBHOOK_SECRET）を必ず実装
- 受信イベントに応じて Supabase の coin_transactions/lessons 状態を更新

---

### 環境変数の整理（例）

- クライアント（.env）

```
EXPO_PUBLIC_API_URL=...
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
EXPO_PUBLIC_API_MODE=supabase  # 本番では supabase
EXPO_PUBLIC_SKIP_AUTH=false # 本番では false
```

- サーバー（.env.server など）

```
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

---

### 動作確認チェックリスト

- 型/リンタ: npm run typecheck / npm run lint がクリーンである
- 認証: 新規/既存ユーザーでログイン・ログアウトできる
- RLS: 別ユーザー間でデータが見えないこと（想定した行だけ見える）
- 決済テスト: テストカード（3DS含む）で申請→確保→完了→分配→返金が一連で通る
- Webhook: 署名検証OK、イベントに応じてDBが正しく更新される
- フラグ: 本番で EXPO_PUBLIC_API_MODE=supabase、SKIP_AUTH=false である

---

### セキュリティ/運用の要点

- クライアントに秘密鍵（Service Role/Stripe Secret/Webhook Secret）を絶対に埋め込まない
- 監査ログと監視（Supabase Logs/Stripe Logs/Sentry等）を有効化
- バックアップ/リストア計画、ロールバック戦略（フィーチャーフラグ）を用意

## License

This project is licensed under the MIT License.
