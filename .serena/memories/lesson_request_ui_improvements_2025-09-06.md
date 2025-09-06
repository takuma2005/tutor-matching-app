変更サマリ (2025-09-06)

1. 無限レンダー修正

- UserContext の公開関数を useCallback 化し、Provider value を useMemo 化
- NotificationScreen でモックサービスのインスタンスを useMemo 化、FlatList の in-place sort を回避

2. 授業申請フロー

- ChatDetail の『新しい授業を申請』→ 確認なしで直接入力画面へ遷移
- ChatStackNavigator に LessonRequest 画面を登録

3. 授業申請 UI/UX 改善

- react-native-modal-datetime-picker を導入し日時ピッカーをモーダルに統合
- react-hook-form + zod でフォームバリデーションを一元化（即時検証）
- date-fns 導入。終了予定時刻の計算＆表示を追加
- クイック選択（今日/明日、19/20/21時）と時間ステッパー（±30分, 30-180分）を追加
- react-native-calendars を導入。日本語ロケール、曜日付き表示、カレンダーから日付選択を追加
- 日付/時間表示を日本語化（M月d日(EEE), 24時間表記）

4. UI 調整

- コイン管理画面: SafeArea 適用、パッケージカード間の余白調整
- タブバー上部に hairline の境界線を追加
- マイページ: ヘッダー/プロフィール/セクションの境界線＆区切り線を追加、見切れ改善
- マイページから『お気に入り』『申請状況』に遷移可能に

影響ファイル（抜粋）

- src/contexts/UserContext.tsx
- src/screens/NotificationScreen.tsx
- src/navigation/ChatStackNavigator.tsx, src/screens/ChatDetailScreen.tsx
- src/screens/LessonRequestScreen.tsx（大幅改修）
- src/screens/CoinManagementScreen.tsx
- src/navigation/TabNavigator.tsx
- src/screens/MyPageScreen.tsx, src/navigation/MyPageStackNavigator.tsx

追加パッケージ

- react-native-modal-datetime-picker, @react-native-community/datetimepicker
- react-hook-form, zod, @hookform/resolvers
- date-fns
- react-native-calendars
