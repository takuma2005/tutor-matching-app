# モバイルアプリUIスペーシングガイドライン

## セーフエリアとレイアウト

### 1. セーフエリア考慮事項

#### iOSデバイス

- **Status Bar**: 44px (iPhone X以降)、20px (旧機種)
- **Home Indicator**: 34px (iPhone X以降)
- **Navigation Bar**: 44px (標準)
- **Tab Bar**: 83px (セーフエリア込み)、49px (コンテンツ高)

#### Androidデバイス

- **Status Bar**: 24px (標準)
- **Navigation Bar**: 48px (標準)
- **System Navigation**: 手ぶらナビゲーション考慮

### 2. 推奨スペーシング

#### 画面レベル

```typescript
const ScreenSpacing = {
  // セーフエリア対応
  top: 44, // ステータスバー + 追加マージン
  bottom: 34, // ホームインジケーター + 追加マージン
  horizontal: 16, // 画面左右マージン

  // コンテンツ間隔
  sectionGap: 24, // セクション間
  itemGap: 16, // アイテム間

  // ヘッダー・フッター
  headerHeight: 56,
  tabBarHeight: 60,
};
```

#### タッチターゲット

```typescript
const TouchTargets = {
  // プラットフォーム別最小サイズ
  ios: {
    minTouchSize: 44, // Apple HIG
    recommendedPadding: 8,
  },
  android: {
    minTouchSize: 48, // Material Design
    recommendedPadding: 8,
  },
  // 実用的推奨値
  recommended: {
    minTouchSize: 48, // 両プラットフォーム互換
    optimalSize: 56, // より快適な操作
  },
};
```

### 3. レスポンシブスペーシング

#### 画面サイズ別調整

```typescript
const ResponsiveSpacing = {
  // 小画面 (< 375px width)
  small: {
    screenPadding: 12,
    sectionGap: 20,
    itemGap: 12,
  },
  // 標準 (375-414px)
  medium: {
    screenPadding: 16,
    sectionGap: 24,
    itemGap: 16,
  },
  // 大画面 (> 414px)
  large: {
    screenPadding: 20,
    sectionGap: 32,
    itemGap: 20,
  },
};
```

## 実装パターン

### 1. SafeAreaView使用パターン

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// 推奨パターン
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
  <ScrollView style={styles.content}>
    {/* コンテンツ */}
  </ScrollView>
</SafeAreaView>

// 部分的セーフエリア
<View style={styles.container}>
  <SafeAreaView style={styles.header} edges={['top']}>
    {/* ヘッダー */}
  </SafeAreaView>
  <ScrollView style={styles.content}>
    {/* メインコンテンツ */}
  </ScrollView>
  <SafeAreaView style={styles.footer} edges={['bottom']}>
    {/* フッター */}
  </SafeAreaView>
</View>
```

### 2. 動的スペーシング

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ScreenComponent() {
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      paddingTop: insets.top + 16, // セーフエリア + 追加マージン
      paddingBottom: insets.bottom + 16,
      paddingHorizontal: 16,
    }
  });

  return <View style={styles.container}>{/* ... */}</View>;
}
```

## プラットフォーム別考慮事項

### iOS

- **Dynamic Island**: iPhone 14 Pro以降で上部59pxの考慮
- **Home Indicator**: 34px底部スペース必須
- **Notch**: ランドスケープ時の左右考慮

### Android

- **Gesture Navigation**: Android 10以降のナビゲーション
- **Different Screen Ratios**: 16:9, 18:9, 19.5:9対応
- **Software Buttons**: ナビゲーションバー表示時の追加考慮

## 検証・テストポイント

1. **実機での確認**: エミュレータでは不十分
2. **回転対応**: Portrait/Landscapeでの表示確認
3. **アクセシビリティ**: 文字サイズ拡大時の表示
4. **エッジケース**: 最小/最大画面サイズでのテスト

## 参考資料

- [Apple Human Interface Guidelines - Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Material Design - Understanding layout](https://m3.material.io/foundations/layout/understanding-layout/overview)
- [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)
