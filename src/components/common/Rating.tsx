import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing } from '../../styles/theme';

export type RatingProps = {
  value: number; // 0.0 - 5.0
  max?: number;
  size?: number;
  showValue?: boolean;
};

export default function Rating({ value, max = 5, size = 16, showValue = true }: RatingProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.5 && full < max;
  const empty = max - full - (hasHalf ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {Array.from({ length: full }).map((_, i) => (
          <MaterialIcons key={`full-${i}`} name="star" size={size} color={colors.warning} />
        ))}
        {hasHalf && <MaterialIcons name="star-half" size={size} color={colors.warning} />}
        {Array.from({ length: Math.max(0, empty) }).map((_, i) => (
          <MaterialIcons key={`empty-${i}`} name="star-border" size={size} color={colors.warning} />
        ))}
      </View>
      {showValue && <Text style={styles.valueText}>{value.toFixed(1)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    marginLeft: spacing.xs,
    color: colors.gray700,
    fontSize: 12,
  },
});
