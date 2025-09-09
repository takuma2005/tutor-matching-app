// Range Slider コンポーネント（料金範囲選択用）
// React Native用のシンプルなRange Slider実装

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, spacing, typography, borderRadius } from '@/styles/theme';

interface RangeSliderProps {
  minValue: number;
  maxValue: number;
  onValueChange: (min: number, max: number) => void;
  formatValue?: (value: number) => string;
}

// 料金範囲の事前定義オプション
const RATE_RANGES: { label: string; range: [number, number] }[] = [
  { label: 'すべて', range: [0, 999999] },
  { label: '～1,200', range: [0, 1200] },
  { label: '1,200～1,800', range: [1200, 1800] },
  { label: '1,800～2,400', range: [1800, 2400] },
  { label: '2,400～', range: [2400, 999999] },
];

export const RangeSlider: React.FC<RangeSliderProps> = ({
  minValue,
  maxValue,
  onValueChange,
  formatValue = (value) => `${value.toLocaleString()}コイン`,
}) => {
  const handleRangeSelect = (range: [number, number]) => {
    onValueChange(range[0], range[1]);
  };

  const isRangeActive = (range: [number, number]) => {
    return minValue === range[0] && maxValue === range[1];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>料金範囲</Text>

      <View style={styles.currentValue}>
        <Text style={styles.valueText}>
          {minValue === 0 && maxValue >= 999999
            ? 'すべての料金'
            : `${formatValue(minValue)} - ${formatValue(maxValue)}`}
        </Text>
      </View>

      <View style={styles.rangeOptions}>
        {RATE_RANGES.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.rangeButton, isRangeActive(option.range) && styles.rangeButtonActive]}
            onPress={() => handleRangeSelect(option.range)}
          >
            <Text
              style={[
                styles.rangeButtonText,
                isRangeActive(option.range) && styles.rangeButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  currentValue: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  valueText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    fontWeight: '500',
  },
  rangeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full || 999,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  rangeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rangeButtonText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray700,
  },
  rangeButtonTextActive: {
    color: colors.white,
  },
});
