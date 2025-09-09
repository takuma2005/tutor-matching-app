import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import CoinManagementScreen from '../screens/CoinManagementScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import HomeScreen from '../screens/HomeScreen';
import NotificationScreen from '../screens/NotificationScreen';
import TutorDetailScreen from '../screens/TutorDetailScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  TutorDetail: {
    tutorId: string;
  };
  CoinManagement: undefined;
  Notification: undefined;
  Favorite: undefined;
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F6FAFF' },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="TutorDetail" component={TutorDetailScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Favorite" component={FavoriteScreen} />
      <Stack.Screen
        name="CoinManagement"
        component={CoinManagementScreen}
        options={{
          cardShadowEnabled: false,
          cardOverlayEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
