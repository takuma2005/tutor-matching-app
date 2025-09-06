# Senpaiアプリ コーディング規約・スタイルガイド

## TypeScript規約

- **Strict Mode**: 必須（`tsconfig.json`で有効）
- **型ガード**優先、`any`より`unknown`を使用
- **Nullish coalescing** (`??`) と **Optional chaining** (`?.`) を活用
- 全exportに型定義必須

## React Native規約

- **useMemo**/**useCallback**: パフォーマンス最適化必須
- **React.memo()**: 不要なre-render防止
- **FlatList**: 大量データは仮想化必須
- **単一責任の原則**: コンポーネント設計

## ファイル命名規則

- **PascalCase**: コンポーネント (`HomeScreen.tsx`)
- **camelCase**: hooks・関数 (`useAuth.ts`)
- **kebab-case**: 設定ファイル (`app.json`)

## UI/UX設計ルール

```typescript
// 8pxグリッドシステム採用
const spacing = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };

// 最小タッチ領域44pt以上
const TouchTarget = { minSize: 44 };

// WCAG AA準拠のコントラスト比
```

## パフォーマンス要件

- **初期ロード**: 3秒以内
- **主要画面レスポンス**: 1.5秒以内
- **チャット送信**: 1秒以内
- **FlatList**: 仮想化で大量データ対応

## アクセシビリティ要件

- **accessibilityLabel**/**accessibilityRole**: 重要UI要素に設定
- **カラーコントラスト**: WCAG AA準拠
- **タッチ領域**: 最小44pt確保

## セキュリティ要件

- **入力検証**: 全ユーザー入力をバリデーション
- **APIキー**: 環境変数（`EXPO_PUBLIC_*`）で管理
- **HTTPS**: 全API通信必須

## エラーハンドリング

```typescript
// ErrorBoundaryでアプリクラッシュ防止
// APIエラーはtry-catchで適切に処理
// 開発環境のみログ出力
```

## プラットフォーム対応

- **iOS**: SF Symbols、Dynamic Type対応
- **Android**: Material Design、エレベーション効果
- **両対応**: Platform.OSまたは`.ios.tsx`/`.android.tsx`ファイル
