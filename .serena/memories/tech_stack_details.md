# 技術スタック詳細

## 現在の実装状況

### 基盤技術

- **React Native**: 0.79.6 (最新版)
- **Expo SDK**: ~53.0.22
- **React**: 19.0.0
- **TypeScript**: ~5.8.3
- **新アーキテクチャ**: 有効化済み (newArchEnabled: true)

### 開発環境

- **Platform**: Windows
- **Build tool**: Metro bundler
- **Package manager**: npm
- **TypeScript**: strict mode有効

## 予定している技術統合

### 1. ナビゲーション

```bash
# React Navigation v6
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# または Expo Router
npm install expo-router
```

### 2. 状態管理

```bash
# Context API (built-in) + useReducer
# または Redux Toolkit
npm install @reduxjs/toolkit react-redux
```

### 3. UI ライブラリ候補

```bash
# React Native Elements
npm install react-native-elements react-native-safe-area-context

# NativeBase
npm install native-base react-native-svg react-native-safe-area-context

# UI Kitten
npm install @ui-kitten/components @eva-design/eva react-native-svg
```

### 4. 認証システム

```bash
# Firebase Auth
npm install @react-native-firebase/app @react-native-firebase/auth

# または Supabase
npm install @supabase/supabase-js
```

### 5. データベース・API

```bash
# Firebase
npm install @react-native-firebase/firestore @react-native-firebase/database

# HTTP Client
npm install axios
npm install react-query  # サーバー状態管理
```

### 6. リアルタイム通信

```bash
# Socket.io client
npm install socket.io-client

# または Firebase Realtime Database (上記Firebase設定に含む)
```

### 7. 決済システム

```bash
# Stripe
npm install @stripe/stripe-react-native

# PayPal
npm install react-native-paypal
```

### 8. フォーム管理

```bash
# React Hook Form
npm install react-hook-form

# バリデーション
npm install yup @hookform/resolvers
# または
npm install zod
```

### 9. 日付・時間管理

```bash
npm install date-fns
# または
npm install dayjs
```

### 10. 画像・メディア

```bash
# Expo Image Picker
npx expo install expo-image-picker

# Expo AV (音声・動画)
npx expo install expo-av
```

## 開発ツール（推奨導入）

### 1. コード品質

```bash
# ESLint + Prettier
npm install --save-dev eslint prettier @expo/eslint-config
npm install --save-dev eslint-plugin-react eslint-plugin-react-hooks
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### 2. テスト環境

```bash
# Jest + React Native Testing Library
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# E2E Testing
npm install --save-dev detox
```

### 3. Git Hooks

```bash
# Husky + lint-staged
npm install --save-dev husky lint-staged
```

## 環境設定ファイル

### .env (作成予定)

```
EXPO_PUBLIC_API_URL=https://api.tutorapp.com
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## ビルド・デプロイ設定

### Expo Application Services (EAS)

```bash
# EAS CLI インストール
npm install -g @expo/eas-cli

# EAS設定初期化
eas build:configure
eas submit:configure
```

### プロダクションビルド設定

```bash
# Android APK
eas build --platform android --profile production

# iOS IPA
eas build --platform ios --profile production

# 両プラットフォーム
eas build --platform all --profile production
```
