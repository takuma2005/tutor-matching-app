import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';

import { colors, spacing, borderRadius, typography } from '../../styles/theme';

export type TagProps = {
  children: string;
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Tag({
  children,
  variant = 'solid',
  size = 'sm',
  style,
  textStyle,
}: TagProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'solid' ? styles.solid : styles.outline,
        size === 'sm' ? styles.sm : styles.md,
        style,
      ]}
    >
      <Text
        style={[
          styles.textBase,
          variant === 'solid' ? styles.textOnSolid : styles.textOnOutline,
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
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  solid: {
    backgroundColor: colors.primary,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
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
  textOnSolid: {
    color: colors.white,
  },
  textOnOutline: {
    color: colors.primary,
  },
});
