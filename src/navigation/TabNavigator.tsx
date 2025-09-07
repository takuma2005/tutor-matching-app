import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';

import ChatStackNavigator from './ChatStackNavigator';
import HomeStackNavigator from './HomeStackNavigator';
import MyPageStackNavigator from './MyPageStackNavigator';
import SearchStackNavigator from './SearchStackNavigator';
import BlurTabBar from '../components/navigation/BlurTabBar';
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
  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <BlurTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator} />
        <Tab.Screen name="Search" component={SearchStackNavigator} />
        <Tab.Screen name="Chat" component={ChatStackNavigator} />
        <Tab.Screen name="Lesson" component={LessonScreen} />
        <Tab.Screen name="MyPage" component={MyPageStackNavigator} />
      </Tab.Navigator>
    </View>
  );
}
