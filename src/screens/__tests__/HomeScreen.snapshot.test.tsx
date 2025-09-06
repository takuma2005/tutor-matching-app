import { render } from '@testing-library/react-native';
import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */

import HomeScreen from '../HomeScreen';

const mockNavigation = { navigate: jest.fn() };

describe('HomeScreen snapshot', () => {
  it('matches snapshot', () => {
    const { toJSON } = render(<HomeScreen navigation={mockNavigation as any} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
