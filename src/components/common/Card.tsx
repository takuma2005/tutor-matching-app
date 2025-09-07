import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { colors, borderRadius, shadows, spacing } from '@/styles/theme';

export type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean; // 内側パディングの有無
  elevation?: 'none' | 'sm' | 'md';
};

export default function Card({ children, style, padded = true, elevation = 'sm' }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        elevation === 'sm' ? shadows.sm : elevation === 'md' ? shadows.md : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  padded: {
    padding: spacing.lg,
  },
});
