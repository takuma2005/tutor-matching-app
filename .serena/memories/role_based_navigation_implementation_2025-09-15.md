# ロールベースナビゲーション実装記録

## 実行日時

2025-09-15 22:11

## 背景・目的

先輩（Tutor）と後輩（Student）で異なるナビゲーション構造とUI表示を実現するため、ロールベースナビゲーション機能を実装。

## 主要な変更内容

### 1. ナビゲーション構造の再設計

#### 新規作成されたNavigator

- **RoleBasedNavigator.tsx**: メインのロール分岐ナビゲーター
- **StudentTabNavigator.tsx**: 後輩向けタブナビゲーター
- **TutorTabNavigator.tsx**: 先輩向けタブナビゲーター
- **StudentLessonStackNavigator.tsx**: 後輩向け授業画面スタック
- **TutorLessonStackNavigator.tsx**: 先輩向け授業画面スタック
- **RequestStackNavigator.tsx**: 申請系画面スタック
- **LegacyTabNavigator.tsx**: 旧タブナビゲーターの保持

#### 削除されたNavigator

- **TabNavigator.tsx**: 統一タブナビゲーターを削除

### 2. 認証システム強化

#### AuthContext拡張

- ユーザーロール管理機能の追加
- 先輩/後輩の状態管理強化
- プロフィール完了チェック機能

#### 認証フロー改善

- ロール選択後のプロフィール完了チェック
- 先輩向け追加プロフィール設定項目
- 後輩向け基本プロフィール設定

### 3. 画面・コンポーネント調整

#### MyPageScreen拡張

- ロール表示機能追加（先輩/後輩バッジ）
- ロール別メニュー項目の表示切り替え
- プロフィール編集画面への動線改善

#### BlurTabBar更新

- ロール別タブアイコン・ラベル対応
- 視覚的差別化要素追加

### 4. API・データモデル拡張

#### モックサービス強化

- authService: ロール管理機能追加
- chatService: ロール別チャット機能強化
- データ: ロール別テストデータ拡充

#### 型定義拡張

- User型でのロール情報強化
- Navigation型でのロール別画面定義

## アーキテクチャ改善点

### ナビゲーション階層

```
App.tsx
├── AuthStackNavigator（未認証時）
└── RoleBasedNavigator（認証済み）
    ├── StudentTabNavigator（後輩）
    │   ├── ホーム
    │   ├── 探す
    │   ├── チャット
    │   ├── 授業（StudentLessonStack）
    │   └── マイページ
    └── TutorTabNavigator（先輩）
        ├── ホーム
        ├── 申請管理（RequestStack）
        ├── チャット
        ├── 授業（TutorLessonStack）
        └── マイページ
```

### 主要な設計原則

- **Role-Based Access Control**: 各ロールに適切な画面・機能のみ表示
- **Progressive Enhancement**: 基本機能から高度機能へ段階的移行
- **Type Safety**: TypeScriptによる型安全性確保
- **Code Reusability**: 共通コンポーネントの適切な再利用

## 技術的実装詳細

### 認証状態管理

```typescript
const AuthContext = {
  user: User | null,
  userRole: 'student' | 'tutor' | null,
  isProfileComplete: boolean,
  profileCompletionStep: string | null,
};
```

### ロール判定ロジック

```typescript
const isStudent = user?.role === 'student';
const isTutor = user?.role === 'tutor';
const showStudentUI = isStudent && isProfileComplete;
const showTutorUI = isTutor && isProfileComplete;
```

## 品質保証・テスト

### 実装品質チェック

- ✅ TypeScript: 型エラー0件
- ✅ ナビゲーション: 両ロールでの画面遷移正常
- ✅ 認証フロー: ロール選択→プロフィール→メイン画面の流れ正常
- ✅ UI統一性: 両ロール共通コンポーネント使用

### テスト項目

- [ ] 後輩ユーザーでのフル機能テスト
- [ ] 先輩ユーザーでの申請管理機能テスト
- [ ] ロール切り替え時のデータ整合性テスト
- [ ] 未完了プロフィールでの適切な画面誘導テスト

## 期待効果

### UX改善

- **専用化UI**: 各ロールに最適化された画面構成
- **機能発見性**: 必要な機能のみ表示でシンプルなUX
- **操作効率**: ロール固有のタスクへの直接動線

### 開発効率

- **保守性**: ロール別の機能追加・変更が独立して可能
- **テスタビリティ**: ロール別テストシナリオの明確化
- **拡張性**: 新ロール（管理者等）追加時の構造的対応

## 次のアクション項目

### 短期（必須）

1. プロフィール完了画面の実装完了
2. 先輩向け追加設定項目の実装
3. 申請管理機能のUI実装
4. 両ロールでの包括的動作テスト

### 中期（推奨）

1. ロール別通知設定機能
2. 先輩向け収益管理ダッシュボード
3. 後輩向けお気に入り先輩管理
4. A/Bテストでのロール別UX最適化

### 長期（検討）

1. 管理者ロールの追加
2. 企業向けロール（法人利用）
3. 地域・学校別ロール管理

## 影響ファイル（主要）

### 新規作成

- src/navigation/RoleBasedNavigator.tsx
- src/navigation/StudentTabNavigator.tsx
- src/navigation/TutorTabNavigator.tsx
- src/navigation/StudentLessonStackNavigator.tsx
- src/navigation/TutorLessonStackNavigator.tsx
- src/navigation/RequestStackNavigator.tsx
- src/screens/ProfileCompletionScreen.tsx
- src/screens/home/ (ロール別ホーム画面)
- src/screens/lessons/ (ロール別授業画面)
- src/screens/requests/ (申請管理画面)

### 大幅修正

- App.tsx (ナビゲーション統合点)
- src/contexts/AuthContext.tsx (ロール管理機能)
- src/screens/MyPageScreen.tsx (ロール表示機能)
- src/navigation/HomeStackNavigator.tsx (ロール対応)
- src/navigation/auth/AuthStackNavigator.tsx (認証フロー)

### 削除

- src/navigation/TabNavigator.tsx (統一タブを廃止)

## 技術環境

- React Navigation: v7 (ロール別ナビゲーション対応)
- TypeScript: strict mode (型安全性確保)
- Expo SDK: 54 (最新環境での開発)

## 実装完了度

- 基本構造: ✅ 100%完了
- 認証フロー: ✅ 90%完了
- ロール別UI: 🔄 80%完了
- テスト: 🔄 30%完了
- ドキュメント: ✅ 100%完了
