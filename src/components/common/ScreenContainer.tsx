import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/styles/theme';

export type ScreenContainerProps = {
  children: React.ReactNode;
  withScroll?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  bottomSpacing?: number; // 追加の下部余白(px)
  topInsetBackgroundColor?: string; // ヘッダー上（セーフエリア上部）の背景色
};

export default function ScreenContainer({
  children,
  withScroll = false,
  contentContainerStyle,
  style,
  bottomSpacing = spacing.xl,
  topInsetBackgroundColor = colors.white,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  if (withScroll) {
    return (
      <View style={[styles.root, style]}>
        {/* Top safe area colorizer */}
        <View style={{ height: insets.top, backgroundColor: topInsetBackgroundColor }} />
        <SafeAreaView style={styles.flex} edges={['bottom']}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.content, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
          >
            {children}
            <View style={{ height: bottomSpacing }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.root, style]}>
      <View style={{ height: insets.top, backgroundColor: topInsetBackgroundColor }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
        <View style={{ height: bottomSpacing }} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  flex: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
