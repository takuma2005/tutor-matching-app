import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import ChatDetailScreen from '../screens/ChatDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import LessonHistoryScreen from '../screens/LessonHistoryScreen';
import LessonRequestScreen from '../screens/LessonRequestScreen';

export type ChatStackParamList = {
  ChatMain: undefined;
  ChatDetail: {
    chatRoomId: string;
    tutorId: string;
  };
  LessonHistory: {
    tutorId: string;
  };
  LessonRequest: {
    tutorId: string;
    chatRoomId: string;
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
      <Stack.Screen name="LessonHistory" component={LessonHistoryScreen} />
      <Stack.Screen name="LessonRequest" component={LessonRequestScreen} />
    </Stack.Navigator>
  );
}
