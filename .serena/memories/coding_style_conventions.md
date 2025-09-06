# コードスタイルと規約

## TypeScript規約

### 型定義

- **Strict mode有効**: `tsconfig.json`でstrict: trueを設定済み
- **Interface vs Type**:
  - 拡張可能性が必要な場合: `interface`を使用
  - Union型やプリミティブ型: `type`を使用
- **Nullableな値**: optional chaining (`?.`) とnullish coalescing (`??`) を活用

### 命名規約

- **コンポーネント**: PascalCase (例: `TutorCard`, `StudentProfile`)
- **ファイル名**: コンポーネントはPascalCase、その他はcamelCase
- **変数・関数**: camelCase (例: `handleSubmit`, `userProfile`)
- **定数**: UPPER_SNAKE_CASE (例: `API_BASE_URL`)
- **型名**: PascalCase (例: `User`, `TutoringSession`)

## React Native規約

### コンポーネント設計

- **関数型コンポーネント**を優先使用
- **Hooks**: useState, useEffect, useCallback, useMemo を適切に使用
- **Props**: TypeScriptインターフェースで型定義
- **Style**: StyleSheet.create() を使用、インラインスタイルは避ける

### ファイル構造

```
components/
├── common/          # 共通コンポーネント
├── forms/           # フォーム関連
└── navigation/      # ナビゲーション関連

screens/
├── auth/            # 認証画面
├── tutor/           # 家庭教師関連画面
└── student/         # 学生関連画面
```

## 既存の型定義構造

現在定義済みの主要インターフェース:

- `User`: 基本ユーザー情報
- `Tutor extends User`: 家庭教師固有のプロパティ
- `Student extends User`: 学生固有のプロパティ
- `Subject`: 科目情報
- `TimeSlot`: 時間枠定義
- `TutoringSession`: 指導セッション
- `Review`: レビューシステム
- `MatchRequest`: マッチング要求

## コメント規約

- **JSDoc形式**で関数・インターフェースにコメント
- **複雑なビジネスロジック**には説明コメント追加
- **型定義**には用途と制約を記述

```typescript
/**
 * 家庭教師の情報を表すインターフェース
 * @extends User 基本ユーザー情報を継承
 */
export interface Tutor extends User {
  /** 時給（円） */
  hourlyRate: number;
  /** 評価（1-5） */
  rating: number;
}
```

## エラーハンドリング規約

- **Try-catch**で非同期処理をラップ
- **型ガード**でruntime型チェック実装
- **Error Boundary**でReactエラーをキャッチ

## インポート規約

```typescript
// 1. React関連
import React from 'react';
import { useState, useEffect } from 'react';

// 2. React Native
import { View, Text, StyleSheet } from 'react-native';

// 3. 外部ライブラリ
import { NavigationContainer } from '@react-navigation/native';

// 4. 内部モジュール
import { User, Tutor } from '../types';
import { apiClient } from '../services/api';
```
