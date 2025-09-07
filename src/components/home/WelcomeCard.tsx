import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing, typography, borderRadius, shadows } from '@/styles/theme';

type Props = {
  name?: string;
};

export default function WelcomeCard({ name = 'ゲスト' }: Props) {
  return (
    <View style={styles.card} testID="welcome-card">
      <LinearGradient
        colors={['#8EC5FF', '#60A5FA', '#38BDF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.title}>おはよう、{name}さん！</Text>
        <Text style={styles.subtitle}>👋 今日も新しい学びの出会いを見つけよう</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    // 軽い影
    ...shadows.lg,
  },
  gradient: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    color: colors.white,
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.sizes?.body || 16,
  },
});
