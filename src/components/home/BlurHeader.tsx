import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography, borderRadius } from '@/styles/theme';

type Props = {
  coins: number;
  onPressCoinManagement: () => void;
  onPressNotification: () => void;
  scrollY: number; // スクロール位置
};

export default function BlurHeader({
  coins,
  onPressCoinManagement,
  onPressNotification /* scrollY */,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Opaque Background */}
      <View style={[styles.blurBackground, { backgroundColor: colors.white }]} />

      {/* Header Content */}
      <View style={styles.headerContent}>
        <Text style={styles.appName}>センパイ</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerCoinButton}
            onPress={onPressCoinManagement}
            testID="header-coin-button"
          >
            <MaterialIcons name="paid" size={16} color={colors.warning} />
            <Text style={styles.headerCoinText}>{coins.toLocaleString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationButton}
            testID="notification-icon"
            onPress={onPressNotification}
          >
            <MaterialIcons name="notifications" size={20} color={colors.gray700} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Border */}
      <View style={styles.bottomBorder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBorder: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray200,
  },
  appName: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '700',
    color: colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerCoinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm + spacing.xs,
    height: 28,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  headerCoinText: {
    marginLeft: spacing.xs,
    color: colors.warning,
    fontWeight: '700',
    fontSize: typography.sizes?.caption || 12,
  },
  notificationButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
