import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

import { colors, spacing, typography } from '../../styles/theme';

export type BadgeProps = {
  children: React.ReactNode;
  color?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const colorMap = {
  success: { bg: colors.success, fg: colors.white },
  warning: { bg: colors.warning, fg: colors.white },
  error: { bg: colors.error, fg: colors.white },
  info: { bg: colors.primary, fg: colors.white },
  neutral: { bg: colors.gray200, fg: colors.gray700 },
};

export default function Badge({
  children,
  color = 'info',
  size = 'sm',
  style,
  textStyle,
}: BadgeProps) {
  const palette = colorMap[color];
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: palette.bg },
        size === 'sm' ? styles.sm : styles.md,
        style,
      ]}
    >
      <Text
        style={[
          styles.textBase,
          { color: palette.fg },
          size === 'sm' ? styles.textSm : styles.textMd,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  sm: {
    minHeight: 18,
  },
  md: {
    minHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  textBase: {
    fontWeight: typography.fontWeights.medium,
  },
  textSm: {
    fontSize: typography.fontSizes.xs,
  },
  textMd: {
    fontSize: typography.fontSizes.sm,
  },
});
