# エージェント向けガイドライン

このリポジトリで作業するすべてのエージェントは、本ガイドラインを遵守してください。特に記載がない限り、リポジトリ全体に適用されます。

## 出力と言語ポリシー

- 内部思考メモを含むすべての出力は日本語で記述すること
- 作業内容を共有する際は、目的・変更点・リスク・テスト結果を簡潔にまとめること

---

## WARPガイド（WARP.md と共通）

このドキュメントは、warp.dev でこのリポジトリを扱う際の行動指針をまとめたものです。作業開始前に必ず確認してください。

### プロジェクト概要

- プロダクト: **センパイ（Senpai）** ― 「先輩に教えてもらう青春体験」を届ける家庭教師マッチングアプリ
- フレームワーク: React Native 0.79.6（Expo ~53.0.22）
- 言語: TypeScript ~5.8.3（strict mode）
- 状態管理: Context API + useReducer
- ナビゲーション: React Navigation v6
- バックエンド: Supabase（DB・認証・リアルタイム）
- 決済: Stripe Connect

### ドキュメント確認フロー

1. `docs/requirements.md` で最新仕様を把握する
2. 差分は `docs/requirements_diff.md` を参照し補足する
3. UI 調整時は `docs/mobile-ui-spacing-guidelines.md` を確認する
4. 作業計画は `docs/plan.md` でチェックする

### 主要コマンド

| 目的              | コマンド                                          | 補足                                        |
| ----------------- | ------------------------------------------------- | ------------------------------------------- |
| Expo 開発サーバー | `npm start`                                       | `expo start --clear` でキャッシュクリア起動 |
| デバイス別起動    | `npm run android` / `npm run ios` / `npm run web` | iOS は macOS が必要                         |
| 依存関係追加      | `npm install <package>`                           | lockfile を更新する                         |
| 型チェック        | `npm run -s typecheck`                            | 変更後は必ず実行                            |
| Lint              | `npm run -s lint`                                 | 原則 `--max-warnings=0` を維持              |
| フォーマット確認  | `npx prettier --check .`                          | 必要に応じ `--write` をローカル実行         |

### ディレクトリ構造（抜粋）

```
src/
├── screens/           # 画面コンポーネント
├── components/
│   ├── common/        # 汎用 UI
│   └── tutor/         # 先輩向け UI
├── navigation/        # ルーティング定義
├── services/          # API / 外部サービス連携
├── contexts/          # Context API 実装
├── types/             # TypeScript 型定義
├── styles/            # テーマ / カラーパレット
└── utils/             # ユーティリティ

docs/                  # 仕様・ガイドライン
```

### 設計・アーキテクチャ指針

- MVVM、Atomic Design、Context Pattern を基本とする
- `@/` パスエイリアスで `src/` を参照可能
- 認証コンテキストは `src/contexts/AuthContext.tsx` に集約し、`src/lib/auth-context.tsx` は再エクスポート専用とする
- 型定義は `src/services/api/types.ts` に統一し、`src/types/index.ts` は使用しない

### コーディング規約

- TypeScript: Strict Mode、`any` 禁止（`unknown` or 具象型）、型ガード優先、すべての export に型を付与
- React Native: `useMemo` / `useCallback` / `React.memo` で再レンダーを抑制、リストは `FlatList` で仮想化
- ファイル命名: コンポーネントは PascalCase、hooks や関数は camelCase、設定ファイルは kebab-case
- 例外処理は `catch {}` を基本とし、未使用変数は ESLint の警告を残さない
- 本番コードでの `console.log` は禁止。必要なログは `__DEV__` ガード下でのみ許可

### UI / UX ガイドライン

- 8px グリッドシステム: `xs:8, sm:12, md:16, lg:24, xl:32, xxl:48`
- 推奨パディング: ボタン縦12px×横24px、カード16px、リスト項目縦12px×横16px、画面上32px/横16px/下24px
- タッチターゲット: iOS 44pt、Android 48dp、推奨 48px。フィードバックは opacity 0.7 / scale 0.95 / duration 100ms
- アクセシビリティ: WCAG AA 準拠のコントラスト比、Dynamic Type（iOS）/ Material Design（Android）対応

### ドメインルール

- 用語: 学ぶ側＝後輩、教える側＝先輩
- コイン換算: 1コイン = 1.25円
- マッチング料: 初回 300 コイン
- 決済フロー: 申請 → 仮押さえ → 承認 → エスクロー → 完了 → 送金

### 品質管理

- 小さく安全な差分でコミットし、常に動作可能な状態を維持する
- 不具合修正時は「再現ケース → 最小修正 → 回帰確認」の順で行う
- テストはロジックのユニットテストを優先し、UI はスナップショットのノイズを抑える
- 依存関係更新は基本的に minor / patch のみに留め、major は別途検証計画を用意する

### MCP Tools 推奨フロー

1. 理解: `list_dir` → `get_symbols_overview` → `find_symbol` → `find_referencing_symbols`
2. 編集: `edit_file`、`replace_symbol_body`、`insert_*_symbol`
3. 検証: `think_about_task_adherence`、`think_about_collected_information`
4. メモリ: `write_memory` と `read_memory` を必要に応じて活用

### コミュニケーション

- コミットや PR の作成はユーザーから明示的な指示がある場合のみ行う
- 変更内容は常に要約し、リスクと代替案、テスト結果を併記する
- 生成する思考メモ・出力はすべて日本語で記述する
