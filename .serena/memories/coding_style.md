# センパイ コーディングスタイル・規約

## TypeScript規約

- **strict mode** 有効 (`tsconfig.json`)
- **型ガード**を優先的に使用
- `??` (nullish coalescing) と `?.` (optional chaining) を積極活用
- `unknown` を `any` より優先
- すべてのexportに型定義必須

## React Native規約

- **useMemo** / **useCallback** でパフォーマンス最適化
- **単一責任の原則**に基づくコンポーネント設計
- **React.memo()** で不要なre-renderを防止
- **FlatList**の仮想化機能を最大活用

## ファイル・ディレクトリ規約

- **PascalCase**: コンポーネントファイル (例: `HomeScreen.tsx`)
- **camelCase**: 関数・変数・hooks (例: `useAuth.ts`)
- **kebab-case**: 設定ファイル (例: `app.json`)
- **Atomic Design原則**: components/common/, components/tutor/

## パスエイリアス

```typescript
// babel.config.js + tsconfig.json で設定済み
import { Button } from '@/components/common/Button';
import { theme } from '@/styles/theme';
```

## スタイリング規約

- **8px グリッドシステム**採用 (spacing.ts)
- **色の統一管理** (colors.ts)
- **プラットフォーム別対応**:
  - iOS: SF Symbols, Dynamic Type対応
  - Android: Material Design, エレベーション効果
- **WCAG AA準拠**のコントラスト比確保
- **最小タッチ領域**: 44pt以上

## エラーハンドリング

- **ErrorBoundary**でアプリクラッシュ防止
- **try-catch**でAPIエラー処理
- 開発環境のみログ出力

## セキュリティ

- **入力検証**: Yup/Zodライブラリ使用
- **APIキー**: 環境変数に格納
- **HTTPS**通信強制

## アクセシビリティ

- **accessibilityLabel** / **accessibilityRole**設定
- コントラスト比確保
- スクリーンリーダー対応

## 命名規則

- **後輩**（学ぶ側）、**先輩**（教える側）で用語統一
- サービス名：**センパイ（Senpai）**
