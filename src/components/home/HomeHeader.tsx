import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, spacing, typography, borderRadius } from '@/styles/theme';

type Props = {
  coins: number;
  onPressCoinManagement: () => void;
  onPressNotification: () => void;
  backgroundOpacity?: number; // 0.0 - 1.0
};

export default function HomeHeader({
  coins,
  onPressCoinManagement,
  onPressNotification,
  backgroundOpacity = 0.2,
}: Props) {
  return (
    <View
      style={[
        styles.fixedHeader,
        {
          backgroundColor: `rgba(255,255,255,${backgroundOpacity})`,
          shadowColor: backgroundOpacity > 0.5 ? colors.black : 'transparent',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: Math.max(0, (backgroundOpacity - 0.5) * 0.2),
          shadowRadius: 2,
          elevation: backgroundOpacity > 0.5 ? 1 : 0,
        },
      ]}
      testID="home-header"
    >
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
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    zIndex: 1000,
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
