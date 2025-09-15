import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ErrorBoundary from './src/components/common/ErrorBoundary';
import { AuthProvider } from './src/contexts/AuthContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { UserProvider } from './src/contexts/UserContext';
import RoleBasedNavigator from './src/navigation/RoleBasedNavigator';

function AppContent() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <RoleBasedNavigator />
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
