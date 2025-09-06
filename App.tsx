import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ErrorBoundary from './src/components/common/ErrorBoundary';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { UserProvider } from './src/contexts/UserContext';
import TabNavigator from './src/navigation/TabNavigator';
import PhoneVerificationScreen from './src/screens/auth/PhoneVerificationScreen';
import ProfileSetupScreen, { ProfileData } from './src/screens/auth/ProfileSetupScreen';
import RoleSelectionScreen from './src/screens/auth/RoleSelectionScreen';

type AuthStep = 'role' | 'phone' | 'profile' | 'completed';

function AuthFlow() {
  const [authStep, setAuthStep] = useState<AuthStep>('role');
  const [selectedRole, setSelectedRole] = useState<'student' | 'tutor'>('student');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { signIn } = useAuth();

  const handleRoleSelect = (role: 'student' | 'tutor') => {
    setSelectedRole(role);
    setAuthStep('phone');
  };

  const handleVerificationComplete = (phone: string, code: string) => {
    setPhoneNumber(phone);
    setAuthStep('profile');
  };

  const handleProfileComplete = async (profileData: ProfileData) => {
    // モック：ユーザー登録処理
    const userData = {
      id: Date.now().toString(),
      role: selectedRole,
      phoneNumber,
      ...profileData,
    };

    await signIn(userData);
    setAuthStep('completed');
  };

  switch (authStep) {
    case 'role':
      return <RoleSelectionScreen onRoleSelect={handleRoleSelect} />;
    case 'phone':
      return (
        <PhoneVerificationScreen
          role={selectedRole}
          onVerificationComplete={handleVerificationComplete}
        />
      );
    case 'profile':
      return (
        <ProfileSetupScreen
          role={selectedRole}
          phoneNumber={phoneNumber}
          onProfileComplete={handleProfileComplete}
        />
      );
    default:
      return <TabNavigator />;
  }
}

function AppContent() {
  const { user } = useAuth();

  // 開発用：ログイン状態をスキップしてホーム画面からスタート
  const SKIP_AUTH_FOR_DEVELOPMENT = __DEV__ && process.env.EXPO_PUBLIC_SKIP_AUTH === 'true';

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {user || SKIP_AUTH_FOR_DEVELOPMENT ? <TabNavigator /> : <AuthFlow />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <UserProvider>
            <FavoritesProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </FavoritesProvider>
          </UserProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
