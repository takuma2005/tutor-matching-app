import { render, screen } from '@testing-library/react-native';
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

    it('should display new tutors section', () => {
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

      expect(screen.getByText('新着の先輩')).toBeTruthy();
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
  });
});
