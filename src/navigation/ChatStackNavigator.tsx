import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import ChatDetailScreen from '../screens/ChatDetailScreen';
import ChatScreen from '../screens/ChatScreen';

export type ChatStackParamList = {
  ChatMain: undefined;
  ChatDetail: {
    chatRoomId: string;
    tutorId: string;
  };
};

const Stack = createStackNavigator<ChatStackParamList>();

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="ChatMain" component={ChatScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
}
