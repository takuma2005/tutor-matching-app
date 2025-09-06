import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import ChatStackNavigator from './ChatStackNavigator';
import HomeStackNavigator from './HomeStackNavigator';
import MyPageStackNavigator from './MyPageStackNavigator';
import SearchStackNavigator from './SearchStackNavigator';
import LessonScreen from '../screens/LessonScreen';
import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator();

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Chat: undefined;
  Lesson: undefined;
  MyPage: undefined;
};

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  // 下部余白を端末差に左右されすぎない固定値に最適化
  const hasHomeIndicator = insets.bottom >= 20;
  const bottomPad = hasHomeIndicator ? 12 : 6; // Home Indicator あり: 12px / なし: 6px
  const tabBarHeight = 49 + bottomPad; // 標準49 + 余白（コンパクト）

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['bottom']}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray400,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.gray200,
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingBottom: bottomPad,
            paddingTop: 6,
            height: tabBarHeight,
            // 角丸を完全になくす（シームの違和感対策）
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            overflow: 'hidden',
            shadowColor: 'transparent',
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{
            tabBarLabel: 'ホーム',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchStackNavigator}
          options={{
            tabBarLabel: '探す',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatStackNavigator}
          options={{
            tabBarLabel: 'チャット',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="chat" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Lesson"
          component={LessonScreen}
          options={{
            tabBarLabel: '授業',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="school" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="MyPage"
          component={MyPageStackNavigator}
          options={{
            tabBarLabel: 'マイページ',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
