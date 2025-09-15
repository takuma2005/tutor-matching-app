import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import type { ComponentProps } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/styles/theme';

const tabIcons = {
  Home: 'home',
  Search: 'search',
  Chat: 'chat',
  Lesson: 'school',
  MyPage: 'person',
  Requests: 'assignment',
} as const;

const tabLabels = {
  Home: 'ホーム',
  Search: '探す',
  Chat: 'チャット',
  Lesson: '授業',
  MyPage: 'マイページ',
  Requests: '申請',
} as const;

type TabName = keyof typeof tabIcons;

type Props = BottomTabBarProps;

export default function BlurTabBar({ state, descriptors: _descriptors, navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* Opaque Background */}
      <View style={[styles.blurBackground, { backgroundColor: colors.white }]} />

      {/* Top Border */}
      <View style={styles.topBorder} />

      {/* Tab Items */}
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const tabName = route.name as TabName;
          const iconName = tabIcons[tabName] || 'home';
          type IconName = ComponentProps<typeof MaterialIcons>['name'];
          const label = tabLabels[tabName] || route.name;

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem}>
              <MaterialIcons
                name={iconName as IconName}
                size={24}
                color={isFocused ? colors.primary : colors.gray400}
              />
              <Text
                style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.gray400 }]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
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
  topBorder: {
    height: 1,
    backgroundColor: colors.gray200,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
