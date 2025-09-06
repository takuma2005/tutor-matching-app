import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, spacing, typography, borderRadius } from '@/styles/theme';

type Props = {
  onPressSearch?: () => void;
  onPressReserve?: () => void;
  onPressFavorite?: () => void;
  onPressMatchRequests?: () => void;
};

export default function QuickActions({
  onPressSearch,
  onPressReserve,
  onPressFavorite,
  onPressMatchRequests,
}: Props) {
  return (
    <View style={styles.quickActionCard}>
      <View style={styles.quickActions} testID="quick-actions">
        <TouchableOpacity style={styles.quickActionItem} onPress={onPressSearch}>
          <View style={styles.quickActionIcon}>
            <MaterialIcons name="search" size={24} color={colors.primary} />
          </View>
          <Text style={styles.quickActionText}>探す</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem} onPress={onPressReserve}>
          <View style={styles.quickActionIcon}>
            <MaterialIcons name="school" size={24} color={colors.primary} />
          </View>
          <Text style={styles.quickActionText}>予約</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem} onPress={onPressFavorite}>
          <View style={styles.quickActionIcon}>
            <MaterialIcons name="favorite" size={24} color={colors.primary} />
          </View>
          <Text style={styles.quickActionText}>お気に入り</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem} onPress={onPressMatchRequests}>
          <View style={styles.quickActionIcon}>
            <MaterialIcons name="person-add" size={24} color={colors.primary} />
          </View>
          <Text style={styles.quickActionText}>申請状態</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray700,
    textAlign: 'center',
    fontWeight: '500',
  },
});
