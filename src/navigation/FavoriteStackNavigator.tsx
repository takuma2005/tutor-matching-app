import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import FavoriteScreen from '../screens/FavoriteScreen';
import TutorDetailScreen from '../screens/TutorDetailScreen';
import { colors } from '../styles/theme';

export type FavoriteStackParamList = {
  FavoriteMain: undefined;
  TutorDetail: {
    tutorId: string;
  };
};

const Stack = createStackNavigator<FavoriteStackParamList>();

export default function FavoriteStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="FavoriteMain" component={FavoriteScreen} />
      <Stack.Screen name="TutorDetail" component={TutorDetailScreen} />
    </Stack.Navigator>
  );
}
