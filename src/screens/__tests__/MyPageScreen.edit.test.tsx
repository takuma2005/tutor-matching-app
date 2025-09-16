import { render, screen } from '@testing-library/react-native';
import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MyPageScreen from '../MyPageScreen';

import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { UserProvider } from '@/contexts/UserContext';

const mockNavigation: any = {};

describe('MyPageScreen – settings presence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows settings menu items', () => {
    render(
      <SafeAreaProvider>
        <AuthProvider>
          <UserProvider>
            <FavoritesProvider>
              <MyPageScreen navigation={mockNavigation} />
            </FavoritesProvider>
          </UserProvider>
        </AuthProvider>
      </SafeAreaProvider>,
    );

    expect(screen.getByText('設定')).toBeTruthy();
    expect(screen.getByText('コイン管理')).toBeTruthy();
    expect(screen.getByText('ヘルプ・サポート')).toBeTruthy();
    expect(screen.getByText('ログアウト')).toBeTruthy();
  });
});
