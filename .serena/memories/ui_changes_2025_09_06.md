# 2025-09-06 UI/ナビゲーション変更メモ

## 検索(探す)

- プロフィール画像: 円形に統一。画像右下にオンライン緑丸を重ねて表示 (bottom:2, right:2, size:12, border 2px white)
- TutorCard: 画像読み込み失敗時のフォールバック（onErrorで人アイコン）
- モック画像: placeholderからUnsplash(顔のクロップ)へ差し替え（安定URL）

## ホーム

- ヘッダー右にコイン残高ボタンを追加（タップでコイン管理）
- 大きいコイン残高カードを削除（ヘッダー残高へ集約）
- 授業の予定: コンパクト化 + 余白再調整 / 同一行に日時(左) + 詳細ボタン(右) + 先生名を下に配置
- 授業の予定: 影スタイルを他カードと統一（offset:0,2 / opacity:0.08 / radius:6 / elevation:3）
- アクションバー/授業の予定/おすすめの先輩の横幅をTutorCardと統一（marginHorizontal: spacing.md）
- おすすめの先輩: Homeも共通TutorCardを使用（探すとUI統一）

## ナビゲーション

- MyPageStack内のルートスクリーン名を `MyPage` -> `MyPageMain` に変更（タブ `MyPage` との重複警告解消）

## パフォーマンス/ログ

- モックAPIログ: getApiClient() のログを1回のみ出力（フラグで抑制）
- SearchScreen: データ取得をuseFocusEffectへ移行（不要なAPI呼び出し抑制）
- UserContext.refreshCoins: 同時実行/5秒以内の連続呼び出しを抑止
