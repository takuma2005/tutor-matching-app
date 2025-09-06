# プロジェクト固有のガイドライン

## アーキテクチャパターン

### 1. コンポーネント設計原則

- **単一責任原則**: 各コンポーネントは一つの明確な責任を持つ
- **Props最小化**: 必要最小限のpropsのみを受け取る
- **Presentational vs Container**: UI表示とロジックを分離

### 2. 状態管理戦略

- **ローカル状態**: useState for コンポーネント固有の状態
- **共有状態**: Context API for アプリ全体の状態（認証、テーマ等）
- **サーバー状態**: 将来的にReact QueryまたはSWRを検討

### 3. ナビゲーション構造

```
Root Navigator
├── Auth Stack (未認証)
│   ├── Login
│   ├── Register
│   └── ForgotPassword
├── Main Tab Navigator (認証済み)
│   ├── Home Stack
│   ├── Search Stack
│   ├── Bookings Stack
│   ├── Messages Stack
│   └── Profile Stack
└── Modal Stack
    ├── TutorProfile
    ├── BookingDetails
    └── ChatRoom
```

## データモデル設計パターン

### 1. 型安全性の確保

- **Runtime validation**: API レスポンスの型検証
- **Type guards**: unknown型からの安全な型変換
- **Discriminated unions**: 状態に応じた型の切り替え

```typescript
// 例: セッション状態による型の分岐
type SessionStatus =
  | { status: 'scheduled'; scheduledAt: Date }
  | { status: 'in-progress'; startedAt: Date }
  | { status: 'completed'; completedAt: Date; review?: Review }
  | { status: 'cancelled'; cancelReason: string };
```

### 2. API設計パターン

- **RESTful API**: 標準的なHTTPメソッド使用
- **Error handling**: 統一されたエラーレスポンス形式
- **Pagination**: 大きなデータセットの効率的な取得

## UI/UXガイドライン

### 1. デザインシステム

- **Color palette**: プライマリ、セカンダリ、アクセント色の定義
- **Typography**: フォントサイズとウェイトの体系化
- **Spacing**: 一貫したマージン・パディング使用
- **Component library**: 再利用可能UIコンポーネントの構築

### 2. アクセシビリティ

- **Screen reader support**: accessibilityLabel, accessibilityHint
- **Touch target size**: 最小44x44ptのタッチ領域
- **Color contrast**: WCAG AA準拠のコントラスト比
- **Keyboard navigation**: フォーカス管理の適切な実装

## パフォーマンス最適化パターン

### 1. React Native特有の最適化

- **FlatList使用**: 大きなリストでの仮想化
- **Image optimization**: 適切なresizeModeとキャッシュ
- **Bundle splitting**: 動的インポートによるコード分割

### 2. メモ化戦略

```typescript
// コンポーネントメモ化
const TutorCard = React.memo(({ tutor, onPress }) => { ... });

// 重い計算のメモ化
const filteredTutors = useMemo(() =>
  tutors.filter(tutor => matchesSearchCriteria(tutor, searchParams)),
  [tutors, searchParams]
);
```

## セキュリティ考慮事項

### 1. データ保護

- **Sensitive data**: AsyncStorage使用時の暗号化
- **API keys**: 環境変数での管理、クライアントサイドでの秘匿
- **User input**: 全入力値のサニタイゼーション

### 2. 認証・認可

- **JWT token**: 安全な保存と自動更新
- **Deep linking**: 認証状態の確認
- **Biometric auth**: 指紋・Face ID統合（将来）

## テスト戦略

### 1. テストピラミッド

- **Unit tests**: ユーティリティ関数、カスタムフック
- **Integration tests**: APIクライアント、状態管理
- **E2E tests**: 主要ユーザーフロー（ログイン、予約、決済）

### 2. テスト環境

- **Mock data**: 一貫したテストデータセット
- **API mocking**: MSW for API モッキング
- **Device testing**: iOS/Android実機での定期テスト
