import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

import { colors, spacing, borderRadius, typography } from '@/styles/theme';

export type SectionProps = {
  title?: string;
  right?: React.ReactNode; // タイトル横のアクション
  children?: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export default function Section({ title, right, children, style, contentStyle }: SectionProps) {
  return (
    <View style={[styles.base, style]}>
      {(title || right) && (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : <View />}
          {right ? <View>{right}</View> : <View />}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
