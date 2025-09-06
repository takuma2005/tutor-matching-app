import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from '../HomeScreen';

import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { UserProvider } from '@/contexts/UserContext';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

describe('HomeScreen', () => {
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
                  <HomeScreen navigation={mockNavigation as any} />
                </FavoritesProvider>
              </UserProvider>
            </AuthProvider>
          </SafeAreaProvider>,
        ),
      ).not.toThrow();
    });

    it('should display app name in header', () => {
      render(
        <SafeAreaProvider>
          <AuthProvider>
            <UserProvider>
              <FavoritesProvider>
                <HomeScreen navigation={mockNavigation as any} />
              </FavoritesProvider>
            </UserProvider>
          </AuthProvider>
        </SafeAreaProvider>,
      );

      expect(screen.getByText('センパイ')).toBeTruthy();
    });

    it('should display notification icon', () => {
      render(
        <SafeAreaProvider>
          <AuthProvider>
            <UserProvider>
              <FavoritesProvider>
                <HomeScreen navigation={mockNavigation as any} />
              </FavoritesProvider>
            </UserProvider>
          </AuthProvider>
        </SafeAreaProvider>,
      );

      const notificationIcon = screen.getByTestId('notification-icon');
      expect(notificationIcon).toBeTruthy();
    });
  });

  describe('Welcome Section', () => {
    it('should display student greeting', () => {
      render(
        <SafeAreaProvider>
          <AuthProvider>
            <UserProvider>
              <FavoritesProvider>
                <HomeScreen navigation={mockNavigation as any} />
              </FavoritesProvider>
            </UserProvider>
          </AuthProvider>
        </SafeAreaProvider>,
      );

      expect(screen.getByText(/(おはよう|こんにちは).*さん/)).toBeTruthy();
    });

    it('should display subtitle', () => {
      render(
        <SafeAreaProvider>
          <AuthProvider>
            <UserProvider>
              <FavoritesProvider>
                <HomeScreen navigation={mockNavigation as any} />
              </FavoritesProvider>
            </UserProvider>
          </AuthProvider>
        </SafeAreaProvider>,
      );

      expect(screen.getByText(/出会いを見つけよう/)).toBeTruthy();
    });
  });

  describe('Content Sections', () => {
    it('should display coin balance section', () => {
      render(
        <SafeAreaProvider>
          <AuthProvider>
            <UserProvider>
              <FavoritesProvider>
                <HomeScreen navigation={mockNavigation as any} />
              </FavoritesProvider>
            </UserProvider>
          </AuthProvider>
        </SafeAreaProvider>,
      );

      expect(screen.getByTestId('header-coin-button')).toBeTruthy();
    });

    it('should display quick action buttons', () => {
      render(
        <SafeAreaProvider>
          <AuthProvider>
            <UserProvider>
              <FavoritesProvider>
                <HomeScreen navigation={mockNavigation as any} />
              </FavoritesProvider>
            </UserProvider>
          </AuthProvider>
        </SafeAreaProvider>,
      );

      expect(screen.getByText('探す')).toBeTruthy();
      expect(screen.getByText('予約')).toBeTruthy();
      expect(screen.getByText('お気に入り')).toBeTruthy();
      expect(screen.getByText('成果')).toBeTruthy();
    });

    it('should display recommended tutors section', () => {
      render(
        <SafeAreaProvider>
          <AuthProvider>
            <UserProvider>
              <FavoritesProvider>
                <HomeScreen navigation={mockNavigation as any} />
              </FavoritesProvider>
            </UserProvider>
          </AuthProvider>
        </SafeAreaProvider>,
      );

      expect(screen.getByText('おすすめの先輩')).toBeTruthy();
    });

    // NOTE: クイックアクションのナビゲーションは未実装のため、存在のみ確認
    it('should show quick action – search', () => {
      render(
        <SafeAreaProvider>
          <AuthProvider>
            <UserProvider>
              <FavoritesProvider>
                <HomeScreen navigation={mockNavigation as any} />
              </FavoritesProvider>
            </UserProvider>
          </AuthProvider>
        </SafeAreaProvider>,
      );
      expect(screen.getByText('探す')).toBeTruthy();
    });
  });
});
