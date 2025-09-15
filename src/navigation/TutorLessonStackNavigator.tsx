import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import TutorLessonListScreen from '../screens/lessons/tutor/TutorLessonListScreen';

export type TutorLessonStackParamList = {
  TutorLessonList: undefined;
  // TutorLessonDetail: { lessonId: string };
  // Schedule: undefined;
};

const Stack = createStackNavigator<TutorLessonStackParamList>();

export default function TutorLessonStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TutorLessonList" component={TutorLessonListScreen} />
      {/* 将来的にレッスン詳細画面やスケジュール管理画面を追加 */}
    </Stack.Navigator>
  );
}
