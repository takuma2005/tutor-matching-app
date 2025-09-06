# リアルタイムチャット実装方針（Supabaseを見据えたモック先行）

最終更新: 2025-09-06
対象: Expo (SDK 53) / React Native 0.79 / React 19

---

## 背景と目的

- 本プロジェクトでは、リアルタイムチャット機能を実装する。
- まずは「モック（擬似リアルタイム）」で最短可動を目指し、その後にSupabase（Postgres + Realtime + Auth）へデータ層を置換する段階導入を採用する。
- UIとデータアクセスを分離し、差し替えコストを最小化する。

## 全体アーキテクチャ方針

- プレゼンテーション（UI）層は GiftedChat を用いて素早く構築。
- データ層は Repository/Service インターフェースで抽象化し、実装をモック → Supabase に切替可能にする。
- 将来の拡張（既読、プレゼンス、検索、添付、通知など）を見据えたスキーマ/チャネル設計。

---

## フェーズ1：モックで最短可動

- 目的: Expo Go で即動くチャット体験（送受信・スクロール読み込み・タイピング表示）。
- 主要ライブラリ:
  - UI: `react-native-gifted-chat`
  - 日付フォーマット（任意）: `dayjs`
- Repository インターフェース（例）:
  - `listMessages(roomId, { limit, before })`
  - `sendMessage(roomId, { text, attachments })`
  - `subscribeMessages(roomId, cb): () => unsubscribe`
  - `setTyping(roomId, isTyping)`
  - `subscribeTyping(roomId, cb)`
- Mock 実装（`MockChatRepository`）:
  - メモリ上にメッセージ配列を保持。
  - `setInterval` で相手からの自動返信を擬似送信。
  - タイピング表示を一定間隔/確率で発火。
- UI 実装（`ChatScreen`）:
  - GiftedChat を使い、Hook（例: `useChat(roomId, repo)`）経由で Repository に接続。
  - 送受信/タイピング/過去読み込みを確認。

---

## フェーズ2：Supabase 統合（データ層差し替え）

- 目的: モックの Repository を Supabase 実装に置換し、リアルデータで運用可能にする。
- 主要ライブラリ:
  - `@supabase/supabase-js`
  - （必要に応じて）`react-native-url-polyfill/auto`
- クライアント初期化:
  - 環境変数: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Expo では `process.env.EXPO_PUBLIC_...` で参照（値の表示は禁止）。
- Supabase 実装（`SupabaseChatRepository`）:
  - `listMessages`: `SELECT ... FROM messages WHERE room_id = $1 ORDER BY created_at DESC LIMIT ...`（無限スクロール用に `before` カーソル対応）
  - `sendMessage`: `INSERT`（クライアント側で一時IDを生成して即時UI反映、確定後同期）
  - `subscribeMessages`: Realtime（Postgres Changes）で `INSERT/UPDATE` を購読（room単位のフィルタ）
  - `setTyping`/`subscribeTyping`: Realtime `presence`/`broadcast` チャネルで typing 状態配信
- 認証:
  - MVPでは匿名同等に始め、後でメール/OTP/SSOなど拡張。
- RLS（Row Level Security）ポリシー（概要）:
  - `room_members` に存在するユーザーのみ、該当 `room_id` の `messages` を `select/insert` 可能。

### 最小スキーマ案（概要）

- `rooms`
  - `id (uuid, pk)`
  - `name (text)`
  - `created_at (timestamptz default now())`
- `room_members`
  - `room_id (uuid, fk rooms.id)`
  - `user_id (uuid)`
  - `joined_at (timestamptz default now())`
  - 複合主キー（`room_id`, `user_id`）推奨
- `messages`
  - `id (uuid, pk)`
  - `room_id (uuid, fk rooms.id)`
  - `user_id (uuid)`
  - `text (text)`
  - `attachments (jsonb null)`
  - `created_at (timestamptz default now())`
- 推奨インデックス
  - `messages (room_id, created_at DESC)`
  - `messages (user_id, created_at)`

---

## フェーズ3：品質/体験の拡張

- 既読/未読: `room_members` に `last_read_at` または `last_read_message_id` を持ち、UIに既読バッジ。
- プレゼンス: チャネルの presence でオンライン人数/ユーザー表示。
- タイピング: デバウンス（1–2秒）で自動消灯。
- 添付: Supabase Storage + 署名付きURL。必要ならサムネイル/トランスコードのジョブ化。
- 検索・モデレーション: SQL/関数/エッジ関数で拡張。
- 通知: Expo Notifications 等との連携。

---

## 導入パッケージ一覧

- フェーズ1（モック）
  - `react-native-gifted-chat`
  - `dayjs`（任意）
- フェーズ2（統合）
  - `@supabase/supabase-js`
  - `react-native-url-polyfill`（必要時）

---

## 環境変数（例 — 値は表示/ログ出力しない）

- `.env`:
  - `EXPO_PUBLIC_SUPABASE_URL={{SUPABASE_URL}}`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY={{SUPABASE_ANON_KEY}}`
- 参照: `process.env.EXPO_PUBLIC_SUPABASE_URL` など。

---

## 次のアクション（提案）

1. フェーズ1実装
   - `ChatRepository` インターフェース
   - `MockChatRepository` 実装
   - `ChatScreen`（GiftedChat接続）
2. フェーズ2準備
   - Supabase プロジェクト作成、上記スキーマとRLSの適用
   - クライアント初期化と `SupabaseChatRepository` の追加
   - 依存差し替え（DI/プロバイダ）でモック → Supabase に切替
3. 任意の拡張（既読、プレゼンス、添付、通知など）

---

## 備考

- Expo Go 前提の段階ではネイティブ依存を避ける構成を優先。
- 本番要件が固まった段階で、必要に応じて専用チャットSDK（Stream/Sendbird等）への移行も検討可能（Expo prebuild が必要）。
