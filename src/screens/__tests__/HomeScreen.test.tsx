import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */

import HomeScreen from '../HomeScreen';

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
      expect(() => render(<HomeScreen navigation={mockNavigation as any} />)).not.toThrow();
    });

    it('should display app name in header', () => {
      render(<HomeScreen navigation={mockNavigation as any} />);

      expect(screen.getByText('TutorLink')).toBeTruthy();
    });

    it('should display notification icon', () => {
      render(<HomeScreen navigation={mockNavigation as any} />);

      const notificationIcon = screen.getByTestId('notification-icon');
      expect(notificationIcon).toBeTruthy();
    });
  });

  describe('Welcome Section', () => {
    it('should display student greeting', () => {
      render(<HomeScreen navigation={mockNavigation as any} />);

      expect(screen.getByText(/こんにちは、.*さん/)).toBeTruthy();
    });

    it('should display subtitle', () => {
      render(<HomeScreen navigation={mockNavigation as any} />);

      expect(screen.getByText('今日も素敵な先輩との出会いを見つけよう')).toBeTruthy();
    });
  });

  describe('Content Sections', () => {
    it('should display coin balance section', () => {
      render(<HomeScreen navigation={mockNavigation as any} />);

      expect(screen.getByText('コイン残高')).toBeTruthy();
    });

    it('should display quick action buttons', () => {
      render(<HomeScreen navigation={mockNavigation as any} />);

      expect(screen.getByText('探す')).toBeTruthy();
      expect(screen.getByText('予約')).toBeTruthy();
      expect(screen.getByText('お気に入り')).toBeTruthy();
      expect(screen.getByText('成果')).toBeTruthy();
    });

    it('should display recommended tutors section', () => {
      render(<HomeScreen navigation={mockNavigation as any} />);

      expect(screen.getByText('おすすめの先輩')).toBeTruthy();
    });

    it('should navigate to search when pressing search quick action', () => {
      render(<HomeScreen navigation={mockNavigation as any} />);
      const searchButton = screen.getByText('探す');
      fireEvent.press(searchButton);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
