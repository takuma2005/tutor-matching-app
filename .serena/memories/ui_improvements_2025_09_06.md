# UI改善 (2025-09-06)

## 対応した問題

### 1. ホーム画面のセンパイカードの境界線が薄い問題

**修正内容:**

- `src/screens/HomeScreen.tsx` の `tutorCard` スタイルに境界線を追加
- `borderWidth: 1, borderColor: colors.gray200` を追加
- シャドウを強化: `shadowOpacity: 0.08, shadowRadius: 4, elevation: 2`

### 2. 探す画面のセンパイカードの科目表示が見にくい問題

**修正内容:**

- `src/components/tutor/TutorCard.tsx` のカード境界線とシャドウを強化
- 科目タグのサイズを `sm` から `md` に変更
- 科目タグ間の適切な間隔設定 (`marginRight: spacing.xs, marginBottom: spacing.xs / 2`)
- `variant="solid"` を明示的に指定して視認性向上

### 3. Tagコンポーネントの視認性向上

**修正内容:**

- `src/components/common/Tag.tsx` の `outline` variant背景色を半透明に変更
- `backgroundColor: colors.primary + '10'` で薄いプライマリカラー背景を追加

## 実装詳細

### カード境界線の統一

```typescript
// 統一したカードスタイル
borderWidth: 1,
borderColor: colors.gray200,
shadowColor: colors.black,
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 4,
elevation: 2,
```

### 科目タグの改善

```typescript
<Tag key={index} variant="solid" size="md" style={styles.subjectTag}>
  {subject}
</Tag>
```

## 影響範囲

- ホーム画面: おすすめセンパイカードの視認性向上
- 探す画面: センパイカード全般の境界線・科目タグの見やすさ向上
- 全般: Tag コンポーネントの視認性向上

## テスト状況

- TypeScript コンパイル: ✅ エラーなし
- 実機確認: 要確認

## 次のステップ

- Expo Goアプリでの実機確認
- ユーザーフィードバックに基づくさらなる調整
