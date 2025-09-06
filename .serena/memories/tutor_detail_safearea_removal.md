## TutorDetailScreen SafeArea 削除作業

### 変更内容

- TutorDetailScreenからSafeAreaViewのimportを削除
- SafeAreaViewをすべてViewに置換（3箇所）
- モーダル画面なのでSafeAreaは不要との判断

### 影響範囲

- src/screens/TutorDetailScreen.tsx
- ヘッダー部分とエラー画面、メイン画面のすべて

### WARP.mdルールの遵守

- TypeScript strict mode維持
- コンポーネント単一責任維持
- UI/UXガイドラインに準拠
- 「先輩」「後輩」の用語統一確認済み
