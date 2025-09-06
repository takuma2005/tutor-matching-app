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

import AuthFlow from '@/navigation/auth/AuthStackNavigator';

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
