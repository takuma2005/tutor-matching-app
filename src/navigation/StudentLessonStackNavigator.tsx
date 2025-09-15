import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import StudentLessonListScreen from '../screens/lessons/student/StudentLessonListScreen';

export type StudentLessonStackParamList = {
  StudentLessonList: undefined;
  // StudentLessonDetail: { lessonId: string };
};

const Stack = createStackNavigator<StudentLessonStackParamList>();

export default function StudentLessonStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="StudentLessonList" component={StudentLessonListScreen} />
      {/* 将来的にレッスン詳細画面を追加 */}
    </Stack.Navigator>
  );
}
