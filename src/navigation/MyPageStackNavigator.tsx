import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import MatchRequestsScreen from '../screens/MatchRequestsScreen';
import MyPageScreen from '../screens/MyPageScreen';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type MyPageStackParamList = {
  MyPageMain: undefined;
  Profile: undefined;
  ProfileEdit: undefined;
  MatchRequests: undefined;
};

const MyPageStack = createStackNavigator<MyPageStackParamList>();

export default function MyPageStackNavigator() {
  return (
    <MyPageStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MyPageStack.Screen name="MyPageMain" component={MyPageScreen} />
      <MyPageStack.Screen name="Profile" component={ProfileScreen} />
      <MyPageStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <MyPageStack.Screen name="MatchRequests" component={MatchRequestsScreen} />
    </MyPageStack.Navigator>
  );
}
