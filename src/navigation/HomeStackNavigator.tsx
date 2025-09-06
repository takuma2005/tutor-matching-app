import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import CoinManagementScreen from '../screens/CoinManagementScreen';
import HomeScreen from '../screens/HomeScreen';
import TutorDetailScreen from '../screens/TutorDetailScreen';
import { colors } from '../styles/theme';

export type HomeStackParamList = {
  HomeMain: undefined;
  TutorDetail: {
    tutorId: string;
  };
  CoinManagement: undefined;
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="TutorDetail" component={TutorDetailScreen} />
      <Stack.Screen
        name="CoinManagement"
        component={CoinManagementScreen}
        options={{
          presentation: 'modal',
          cardShadowEnabled: false,
          cardOverlayEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
