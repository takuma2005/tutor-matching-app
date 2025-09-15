import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { useAuth } from '../contexts/AuthContext';
import CoinManagementScreen from '../screens/CoinManagementScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import HomeScreen from '../screens/HomeScreen'; // Legacy fallback
import NotificationScreen from '../screens/NotificationScreen';
import TutorDetailScreen from '../screens/TutorDetailScreen';
import StudentHomeScreen from '../screens/home/StudentHomeScreen';
import TutorHomeScreen from '../screens/home/TutorHomeScreen';

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
  const { role } = useAuth();

  // 役割に応じたホーム画面を選択
  const HomeComponent = React.useMemo(() => {
    switch (role) {
      case 'tutor':
        return TutorHomeScreen;
      case 'student':
        return StudentHomeScreen;
      default:
        return HomeScreen; // Legacy fallback
    }
  }, [role]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F6FAFF' },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeComponent} />
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
