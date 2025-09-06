import { render, screen } from '@testing-library/react-native';
import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */

import MyPageScreen from '../MyPageScreen';

const mockNavigation = {} as any;

describe('MyPageScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      expect(() => render(<MyPageScreen navigation={mockNavigation} />)).not.toThrow();
    });

    it('should render profile card', () => {
      render(<MyPageScreen navigation={mockNavigation} />);

      const profileCard = screen.getByTestId('profile-card');
      expect(profileCard).toBeTruthy();
    });

    it('should not have border radius on profile card', () => {
      render(<MyPageScreen navigation={mockNavigation} />);

      const profileCard = screen.getByTestId('profile-card');
      expect(profileCard).toBeTruthy();
    });
  });

  describe('Header', () => {
    it('should display page title', () => {
      render(<MyPageScreen navigation={mockNavigation} />);

      expect(screen.getByText('マイページ')).toBeTruthy();
    });
  });

  describe('Profile Card', () => {
    it('should display user profile information', () => {
      render(<MyPageScreen navigation={mockNavigation} />);

      const avatar = screen.getByTestId('profile-avatar');
      expect(avatar).toBeTruthy();
      const nameNodes = screen.getAllByText('田中花子');
      expect(nameNodes.length).toBeGreaterThan(0);
      expect(screen.getByText(/\d+コイン/)).toBeTruthy(); // Coin balance
    });
  });

  describe('Tab Navigation', () => {
    it('should display info and edit tabs', () => {
      render(<MyPageScreen navigation={mockNavigation} />);

      expect(screen.getByText('情報')).toBeTruthy();
      expect(screen.getByText('編集')).toBeTruthy();
    });
  });

  describe('Content Sections', () => {
    it('should display basic information sections', () => {
      render(<MyPageScreen navigation={mockNavigation} />);

      expect(screen.getByText('基本情報')).toBeTruthy();
      expect(screen.getByText('連絡先')).toBeTruthy();
      expect(screen.getByText('興味のある科目')).toBeTruthy();
      expect(screen.getByText('自己紹介')).toBeTruthy();
      expect(screen.getByText('設定')).toBeTruthy();
    });
  });
});
