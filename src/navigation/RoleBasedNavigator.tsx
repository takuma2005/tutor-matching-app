import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import StudentTabNavigator from './StudentTabNavigator';
import TutorTabNavigator from './TutorTabNavigator';
import AuthFlow from './auth/AuthStackNavigator';
import { useAuth } from '../contexts/AuthContext';
import ProfileCompletionScreen from '../screens/ProfileCompletionScreen';
import { colors, spacing, typography } from '../styles/theme';

export default function RoleBasedNavigator() {
  const { user, role, isLoading, needsProfileCompletion } = useAuth();

  // ローディング中のスプラッシュ画面
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  // 未ログインの場合は認証フローを表示
  if (!user || !role) {
    return <AuthFlow />;
  }

  // プロフィール補完が必要な場合はProfileCompletionScreenを表示
  if (needsProfileCompletion) {
    return <ProfileCompletionScreen />;
  }

  // ログイン済みの場合は役割に応じたタブナビゲーションを表示
  switch (role) {
    case 'student':
      return <StudentTabNavigator />;
    case 'tutor':
      return <TutorTabNavigator />;
    default:
      // 想定外の役割の場合は認証フローに戻す
      console.warn('Unknown user role:', role);
      return <AuthFlow />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
  },
});
