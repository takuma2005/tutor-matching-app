import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import ScreenContainer, { ScreenContainerProps } from '@/components/common/ScreenContainer';
import { colors, spacing, typography, borderRadius } from '@/styles/theme';

export interface StandardScreenProps extends Omit<ScreenContainerProps, 'children'> {
  navigation?: StackNavigationProp<Record<string, object | undefined>, string>;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightActions?: React.ReactNode;
  children: React.ReactNode;
  onBackPress?: () => void;
}

export default function StandardScreen({
  navigation,
  title,
  subtitle,
  showBackButton = true,
  rightActions,
  children,
  onBackPress,
  withScroll = false,
  contentContainerStyle,
  ...screenContainerProps
}: StandardScreenProps) {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const standardContentContainerStyle = {
    paddingHorizontal: 0,
    paddingTop: 0,
    ...contentContainerStyle,
  };

  return (
    <ScreenContainer
      withScroll={withScroll}
      contentContainerStyle={standardContentContainerStyle}
      {...screenContainerProps}
    >
      {/* 標準ヘッダー */}
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}

        <View style={styles.headerContent}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.headerRight}>{rightActions}</View>
      </View>

      {/* メインコンテンツ */}
      {children}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
    marginRight: spacing.md,
  },
  headerSpacer: {
    width: 40,
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerRight: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: typography.fontSizes.xxl || 28,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.gray600,
  },
});
