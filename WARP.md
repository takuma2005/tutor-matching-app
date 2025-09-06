# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## プロジェクト概要

**センパイ（Senpai）** - 「先輩に教えてもらう青春体験」をコンセプトとした家庭教師マッチングアプリ

- **フレームワーク**: React Native 0.79.6 + Expo ~53.0.22
- **言語**: TypeScript ~5.8.3 (strict mode)
- **状態管理**: Context API + useReducer
- **ナビゲーション**: React Navigation v6
- **バックエンド**: Supabase (データベース・認証・リアルタイム)
- **決済**: Stripe Connect

## 開発コマンド

```bash
# 開発サーバー起動
npm start

# プラットフォーム別起動
npm run android    # Android端末・エミュレーター
npm run ios        # iOSシミュレーター（macOSのみ）
npm run web        # ブラウザ版

# 依存関係管理
npm install [package-name]
expo start --clear  # キャッシュクリア + 起動
```

## アーキテクチャ

### ディレクトリ構造

```
src/
├── screens/          # 画面コンポーネント
├── components/       # 再利用可能UIコンポーネント
│   ├── common/       # 汎用コンポーネント
│   └── tutor/        # 先輩関連コンポーネント
├── navigation/       # React Navigationルーティング
├── services/         # API呼び出し・外部サービス統合
├── contexts/         # Context API（状態管理）
├── types/           # TypeScript型定義
├── styles/          # テーマ・色・スペーシング定義
└── utils/           # ユーティリティ関数

docs/                # 要件定義・ガイドライン
├── requirements.md  # 最新仕様（必読）
├── mobile-ui-spacing-guidelines.md
└── plan.md
```

### パスエイリアス

```typescript
// @/ でsrcディレクトリを参照可能
import { Button } from '@/components/common/Button';
import { theme } from '@/styles/theme';
```

### アーキテクチャパターン

- **MVVM設計**: View・ViewModel・Model分離
- **Atomic Design**: コンポーネント設計原則
- **Context Pattern**: グローバル状態管理

## コーディング規約

### 重複禁止・統一方針

- 認証コンテキストは `src/contexts/AuthContext.tsx` に一本化
- `src/lib/auth-context.tsx` は将来の互換のための再エクスポートのみ（実装は持たない）
- 型定義は `src/services/api/types.ts` に統一。`src/types/index.ts` は廃止

### TypeScript

- **Strict Mode**: 必須（`tsconfig.json`で有効）
- **型ガード**優先、`any`より`unknown`を使用
- **Nullish coalescing** (`??`) と **Optional chaining** (`?.`) を活用
- 全exportに型定義必須

### React Native

- **useMemo**/**useCallback**: パフォーマンス最適化必須
- **React.memo()**: 不要なre-render防止
- **FlatList**: 大量データは仮想化必須
- **単一責任の原則**: コンポーネント設計

### ファイル命名

- **PascalCase**: コンポーネント (`HomeScreen.tsx`)
- **camelCase**: hooks・関数 (`useAuth.ts`)
- **kebab-case**: 設定ファイル (`app.json`)

### UI/UX設計

```typescript
// 8pxグリッドシステム採用
const spacing = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };

// 最小タッチ領域44pt以上
const TouchTarget = { minSize: 44 };

// WCAG AA準拠のコントラスト比
```

## 重要なルール

### ドキュメント参照

- **作業開始前**: `docs/requirements.md`を必ず確認
- **仕様変更時**: `docs/requirements_diff.md`に追記
- **用語統一**: **後輩**（学ぶ側）、**先輩**（教える側）

### ビジネスロジック

- **コイン体系**: 1コイン = 1.25円
- **マッチング料**: 300コイン（初回のみ）
- **エスクロー決済**: 申請→仮押さえ→承認→エスクロー→完了→送金

### セキュリティ

- **入力検証**: 全ユーザー入力をバリデーション
- **APIキー**: 環境変数（`EXPO_PUBLIC_*`）で管理
- **HTTPS**: 全API通信必須

### アクセシビリティ

- **accessibilityLabel**/**accessibilityRole**: 重要UI要素に設定
- **カラーコントラスト**: WCAG AA準拠
- **タッチ領域**: 最小44pt確保

## 開発フロー

### 新機能開発

1. `docs/requirements.md`で仕様確認
2. 型定義は`src/services/api/types.ts`に統一（API/ドメインの共通型）。UI専用の補助型は各モジュール内で定義
3. コンポーネント・画面作成
4. 動作確認（Expo Go実機テスト）
5. TypeScriptコンパイルエラー確認

### デバッグ・テスト

```bash
# TypeScriptチェック
npx tsc --noEmit

# 開発サーバー再起動（キャッシュクリア）
expo start --clear

# 実機テスト（推奨）
# Expo Goアプリでスキャン
```

### プラットフォーム対応

- **iOS**: SF Symbols、Dynamic Type対応
- **Android**: Material Design、エレベーション効果
- **両対応**: Platform.OSまたは`.ios.tsx`/`.android.tsx`ファイル

