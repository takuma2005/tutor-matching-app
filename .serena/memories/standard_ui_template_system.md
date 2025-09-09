# 🎨 標準UIテンプレートシステム

## 📐 基本設計思想

### ScreenContainer統一ルール

**全てのスクリーンでScreenContainerを使用**し、一貫したセーフエリア・レイアウト管理を実現。

```tsx
// ✅ 推奨パターン
<ScreenContainer
  withScroll={false}  // またはtrue
  contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
>
  {/* コンテンツ */}
</ScreenContainer>

// ❌ 非推奨パターン
<SafeAreaView>
<KeyboardAvoidingView>
```

### ヘッダー統一仕様

```tsx
const standardHeaderStyles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg, // 24px
    paddingTop: spacing.sm, // 8px
    paddingBottom: spacing.md, // 16px
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
};
```

## 🏗️ テンプレート種別

### A. StandardScreen（基本型）

**用途**：一般的な画面（リスト、詳細、設定など）
**特徴**：

- 戻るボタン
- タイトル＋サブタイトル
- 右側アクション（オプション）

### B. ScrollableScreen（スクロール型）

**用途**：長いコンテンツ、フォーム画面
**特徴**：

- withScroll={true}
- KeyboardAvoidingView統合
- 下部余白自動調整

### C. TabScreen（タブ型）

**用途**：ホーム、検索、チャットなど
**特徴**：

- タブナビゲーション対応
- ヘッダーのみ、戻るボタンなし

### D. ModalScreen（モーダル型）

**用途**：モーダル表示、設定編集
**特徴**：

- クローズボタン
- 保存/キャンセルアクション

### E. AuthScreen（認証型）

**用途**：ログイン、サインアップ、認証
**特徴**：

- KeyboardAvoidingView統合
- 中央レイアウト
- 特殊背景色対応

## 📂 ファイル構成

```
src/
├── components/
│   ├── templates/
│   │   ├── StandardScreen.tsx      // 基本テンプレート
│   │   ├── ScrollableScreen.tsx    // スクロール対応
│   │   ├── TabScreen.tsx          // タブ画面用
│   │   ├── ModalScreen.tsx        // モーダル用
│   │   ├── AuthScreen.tsx         // 認証画面用
│   │   └── index.ts               // まとめてexport
│   └── common/
│       ├── ScreenContainer.tsx     // 既存コンポーネント
│       └── StandardHeader.tsx      // 共通ヘッダー
└── screens/
    └── ExampleScreen.tsx          // テンプレート使用例
```

## 🔧 実装例

### StandardScreen使用例

```tsx
import { StandardScreen } from '@/components/templates';

export default function ExampleScreen({ navigation }) {
  return (
    <StandardScreen
      navigation={navigation}
      title="画面タイトル"
      subtitle="サブタイトル"
      rightActions={
        <TouchableOpacity onPress={() => {}}>
          <MaterialIcons name="more-vert" size={24} />
        </TouchableOpacity>
      }
    >
      <View style={{ flex: 1, padding: spacing.lg }}>{/* メインコンテンツ */}</View>
    </StandardScreen>
  );
}
```

### ScrollableScreen使用例

```tsx
import { ScrollableScreen } from '@/components/templates';

export default function FormScreen({ navigation }) {
  return (
    <ScrollableScreen navigation={navigation} title="フォーム画面" enableKeyboardAvoiding>
      {/* フォームコンテンツ */}
    </ScrollableScreen>
  );
}
```

## 📋 移行チェックリスト

### 既存画面の移行手順

- [ ] 現在の実装パターンを確認
- [ ] 適切なテンプレートを選択
- [ ] SafeAreaView/KeyboardAvoidingViewを削除
- [ ] ScreenContainerの設定を標準化
- [ ] ヘッダースタイルを統一
- [ ] 動作テスト（iOS/Android）
- [ ] 視覚的回帰テスト

### 新規画面の作成手順

- [ ] テンプレート選択
- [ ] props設定
- [ ] メインコンテンツ実装
- [ ] レスポンシブ対応確認
- [ ] アクセシビリティ対応

## ⚙️ ESLintルール設定

```js
// .eslintrc.js
rules: {
  // SafeAreaView直接使用を禁止
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['react-native-safe-area-context'],
          message: 'Use ScreenContainer instead of SafeAreaView directly'
        }
      ]
    }
  ],

  // KeyboardAvoidingView直接使用を警告
  'react-native/no-raw-keyboard-avoiding-view': 'warn'
}
```

## 🎯 品質指標

### コード品質

- **統一性**: 全画面でScreenContainer使用率100%
- **再利用性**: テンプレートコンポーネント利用率90%以上
- **保守性**: ヘッダースタイル重複削減80%以上

### UX品質

- **一貫性**: セーフエリア表示の統一
- **アクセシビリティ**: スクリーンリーダー対応統一
- **レスポンシブ**: 全デバイスサイズで正常表示
