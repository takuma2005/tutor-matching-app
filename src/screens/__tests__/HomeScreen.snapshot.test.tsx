import { render } from '@testing-library/react-native';
import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from '../HomeScreen';

import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { UserProvider } from '@/contexts/UserContext';

const mockNavigation = { navigate: jest.fn() };

describe('HomeScreen snapshot', () => {
  it('matches snapshot', () => {
    const { toJSON } = render(
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
    expect(toJSON()).toMatchSnapshot();
  });
});
