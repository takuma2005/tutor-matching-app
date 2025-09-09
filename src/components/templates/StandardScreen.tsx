import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import ScreenContainer, { ScreenContainerProps } from '@/components/common/ScreenContainer';
import { colors, spacing, typography } from '@/styles/theme';

export interface StandardScreenProps extends Omit<ScreenContainerProps, 'children'> {
  navigation?: StackNavigationProp<Record<string, object | undefined>, string>;
  title: string;
  showBackButton?: boolean;
  rightActions?: React.ReactNode;
  children: React.ReactNode;
  onBackPress?: () => void;
}

export default function StandardScreen({
  navigation,
  title,
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
        <View style={styles.headerLeft}>
          {showBackButton ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
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
    height: 56, // 統一されたヘッダー高さ
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerLeft: {
    width: 56, // 固定幅で左右のバランスを統一
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 56, // 固定幅で左右のバランスを統一
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizes.lg || 18,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray900,
    textAlign: 'center',
  },
});
