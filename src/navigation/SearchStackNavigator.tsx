import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import SearchScreen from '../screens/SearchScreen';
import TutorDetailScreen from '../screens/TutorDetailScreen';
import { colors } from '../styles/theme';

export type SearchStackParamList = {
  SearchMain: undefined;
  TutorDetail: {
    tutorId: string;
  };
};

const Stack = createStackNavigator<SearchStackParamList>();

export default function SearchStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="TutorDetail" component={TutorDetailScreen} />
    </Stack.Navigator>
  );
}
