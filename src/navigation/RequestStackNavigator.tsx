import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import MatchRequestDetailScreen from '../screens/requests/MatchRequestDetailScreen';
import MatchRequestListScreen from '../screens/requests/MatchRequestListScreen';

export type RequestStackParamList = {
  MatchRequestList: undefined;
  MatchRequestDetail: { requestId: string };
};

const Stack = createStackNavigator<RequestStackParamList>();

export default function RequestStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MatchRequestList" component={MatchRequestListScreen} />
      <Stack.Screen name="MatchRequestDetail" component={MatchRequestDetailScreen} />
    </Stack.Navigator>
  );
}
