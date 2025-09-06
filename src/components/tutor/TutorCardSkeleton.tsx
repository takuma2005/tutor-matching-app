import React from 'react';
import { View, StyleSheet } from 'react-native';

import { spacing, borderRadius, colors } from '../../styles/theme';
import Skeleton from '../common/Skeleton';

export default function TutorCardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar} />
        <View style={styles.info}>
          <Skeleton width={160} height={16} />
          <View style={{ height: spacing.xs }} />
          <Skeleton width={100} height={12} />
          <View style={{ height: spacing.sm }} />
          <View style={styles.tagsRow}>
            <Skeleton width={50} height={14} radius={borderRadius.sm} />
            <Skeleton width={40} height={14} radius={borderRadius.sm} />
            <Skeleton width={60} height={14} radius={borderRadius.sm} />
          </View>
          <View style={styles.footer}>
            <Skeleton width={120} height={14} />
            <Skeleton width={60} height={12} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray100,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  footer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
