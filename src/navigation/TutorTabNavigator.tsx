import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';

import ChatStackNavigator from './ChatStackNavigator';
import HomeStackNavigator from './HomeStackNavigator';
import MyPageStackNavigator from './MyPageStackNavigator';
import RequestStackNavigator from './RequestStackNavigator';
import TutorLessonStackNavigator from './TutorLessonStackNavigator';
import BlurTabBar from '../components/navigation/BlurTabBar';
import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator();

export type TutorTabParamList = {
  Home: undefined;
  Requests: undefined;
  Chat: undefined;
  Lesson: undefined;
  MyPage: undefined;
};

export default function TutorTabNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <BlurTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator} />
        <Tab.Screen name="Requests" component={RequestStackNavigator} />
        <Tab.Screen name="Chat" component={ChatStackNavigator} />
        <Tab.Screen name="Lesson" component={TutorLessonStackNavigator} />
        <Tab.Screen name="MyPage" component={MyPageStackNavigator} />
      </Tab.Navigator>
    </View>
  );
}
