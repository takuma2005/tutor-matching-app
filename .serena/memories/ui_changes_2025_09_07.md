# 2025-09-07 UI変更サマリ

## 授業申請（LessonRequestScreen）

- 二重スクロール解消、固定CTAを画面下に固定＋中央寄せ（セーフエリア対応）
- ScrollViewのpaddingBottomを増やし、料金セクションの見切れを解消
- ヘッダーの左右/上のセーフエリアを白で連結（青い背景が見えないよう統一）
- 申請ボタン位置・余白の微調整

## 探す（SearchScreen）

- 検索バー/フィルタボタンを白カード化（border + shadow）
- 上下余白調整、左右幅をカードと統一（spacing.md）

## 通知（NotificationScreen）

- レイアウト再構成：左上=種類アイコン、中央=人物アイコン（実画像）、下=本文、右上=時刻
- 右側の矢印を削除
- 未読の背景色を濃く（primary+'15'）。左側青線は削除
- アイテム背景=白、下線=gray200 で境目を明確化
- "要対応"バッジを丸ピル化し中央揃え。テキストの下に配置
- ヘッダー左右余白を統一、"すべて既読"位置調整
- 人物アイコン：randomuser のモック画像を使用（名前に応じた割当）

## 影響ファイル

- src/screens/LessonRequestScreen.tsx
- src/screens/SearchScreen.tsx
- src/screens/NotificationScreen.tsx
- docs/requirements_diff.md
