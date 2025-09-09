# 📊 プロジェクト全体のUIパターン分析レポート

## 🔍 分析結果概要

**合計18スクリーン**を分析した結果、明確に**3つのUIパターン**に分類されました：

### ✅ パターンA：統一済みスクリーン（9画面）

**標準的な実装パターン**を使用している画面群：

- SearchScreen（探す）
- CoinManagementScreen（コイン管理）
- NotificationScreen（通知）
- FavoriteScreen（お気に入り）
- LessonHistoryScreen（授業履歴）
- ChatScreen（チャット）
- ChatDetailScreen（チャット詳細）
- MatchRequestsScreen（マッチング申請）
- TutorDetailScreen（先輩詳細）

**共通パターン**：

```tsx
<ScreenContainer
  withScroll={false}
  contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
>
  <View style={styles.header}>
    <!-- 白背景、自分でpaddingHorizontal: spacing.lg -->
  </View>
  <!-- メインコンテンツ -->
</ScreenContainer>
```

### ⚠️ パターンB：独自実装スクリーン（4画面）

**SafeAreaView**や**KeyboardAvoidingView**を直接使用：

- **MyPageScreen**：SafeAreaView直接使用
- **LessonRequestScreen**：独自のtopInsetBackgroundColor使用
- **LessonScreen**：ScreenContainerだが異なる設定
- **ProfileScreen/ProfileEditScreen**：withScroll使用だが異なる設定

### 🔴 パターンC：Auth系スクリーン（3画面）

**完全に独自の実装**で、ScreenContainer未使用：

- **PhoneVerificationScreen**
- **ProfileSetupScreen**
- **RoleSelectionScreen**

## 🎯 標準UIテンプレート設計

### 推奨パターン

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import ScreenContainer from '@/components/common/ScreenContainer';
import { colors, spacing, typography, borderRadius } from '@/styles/theme';

type Props = {
  navigation: StackNavigationProp<any, any>;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightActions?: React.ReactNode;
};

export default function StandardScreen({
  navigation,
  title,
  subtitle,
  showBackButton = true,
  rightActions,
  children,
}: Props & { children: React.ReactNode }) {
  return (
    <ScreenContainer
      withScroll={false}
      contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
    >
      {/* 標準ヘッダー */}
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.headerRight}>{rightActions}</View>
      </View>

      {/* メインコンテンツ */}
      {children}
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
  headerRight: {
    minWidth: 40,
    alignItems: 'flex-end',
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
});
```

## 🚨 修正が必要なスクリーン

### 1. MyPageScreen

**問題**：SafeAreaViewを直接使用、ScreenContainer未使用
**修正**：StandardScreenテンプレートに移行

### 2. LessonRequestScreen

**問題**：独自のtopInsetBackgroundColor使用
**修正**：標準パターンに統一

### 3. LessonScreen

**問題**：ScreenContainerの設定が不統一
**修正**：contentContainerStyleを標準に統一

### 4. ProfileScreen/ProfileEditScreen

**問題**：withScroll使用だがcontentContainerStyleが不統一
**修正**：標準のwithScrollパターンに統一

### 5. Auth系スクリーン群

**問題**：完全に独自実装、KeyboardAvoidingView使用
**修正**：ScreenContainer内でKeyboardAvoidingViewを使用する形に変更

## 📋 実装計画

1. **StandardScreenテンプレート作成** → `/components/templates/`
2. **段階的リファクタリング** → 各スクリーン個別対応
3. **テスト実行** → レンダリング＆E2Eテスト
4. **ガイドライン更新** → WARPmdにルール追加
5. **チーム周知** → 標準テンプレート必須化

## 🎯 期待効果

- **セーフエリアの統一** → デバイス間での表示一貫性確保
- **開発効率向上** → 新規画面作成時のテンプレート活用
- **保守性向上** → 統一されたコード構造で修正コストを削減
- **品質向上** → デザインシステムとの整合性確保
