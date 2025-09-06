import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, spacing, typography, borderRadius } from '@/styles/theme';

type Props = {
  coins: number;
  onPressCoinManagement: () => void;
  onPressNotification: () => void;
};

export default function HomeHeader({ coins, onPressCoinManagement, onPressNotification }: Props) {
  return (
    <View style={styles.fixedHeader} testID="home-header">
      <Text style={styles.appName}>センパイ</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerCoinButton}
          onPress={onPressCoinManagement}
          testID="header-coin-button"
        >
          <MaterialIcons name="account-balance-wallet" size={18} color={colors.warning} />
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
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
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
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.md,
    height: 32,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  headerCoinText: {
    marginLeft: spacing.xs / 2,
    color: colors.gray800,
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
