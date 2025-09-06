import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */

import MyPageScreen from '../MyPageScreen';

const mockNavigation: any = {};

describe('MyPageScreen edit flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('edits school name and saves', () => {
    render(<MyPageScreen navigation={mockNavigation} />);

    // switch to edit tab
    fireEvent.press(screen.getByText('編集'));

    // change school field
    const schoolInput = screen.getByPlaceholderText('学校名を入力');
    fireEvent.changeText(schoolInput, 'テスト高校');

    // save
    fireEvent.press(screen.getByText('保存'));

    // verify reflected in info view
    expect(screen.getByText('テスト高校')).toBeTruthy();
  });
});
