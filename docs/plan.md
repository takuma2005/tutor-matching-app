# 開発計画（Mock-First → 後統合：Supabase + Stripe）

本計画は、フロントのモック実装を先行し、後から Supabase（Auth/DB/Realtime/Edge Functions）と Stripe（コイン購入/決済、将来の出金）を段階的に統合する方針を定義する。

---

## 0. 方針と原則

- Mock-First: まずはUI/UXとドメインフローを確定。モックデータ/スタブAPIで結合テストし、後から本番実装に差し替える。
- Port & Adapter: `domain interfaces` → `mock adapter` → `supabase/stripe adapter` の三層で差し替え可能にする。
- Feature Flag: `.env`/ビルド時変数で `API_MODE=mock|supabase` を切替。課金も `PAYMENT_MODE=mock|stripe`。
- Happy Path優先: MVPのハッピーパス（申請→承認→授業→完了送金）を最短で成立させる。

---

## 1. スプリント計画（2週間 × 5）

- Sprint 1: デザイン/ナビ/モック基盤 + 登録/プロフィール（モック）
- Sprint 2: 先輩一覧/検索/詳細（モック）+ 申請導線/バリデーション
- Sprint 3: マッチング/チャット/通知（全モック）+ コインUI（残高/履歴はダミー）
- Sprint 4: 授業予約（仮押さえ→承認→完了の状態遷移をモックで再現）+ 予定画面
- Sprint 5: Supabase & Stripe 統合（段階導入）+ 最低限の安全/法務表示 + β準備

ゲート（DoD）

- M1: SMS擬似/プロフィール編集までUI完了。アクセシビリティ基準の土台。
- M2: 目的の先輩に到達でき、申請直前までの体験が成立。
- M3: マッチ成立→チャット送受信→通知（モック）が一通り成立。
- M4: 授業申請→承認→完了送金（モック台帳）までの一連が通る。
- M5: Supabase/Stripe接続で、認証/データ/コイン購入/台帳が実データで動く。

---

## 2. ワークストリームと差し替え設計

### 2.1 ドメインIF（共通）

- `src/services/api/types.ts` に以下のIFを定義:
  - AuthService（SMS登録・ログイン）, ProfileService（基本情報のみ）
  - SearchService（先輩一覧・フィルタ）, MatchingService（申請・承認）
  - ChatService（メッセージ送受信）, LessonService（予約・状態管理）
  - WalletService（残高・送金・台帳）
- 通知は必要最小限（プッシュなし、画面内表示のみから開始）

### 2.2 Mock Adapter（先行実装）

- `src/services/api/mock/*.ts`
  - メモリ上の `db` を module-scope で保持（開発用にリセット操作あり）。
  - ユースケース単位の固定遷移（申請→承認→開通、仮押さえ→承認→完了）。
  - コイン台帳は `transactions[]` 配列で記録。種別は requirement に準拠。

### 2.3 Supabase Adapter（後統合）

- `src/services/api/supabase/*.ts`
  - Auth: Supabase Auth（SMSのみ）
  - DB: 必要最小テーブル：users, profiles, matches, messages, lessons, coin_accounts, coin_transactions
  - Realtime: messages のみ（チャット）
  - Edge Functions: `stripe-webhook` のみ

### 2.4 Stripe Adapter（後統合）

**基本決済機能**

- コイン購入: 4プランのみ（400/1250/4300/8800）
- Webhook: 決済成功時に残高単純加算（冪等化あり）

**Stripe Connect統合（MVP対応）**

- 家庭教師のExpress Account自動作成
- プラットフォーム手数料: 15%
- エスクロー機能: 授業承認時に仮保持
- 自動送金: 完了ボタンで即時Transfer実行
- 収益管理: 家庭教師の売上・手数料表示

---

## 3. タスク分解（WBS）

### Sprint 1（UI土台 + 登録/プロフィール：モック）

- [UI] ボトムナビ（5タブ）・基本スタイル
- [UI] 役割選択→SMS擬似（6桁固定）→プロフィール入力
- [Mock] ユーザー作成・ログイン・プロフィール保存

### Sprint 2（先輩一覧/検索/詳細：モック）

- [UI] 先輩一覧（カード）・科目フィルタのみ
- [UI] プロフィール詳細・申請ボタン（300コイン表示）
- [Mock] 先輩ダミーデータ・基本検索

### Sprint 3（マッチング/チャット：モック）

- [UI] 申請画面（メッセージ20文字以上）・300コイン支払い
- [UI] チャット一覧・メッセージ送受信
- [Mock] 申請→承認→チャット開通

### Sprint 4（授業予約/台帳：モック）

- [UI] 授業申請（日時・金額）・予定一覧
- [Mock] 仮押さえ→承認→完了送金の台帳

### Sprint 5（Supabase/Stripe統合 + Connect導入）

**Supabase統合**

- [AUTH] SMS認証・JWT管理
- [DB] テーブル作成・RLS設定
- [REALTIME] チャットメッセージ同期

**Stripe統合（基本 + Connect）**

- [PAYMENT] コイン購入・Webhook処理
- [CONNECT] Express Account作成フロー
- [ESCROW] 授業承認時の仮保持機能
- [TRANSFER] 完了時の自動送金処理

**アプリ統合**

- [CONFIG] mock→本番切替機能
- [UI] Stripe Connectオンボーディング画面
- [LEGAL] 利用規約・返金ポリシー

---

## 4. 受け入れ基準（抜粋）

- モック時点で全フローがUI上で成立（台帳/通知も動く）。
- 切替後、Auth/検索/チャット/授業/台帳/購入が実データで成立。
- Stripe成功時のみコインが増え、重複Webhookでも二重加算しない。
- 主要通知が到達（申請/承認/リマインド/送金）し、ログで追跡可能。

---

## 5. 環境変数（例：.env）

**フロントエンド（Expo）**

- EXPO_PUBLIC_API_MODE=mock|supabase
- EXPO_PUBLIC_PAYMENT_MODE=mock|stripe
- EXPO_PUBLIC_SUPABASE_URL=...
- EXPO_PUBLIC_SUPABASE_ANON_KEY=...
- EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

**バックエンド（Supabase Edge Functions）**

- STRIPE*SECRET_KEY=sk*...
- STRIPE*WEBHOOK_SECRET=whsec*...
- STRIPE*CONNECT_CLIENT_ID=ca*...
- PLATFORM_FEE_PERCENT=15

---

## 6. リスク/留意点

**決済・法務リスク**

- IAP要件: コインがデジタルコンテンツ扱いの場合、Web課金へ変更も要検討
- Stripe Connect審査: Express Account承認に2-7日要する可能性
- 資金決済法: プラットフォーム手数料の適正性確認が必要

**ユーザー保護**

- 未成年保護: SMS認証のみでは年齢確認が不十分、ガイド表示で補完
- エスクローリスク: 紹介/返金トラブル時の手動介入体制

---

## 7. 成果物

**フロントエンド**

- src/services/api/types.ts（共通IF定義）
- src/services/api/mock/（モック実装）
- src/services/api/supabase/（Supabase実装）
- src/services/api/stripe/（Stripe + Connect実装）

**バックエンド**

- supabase/migrations/（DBスキーマ）
- supabase/functions/（Edge Functions）
  - stripe-webhook（決済処理）
  - connect-onboard（Connectアカウント作成）
  - transfer-funds（自動送金）
