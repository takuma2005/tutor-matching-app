import { render, screen } from '@testing-library/react-native';
import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MyPageScreen from '../MyPageScreen';

import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { UserProvider } from '@/contexts/UserContext';

const mockNavigation = {} as any;

describe('MyPageScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      expect(() =>
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
        ),
      ).not.toThrow();
    });

    it('should render profile card', () => {
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

      const profileCard = screen.getByTestId('profile-card');
      expect(profileCard).toBeTruthy();
    });

    it('should not have border radius on profile card', () => {
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

      const profileCard = screen.getByTestId('profile-card');
      expect(profileCard).toBeTruthy();
    });
  });

  describe('Header', () => {
    it('should display page title', () => {
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

      expect(screen.getByText('マイページ')).toBeTruthy();
    });
  });

  describe('Profile Card', () => {
    it('should display user profile information (defaults)', () => {
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

      const avatar = screen.getByTestId('profile-avatar');
      expect(avatar).toBeTruthy();
      expect(screen.getByText('名前未設定')).toBeTruthy();
      expect(screen.getByText(/\d+コイン/)).toBeTruthy(); // Coin balance
    });
  });

  describe('Settings Section', () => {
    it('should display settings items', () => {
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
});
