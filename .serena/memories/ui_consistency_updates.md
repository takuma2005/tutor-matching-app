# UI一貫性向上の変更点 (2025-01-09)

## 実装した変更内容

### 1. コイン管理画面のレイアウト最適化

- **残高カードの縦パディング削減**: `spacing.lg` → `spacing.md`でコンパクト化
- **円相当表示の削除**: 残高カードとコイン購入パッケージから「何円相当」テキストを削除
- **ヘッダー上余白調整**: `balanceSection`の`paddingTop`を`spacing.xs`に削減
- **取引履歴セクション**: 上余白を0に設定、下余白を`spacing.md`に調整

### 2. BottomSheetモーダルの背景修正

- **セーフエリア対応**: `useSafeAreaInsets`を使用してステータスバー領域まで背景オーバーレイを拡張
- **zIndex調整**: backdrop(zIndex:1000), sheet(zIndex:1100)で適切な重ね順を確保

### 3. ヘッダーUI統一 (CoinManagement, MatchRequests, Lesson)

- **共通構造**: 左(戻るボタン) | 中央(タイトル) | 右(アクションボタン)
- **スタイル統一**:
  - `paddingVertical: spacing.md`
  - ボタンサイズ: 40×40px
  - タイトル: h3サイズ(20px), フォントウェイト600, 中央揃え
  - 背景: 白、下ボーダー付き

### 4. 申請状況画面(MatchRequestsScreen)の改修

- **StandardScreen → ScreenContainer**: より細かい制御のため変更
- **ヘッダー3分割構造**: バックボタン + タイトル + リフレッシュボタン
- **タブの分離**: ヘッダーからタブを独立したセクションに移動

### 5. 授業画面(LessonScreen)の改修

- **StandardScreen → ScreenContainer**: 他画面との一貫性確保
- **ヘッダー構造統一**: 3分割レイアウト適用
- **タブデザイン**: グレー背景 + プライマリカラーアクティブ状態

### 6. タブUI統一

- **デザイン**: `colors.gray50`背景、角丸コンテナ
- **アクティブ状態**: `colors.primary`背景、白文字
- **非アクティブ状態**: 透明背景、グレー文字
- **適用画面**: MatchRequestsScreen, LessonScreen

## 画面遷移変更

- **CoinManagement**: モーダル表示 → 通常の右からスライド遷移に変更

## 技術的改善

- **コンポーネント統一**: ScreenContainerの使用で一貫したレイアウト
- **スタイル標準化**: spacing, colors, typography の統一使用
- **レスポンシブ対応**: SafeAreaInsetsを考慮した背景オーバーレイ

## 影響範囲

- `src/screens/CoinManagementScreen.tsx`
- `src/screens/MatchRequestsScreen.tsx`
- `src/screens/LessonScreen.tsx`
- `src/components/common/BottomSheet.tsx`
- `src/navigation/HomeStackNavigator.tsx`

## 今後の展開

他の画面(通知、お気に入り等)にも同様のヘッダー・タブUI統一を適用予定
