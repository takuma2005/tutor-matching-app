# 要件変更履歴

このファイルは `requirements.md` からの仕様変更を追跡します。

## 変更履歴

### 2025-09-05 (Sprint 1実装時)

#### 用語統一の確認

- ✅ 確認：「生徒」→「後輩」、「家庭教師」→「先輩」で実装
- ✅ アプリ名：「センパイ（Senpai）」で統一
- ✅ コンセプト：「先輩に教えてもらう青春体験」

#### UI実装での調整

- 電話番号バリデーション：長さチェックを11文字から13文字（ハイフン込み）に修正
- 認証フロー：Role Selection → Phone Verification → Profile Setup → Main App の流れで実装

#### UI修正

- ✅ ボトムナビゲーション：requirements.mdに合わせて修正
  - 修正後：ホーム / 探す / チャット / 授業 / マイページ
  - 対応画面：HomeScreen / SearchScreen / ChatScreen / LessonScreen / MyPageScreen
- ✅ 電話番号バリデーション修正（11文字→13文字：ハイフン込み）
- ✅ セーフエリア対応：全画面にSafeAreaView適用、上下の見切れ解決
- ✅ スペーシング最適化：セーフエリアをコンパクトに、黒い部分の解決

#### 次回確認事項

- [ ] プロフィール項目の詳細仕様確認
- [ ] 科目タグの選択UI仕様

## 実装方針

- Mock-First開発：UI/UXを先行実装し、後からSupabase/Stripe統合
- Port & Adapter：API層を抽象化してモック→本番切り替えを容易にする

---

### 2025-09-05（差分確認: 実装 vs requirements.md）

#### 技術スタック

- React Navigation バージョン
  - 要件（11.1）: v6
  - 実装: v7（package.json: @react-navigation/\* v7 系）
  - 備考: ガイド・サンプルコードはv7 APIで統一する必要あり
- TypeScript Strict Mode
  - 要件: strict 必須
  - 実装: tsconfig.json にて strict: true（OK）

#### 認証 / SMS（3.1）

- 要件: SMS送信・検証による登録/ログイン
- 実装: モック実装（PhoneVerificationScreen: 固定コード「123456」、実SMS送信なし）

#### マッチング / 授業 / エスクロー（2.3, 3.4, 3.6）

- 要件: 300コイン徴収 → 申請時仮押さえ → 先輩承認でエスクロー → 完了で送金
- 実装: UI/ダイアログのみ（TutorDetailScreen: MATCHING_COST=300, LessonRequestScreen: 「仮押さえ」文言）
  - 残高更新・状態遷移・API連携は未実装（モック）

#### コイン体系（2.1）

- 換算レート
  - 要件: 1コイン = 1.25円
  - 実装: UI表示が「約1.2円相当」（CoinManagementScreen）→ 要修正
- 購入プラン
  - 要件: 400/1250/4300/8800 コイン（¥490/¥1,480/¥4,900/¥9,800）
  - 実装: 100/500/1000/2000/5000 コイン 等（独自パッケージ）→ 要件と不一致
- 取引種別
  - 型定義: purchase | spend | refund（services/api/types.ts）
  - 表示ロジック: matching/lesson/bonus の分岐あり（CoinManagementScreen）→ 表示種別と型の整合を再検討

#### プロフィール / 料金（2.2）

- 最低時給 1,200 コイン/時のバリデーション
  - 要件: 1,200 未満は保存不可
  - 実装: ProfileSetupScreen に料金入力項目・バリデーションなし（未実装）

#### チャット / 安全 / 通知（3.5, 3.9, 10）

- 既読/未読、通報/ブロック: 未実装想定（UI/処理未確認）
- プッシュ通知: 未実装

#### バックエンド / 決済（11.2）

- Supabase・Stripe Connect: 現状モックAPIのみ。統合は未実装

#### 品質ツール / テスト（11.7, 11.3）

- ESLint/Prettier: 要件は「導入予定」→ 現状 未導入
- テスト: 要件は「導入予定」→ 現状 Jest + Testing Library 導入済（先行実装）

#### 用語 / ナビゲーション（2, 4）

- 用語統一（後輩/先輩）: 実装どおり（OK）
- タブ構成（ホーム/探す/チャット/授業/マイページ）: 実装どおり（OK）

#### その他（5, 11.9）

- 保護者簡易同意: 未実装
- 監視/ログ/CI: 未実装

---

### 2025-09-05（UI差分: シート仕様の統一と細部調整）

- ボトムシート仕様（requirements.md未記載の実装差分）
  - 固定高さ: 560 に統一（MyPage プロフィール編集 / CoinManagement / TutorDetail）
  - 実装形式の統一: Backdrop + Panジェスチャー + Reanimated（SlideIn/Out）
  - TutorDetail: 既存の TutorDetailSheet を廃止し、TutorDetailScreen 内でインライン実装に変更
    - ルーティング: transparentModal を使わず通常画面遷移、ヘッダー右のボタンで開閉
    - 影響: 未使用ファイルを削除（TutorDetailSheet.tsx, components/common/BottomSheet.tsx）

- MyPage プロフィール編集（requirements.md未記載のUI挙動）
  - シート背景を白に統一、上方向のオーバードラッグを抑止（灰色の下地が見えない）
  - シート内 ScrollView に縦スクロールバーを表示して可視性を向上

- TutorDetail 画面（要件未記載のUI調整）
  - SafeArea（上部）適用 + 追加の上部余白で見切れを解消
  - マッチングボタンの角丸を4辺とも同一（borderRadius.lg）に統一

- コードクリーンアップ（仕様外の実装差分の後処理）
  - 未使用ファイル削除: src/screens/TutorDetailSheet.tsx, src/components/common/BottomSheet.tsx
  - 未使用インポート削除: CoinManagementScreen の FlatList など

---

対応方針（提案）

- 短期（UI整合）
  - CoinManagementScreen の換算表示を「1コイン = 1.25円」に修正
  - コイン購入パッケージを要件の4プランに合わせる
  - requirements.md の React Navigation 版表記を v7 に更新（またはコードを v6 に戻す方針決定）
- 中期（機能実装）
  - マッチング申請時の300コイン徴収・仮押さえの内部処理（状態/履歴）をモックAPIに追加
  - 授業申請→承認→完了→送金のステートマシン整備
  - プロフィール（先輩）に料金項目 + 最低料金バリデーション追加
- 長期（本番統合）
  - Supabase 認証/DB/リアルタイム統合、Stripe Connect での購入/エスクロー/送金実装
