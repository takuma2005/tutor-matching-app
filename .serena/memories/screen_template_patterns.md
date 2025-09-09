# 画面テンプレートパターン

## 標準的なスクリーンレイアウトパターン

プロジェクト内の多くのスクリーンで以下のパターンが使われています：

### 1. ScreenContainer設定

```tsx
<ScreenContainer
  withScroll={false}
  contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
>
```

### 2. ヘッダースタイル

```tsx
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg, // 自分でパディング設定
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  // ...
});
```

### 3. 使用例の画面

- SearchScreen (探す)
- CoinManagementScreen (コイン管理)
- NotificationScreen (通知)
- FavoriteScreen (お気に入り)
- LessonHistoryScreen (授業履歴) ← 今回修正済み

## 推奨テンプレート

新しいスクリーンを作成する際は、以下のテンプレートを使用してください：

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import ScreenContainer from '@/components/common/ScreenContainer';
import { colors, spacing, typography, borderRadius } from '@/styles/theme';

type Props = {
  navigation: StackNavigationProp<any, any>;
};

export default function NewScreen({ navigation }: Props) {
  return (
    <ScreenContainer
      withScroll={false}
      contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
    >
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>画面タイトル</Text>
          <Text style={styles.subtitle}>サブタイトル</Text>
        </View>
      </View>

      {/* メインコンテンツ */}
      <View style={styles.content}>{/* コンテンツをここに */}</View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.xxl || 28,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.gray600,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
```

## セーフエリア対応

- **上部セーフエリア**: ScreenContainerのデフォルト（白）を使用
- **左右**: `contentContainerStyle={{ paddingHorizontal: 0 }}`でScreenContainerのパディングを無効化し、各セクションで個別に`paddingHorizontal: spacing.lg`を設定
- **下部**: ScreenContainerのデフォルトセーフエリア対応を使用

## 注意点

新しいスクリーンを作成する際は、このテンプレートに従ってセーフエリアとヘッダーの一貫性を保ってください。既存のスクリーンと異なるパターンを使用する場合は、特別な理由がある場合のみにしてください。