## パフォーマンス要件

- **初期ロード**: 3秒以内
- **主要画面レスポンス**: 1.5秒以内
- **チャット送信**: 1秒以内
- **FlatList**: 仮想化で大量データ対応

## エラーハンドリング

```typescript
// ErrorBoundaryでアプリクラッシュ防止
// APIエラーはtry-catchで適切に処理
// 開発環境のみログ出力
```

## 注意事項

- **Metroサーバー**: パッケージ追加後は再起動必須
- **Windows環境**: パス区切り文字に注意（`\\` または `/`）
- **実機テスト**: Expo Goアプリでの確認を推奨
- **年齢関連**: 未成年保護機能の適切な実装
- **決済機能**: Stripe Connect統合時のエラーハンドリング強化

## 詳細ベストプラクティス

### パフォーマンス最適化

- **FlatList最適化**: 大量データは必ず仮想化
- **遅延ローディング**: 画像・コンポーネントの適切な遅延読み込み
- **Tree shaking**: 未使用コードの自動削除活用
- **Bundle分析**: Metro bundlerの分析ツール使用

### 開発タスク詳細

#### 型定義追加

- **場所**: `src/services/api/types.ts` を更新（単一のソース・オブ・トゥルース）
- **主要エンティティ**: User/Tutor/Student, Lesson, CoinTransaction など
- **継承関係**: Student/Tutor extends User

#### プラットフォーム固有実装

- **条件分岐**: `Platform.OS === 'ios'` または `Platform.OS === 'android'`
- **ファイル分割**: `.ios.tsx` / `.android.tsx` 拡張子使用
- **アセット配置**: `assets/` ディレクトリに配置
- **設定変更**: `app.json` / `expo.json` 編集

### UI/UX設計詳細ガイドライン

#### タイポグラフィ体系

```typescript
const Typography = {
  fontSize: { h1: 28, h2: 24, h3: 20, body: 16, caption: 14, small: 12 },
  lineHeight: { tight: 1.3, normal: 1.6, relaxed: 1.8 },
  fontFamily: ['Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', 'sans-serif'],
};
```

#### カラーシステム詳細

```typescript
const Colors = {
  primary: { main: '#2E5C9A', light: '#5B82BD', dark: '#1A3E6E' },
  secondary: { main: '#E60033', light: '#FF4569', dark: '#B30025' },
  neutral: { N900: '#1C1C1C', N500: '#808080', N100: '#E6E6E6', N0: '#FFFFFF' },
  semantic: { success: '#4CAF50', warning: '#FF9800', error: '#F44336', info: '#2196F3' },
};
```

#### 詳細スペーシングシステム

```typescript
const Spacing = {
  scale: { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 },
  padding: {
    button: { vertical: 12, horizontal: 24 },
    card: 16,
    listItem: { vertical: 12, horizontal: 16 },
    screen: { top: 32, horizontal: 16, bottom: 24 },
  },
};
```

#### タッチターゲット詳細

```typescript
const TouchTarget = {
  minSize: { ios: 44, android: 48, recommended: 48 },
  feedback: { opacity: 0.7, scale: 0.95, duration: 100 },
};
```

### プラットフォーム別詳細対応

- **iOS固有**: SF Symbols活用, Dynamic Type対応, ブラー効果
- **Android固有**: Material Design準拠, エレベーション(影), リップル効果
- **共通要件**: WCAG AA準拠のコントラスト比, 最小タッチ領域確保

### 入力バリデーション

- **推奨ライブラリ**: Yup または Zod
- **適用箇所**: 全ユーザー入力フィールド
- **エラー表示**: 統一されたエラーメッセージフォーマット

## MCP Tools活用

### 理解フェーズ

`list_dir` → `get_symbols_overview` → `find_symbol` → `find_referencing_symbols`

### 編集フェーズ

- `edit_file`（複数変更一括処理）
- `replace_symbol_body`
- `insert_*_symbol`

### 思考・検証フェーズ

- `think_about_task_adherence`（変更前の確認）
- `think_about_collected_information`（作業後の検証）

### メモリ管理

- `write_memory`（重要情報保存）
- `read_memory`（過去参照）

## ドキュメント参照詳細ルール

### 必須参照ファイル

- **会話開始時**: `docs/` フォルダを必ず参照
- `docs/requirements.md` - 最新の仕様と要件
- `docs/requirements_diff.md` - 仕様変更の追跡
- `docs/mobile-ui-spacing-guidelines.md` - モバイルUIスペーシングガイドライン
- `docs/plan.md` - 開発スプリント計画

<citations>
<document>
    <document_type>RULE</document_type>
    <document_id>IhSevXBoF0MoUuHnxs63YF</document_id>
</document>
<document>
    <document_type>RULE</document_type>
    <document_id>uKfBtjSnLdaLZiSOESkPUQ</document_id>
</document>
</citations>
