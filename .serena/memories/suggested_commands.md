# Senpaiアプリ 開発コマンド集

## 基本開発コマンド

```bash
# 開発サーバー起動
npm start

# プラットフォーム別起動
npm run android    # Android端末・エミュレーター
npm run ios        # iOSシミュレーター（macOSのみ）
npm run web        # ブラウザ版

# 依存関係管理
npm install [package-name]
expo install [package-name]  # Expo対応版パッケージ

# キャッシュクリア + 起動
expo start --clear
```

## テスト関連コマンド

```bash
# テスト実行
npm test
npm run test:watch     # ウォッチモード
npm run test:coverage  # カバレッジ付き
```

## 型チェック・開発ツール

```bash
# TypeScriptコンパイルチェック
npx tsc --noEmit

# Metro Bundlerログ確認
# Expo Goアプリで実機テスト推奨
```

## Windows環境固有

- パス区切り文字: `\\` または `/`
- PowerShell使用
- Expo Goアプリでの実機テスト推奨

## 重要な開発フロー

1. `docs/requirements.md`で仕様確認
2. 型定義を`src/types/index.ts`に追加
3. コンポーネント・画面作成
4. 実機テスト（Expo Go）
5. TypeScriptエラー確認

## パッケージ管理の注意

- Expoバージョンに合わせたパッケージを使用
- ネイティブ依存関係は`expo install`を使用
- パッケージ追加後はMetroサーバー再起動必須
