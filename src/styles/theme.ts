export const colors = {
  // Primary colors
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#60a5fa',

  // Secondary colors
  secondary: '#10b981',
  secondaryDark: '#059669',
  secondaryLight: '#34d399',

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral colors
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  black: '#000000',

  // Background colors
  background: '#f3f4f6',
  surface: '#ffffff',
  surfaceLight: '#f9fafb',
  appBackground: '#F6FAFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // セーフエリア対応スペーシング
  safeArea: {
    top: 16, // ステータスバー後のミニマルマージン
    bottom: 16, // ホームインジケーター前のミニマルマージン
  },

  // 画面レベルスペーシング
  screen: {
    paddingHorizontal: 16,
    paddingTop: 8, // タイトな上部スペーシング
    paddingBottom: 16,
    sectionGap: 20, // セクション間も縮小
    headerHeight: 56,
  },
};

type FontSizes = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  xxxxl: number;
  // Aliases used throughout the app
  h1?: number;
  h2?: number;
  h3?: number;
  h4?: number;
  body?: number;
  caption?: number;
  [key: string]: number | undefined;
};

type FontWeights = {
  normal: '400';
  medium: '500';
  semibold: '600';
  bold: '700';
};

type LineHeights = {
  tight: number;
  normal: number;
  relaxed: number;
};

export type Typography = {
  fontSizes: FontSizes;
  fontWeights: FontWeights;
  lineHeights: LineHeights;
  sizes: FontSizes;
  weights: { normal: string; medium: string; semibold: string; bold: string };
};

// 単一ソースのフォントサイズ定義
const baseFontSizes: FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  xxxxl: 32,
  // Aliases（アプリ内で参照されているため残す）
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  caption: 12,
};

export const typography: Typography = {
  fontSizes: baseFontSizes,
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  // sizes は fontSizes のエイリアス（同一参照）
  sizes: baseFontSizes,
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
};
