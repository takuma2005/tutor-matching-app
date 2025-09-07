# 要件変更履歴

このファイルは `requirements.md` からの仕様変更を追跡します。

## 変更履歴

### 2025-09-06（授業申請UX/ナビゲーション/境界線・視認性向上）

- 無限レンダー修正
  - UserContext: 公開関数を useCallback 化、Provider value を useMemo 化して依存のチャーンを抑制
  - NotificationScreen: モック通知サービスのインスタンスを useMemo 化、FlatList の in-place sort を回避
- 授業申請フロー/画面
  - ChatDetailScreen: 「新しい授業を申請」押下で確認ダイアログなしに直接入力画面へ遷移
  - ChatStackNavigator: LessonRequest 画面を追加登録
  - LessonRequestScreen: 大幅改修
    - react-native-modal-datetime-picker による日時モーダル統合（日本語、24h）
    - react-hook-form + zod による一元バリデーション（即時検証）
    - date-fns による終了予定時刻のリアルタイム算出・表示
    - クイック選択（今日/明日、19/20/21時）と時間ステッパー（±30分、30〜180分）
    - react-native-calendars 導入。日本語ロケール設定、カレンダーから日付選択可、曜日表示
    - 日付表示を日本語形式（M月d日(EEE)）に統一
- UI/視認性
  - TabNavigator: タブバー上部に hairline の境界線を追加
  - CoinManagementScreen: SafeArea（top）適用、パッケージの縦間隔を margin で安定化
  - MyPageScreen: ヘッダー/プロフィール/セクションの境界線・区切り線を追加し境目を明確化
  - MyPage から「お気に入り」「申請状況」に遷移できるメニューを追加

影響ファイル（主な）

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

### 2025-09-06（ホームUI/コイン設計/テスト安定化）

- ホームUI
  - クイックアクションを一旦非表示
  - おすすめの先輩の下に「新着の先輩」セクションを追加（created_at/updated_at の新しい順、上位3件）
  - セクション見出しとオブジェクト間の余白を統一（marginBottom: sm + xs、セクションpadding: sm）
  - 授業の予定の上下余白を調整し、各セクション間隔と統一
- お気に入り
  - FavoriteScreen: student.id → user.id → 'local' のフォールバックで再追加不可問題を解消
  - isFavorite と onFavoritePress による表示・トグルを統一（TutorCard）
- コイン設計（モック→本番差し替え容易化）
  - ドメイン層を導入: CoinGateway（抽象化）/ CoinManager（アプリケーションサービス）/ coinEvents（PubSub）
    - CoinGateway: getBalance / purchase / applyDelta / getHistory を定義
    - MockCoinGateway 実装: 既存 mockCoinService を内部利用
    - CoinManager: purchase/applyDelta/syncBalance 後に coinEvents で残高通知
    - UserContext: coinEvents を購読し user.coins を即時同期
  - 画面適用
    - CoinManagementScreen: CoinManager.purchase を利用、購入後に履歴・残高を再取得
    - LessonRequestScreen: 授業申請成功後に CoinManager.syncBalance（真値同期）
    - TutorDetailScreen: CoinManager.applyDelta(..., 'matching') で即時反映（モックでは取引記録）
- 認証（モック利便性）
  - モック環境で起動時にデフォルトユーザーへ自動ログイン → 「プロフィールが見つかりません」軽減
- テスト
  - UI変更に伴い HomeScreen のスナップショット/テキスト検証を更新

影響ファイル（主な）

- src/domain/coin/{types.ts, mockGateway.ts, coinEvents.ts, coinManager.ts, index.ts}（新規）
- src/screens/{HomeScreen.tsx, CoinManagementScreen.tsx, LessonRequestScreen.tsx, TutorDetailScreen.tsx}
- src/components/home/TutorsSection.tsx
- src/hooks/useHomeData.ts
- src/contexts/{UserContext.tsx, AuthContext.tsx}
- テスト: src/screens/**tests**/HomeScreen\*.tsx

### 2025-09-06（UI/ナビゲーション/ログ抑制）

#### 検索（探す）

- プロフィール画像を円形に統一し、右下にオンライン緑丸を重ねて表示（bottom:2 / right:2 / size:12 / border 2px white）
- 画像読み込み失敗時はプレースホルダーへフォールバック
- モック画像URLを Unsplash の顔クロップに差し替え（表示安定化）

#### ホーム

- ヘッダー右にコイン残高ボタンを追加（タップでコイン管理へ）
- 大きいコイン残高カードを削除（残高表示の集約）
- 授業の予定：3行構成に変更（件名 / 日時+詳細ボタン / 先生名）＋ 余白の見直し（padding: sm / marginBottom: sm）
- 授業の予定：境界表現はボーダーではなくシャドーに統一（offset: 0,2 / opacity: 0.08 / radius: 6 / elevation: 3）
- アクションバー／授業の予定／おすすめの先輩の横幅を TutorCard と統一（marginHorizontal: spacing.md）
- おすすめの先輩：Home も共通 TutorCard を使用（探すとUI統一）

#### ナビゲーション

- MyPageStack 内のルート名を `MyPage` → `MyPageMain` に変更（タブ名重複警告の解消）

#### パフォーマンス/ログ

- getApiClient のモックログを初回1回のみに抑制
- SearchScreen のデータ取得を useFocusEffect に移行（不要なAPI呼び出し抑制）
- UserContext.refreshCoins：同時実行/5秒以内の連続呼び出しを抑止

#### 影響ファイル（主な）

- src/components/tutor/TutorCard.tsx
- src/screens/SearchScreen.tsx
- src/screens/HomeScreen.tsx
- src/navigation/MyPageStackNavigator.tsx
- src/services/api/mock/data.ts
- src/services/api/mock/index.ts
- src/contexts/UserContext.tsx

---

## 変更履歴

### 2025-01-06（お気に入り機能）

- グローバルFavoritesContext導入、FavoriteScreen追加
- TutorCard / Home / Search / TutorDetail にお気に入り統合（トグルで反映）
- UI統一:
  - 評価は5つ星表示、レビュー数を星の右に括弧付きで表示
  - オンライン表示を緑丸インジケータに変更
  - 料金表示はプライマリカラーで統一
- データ整備:
  - モックのID形式を `tutor-X` → `X` に統一
- 環境:
  - `npm start` + EXPO_PUBLIC_SKIP_AUTH=true による認証スキップ

### 2025-09-05 (Sprint 1実装時)

#### 用語統一の確認

- ✅ 確認：「生徒」→「後輩」、「家庭教師」→「先輩」で実装
- ✅ アプリ名：「センパイ（Senpai）」で統一
- ✅ コンセプト：「先輩に教えてもらう青春体験」

#### UI実装での調整

- 電話番号バリデーション：長さチェックを11文字から13文字（ハイフン込み）に修正
- 認証フロー：Role Selection → Phone Verification → Profile Setup → Main App の流れで実装

#### UI修正

- ✅ ボトムナビゲーション：requirements.mdに合わせて修正
  - 修正後：ホーム / 探す / チャット / 授業 / マイページ
  - 対応画面：HomeScreen / SearchScreen / ChatScreen / LessonScreen / MyPageScreen
- ✅ 電話番号バリデーション修正（11文字→13文字：ハイフン込み）
- ✅ セーフエリア対応：全画面にSafeAreaView適用、上下の見切れ解決
- ✅ スペーシング最適化：セーフエリアをコンパクトに、黒い部分の解決

#### 次回確認事項

- [ ] プロフィール項目の詳細仕様確認
- [ ] 科目タグの選択UI仕様

## 実装方針

- Mock-First開発：UI/UXを先行実装し、後からSupabase/Stripe統合
- Port & Adapter：API層を抽象化してモック→本番切り替えを容易にする

---

### 2025-09-05（差分確認: 実装 vs requirements.md）

#### 技術スタック

- React Navigation バージョン
  - 要件（11.1）: v6
  - 実装: v7（package.json: @react-navigation/\* v7 系）
  - 備考: ガイド・サンプルコードはv7 APIで統一する必要あり
- TypeScript Strict Mode
  - 要件: strict 必須
  - 実装: tsconfig.json にて strict: true（OK）

#### 認証 / SMS（3.1）

- 要件: SMS送信・検証による登録/ログイン
- 実装: モック実装（PhoneVerificationScreen: 固定コード「123456」、実SMS送信なし）

#### マッチング / 授業 / エスクロー（2.3, 3.4, 3.6）

- 要件: 300コイン徴収 → 申請時仮押さえ → 先輩承認でエスクロー → 完了で送金
- 実装: UI/ダイアログのみ（TutorDetailScreen: MATCHING_COST=300, LessonRequestScreen: 「仮押さえ」文言）
  - 残高更新・状態遷移・API連携は未実装（モック）

#### コイン体系（2.1）

- 換算レート
  - 要件: 1コイン = 1.25円
  - 実装: UI表示が「約1.2円相当」（CoinManagementScreen）→ 要修正
- 購入プラン
  - 要件: 400/1250/4300/8800 コイン（¥490/¥1,480/¥4,900/¥9,800）
  - 実装: 100/500/1000/2000/5000 コイン 等（独自パッケージ）→ 要件と不一致
- 取引種別
  - 型定義: purchase | spend | refund（services/api/types.ts）
  - 表示ロジック: matching/lesson/bonus の分岐あり（CoinManagementScreen）→ 表示種別と型の整合を再検討

#### プロフィール / 料金（2.2）

- 最低時給 1,200 コイン/時のバリデーション
  - 要件: 1,200 未満は保存不可
  - 実装: ProfileSetupScreen に料金入力項目・バリデーションなし（未実装）

#### チャット / 安全 / 通知（3.5, 3.9, 10）

- 既読/未読、通報/ブロック: 未実装想定（UI/処理未確認）
- プッシュ通知: 未実装

#### バックエンド / 決済（11.2）

- Supabase・Stripe Connect: 現状モックAPIのみ。統合は未実装

#### 品質ツール / テスト（11.7, 11.3）

- ESLint/Prettier: 要件は「導入予定」→ 現状 未導入
- テスト: 要件は「導入予定」→ 現状 Jest + Testing Library 導入済（先行実装）

#### 用語 / ナビゲーション（2, 4）

- 用語統一（後輩/先輩）: 実装どおり（OK）
- タブ構成（ホーム/探す/チャット/授業/マイページ）: 実装どおり（OK）

#### その他（5, 11.9）

- 保護者簡易同意: 未実装
- 監視/ログ/CI: 未実装

---

### 2025-09-05（UI差分: シート仕様の統一と細部調整）

- ボトムシート仕様（requirements.md未記載の実装差分）
  - 固定高さ: 560 に統一（MyPage プロフィール編集 / CoinManagement / TutorDetail）
  - 実装形式の統一: Backdrop + Panジェスチャー + Reanimated（SlideIn/Out）
  - TutorDetail: 既存の TutorDetailSheet を廃止し、TutorDetailScreen 内でインライン実装に変更
    - ルーティング: transparentModal を使わず通常画面遷移、ヘッダー右のボタンで開閉
    - 影響: 未使用ファイルを削除（TutorDetailSheet.tsx, components/common/BottomSheet.tsx）

- MyPage プロフィール編集（requirements.md未記載のUI挙動）
  - シート背景を白に統一、上方向のオーバードラッグを抑止（灰色の下地が見えない）
  - シート内 ScrollView に縦スクロールバーを表示して可視性を向上

- TutorDetail 画面（要件未記載のUI調整）
  - SafeArea（上部）適用 + 追加の上部余白で見切れを解消
  - マッチングボタンの角丸を4辺とも同一（borderRadius.lg）に統一

- コードクリーンアップ（仕様外の実装差分の後処理）
  - 未使用ファイル削除: src/screens/TutorDetailSheet.tsx, src/components/common/BottomSheet.tsx
  - 未使用インポート削除: CoinManagementScreen の FlatList など

### 2025-09-06（チャット/授業履歴/タグ・アバター/仕様追記）

- オンライン表示ポリシー
  - チャット（一覧/詳細）ではオンライン表示（ドット/タグ）を行わない
  - TutorCard / TutorDetail では「オンライン授業可」をタグ表示し、科目タグ列の末尾（右隣）に配置
  - デザイン: 背景=secondary+15, 文字=secondary, ピル形

- アバター（人物画像）
  - ChatScreen / ChatDetail / LessonScreen / LessonHistoryScreen / MyPageScreen で人物画像を使用
  - Tutor: avatar_url を使用（なければ人アイコン）
  - MyPage: user.avatar を優先、無ければ user.avatar_url も許容
  - モックを拡充（student-2, tutor-7, tutor-8追加。既存のプレースホルダ画像を人物写真へ差替え）

- チャット詳細（ChatDetailScreen）
  - 右上の電話ボタンを削除し、授業履歴画面への遷移ボタンを追加
  - 講師名の直下に「先輩 / 後輩 / 同級生」を表示（学校/学年から簡易推定）
  - 入力欄と送信ボタンの高さを48pxで揃え、iOSのプレースホルダ縦位置を中央に調整

- 授業履歴（LessonHistoryScreen）
  - 新規作成。LessonScreen と同じUI/タブ（今後/履歴）構成
  - 講師のアバター（丸 40px）を表示

- 授業（LessonScreen）
  - 「完了にする」に確認ダイアログを追加
  - ステータスバッジの色/透明度を調整（pending=secondary、背景透過15）

- モック/不具合修正
  - チャットモックID（tutorId/senderId）の不整合を修正し、一覧に表示
  - フック順序エラーを解消（早期returnの位置をフック定義後へ）

---

対応方針（提案）

- 短期（UI整合）
  - CoinManagementScreen の換算表示を「1コイン = 1.25円」に修正
  - コイン購入パッケージを要件の4プランに合わせる
  - requirements.md の React Navigation 版表記を v7 に更新（またはコードを v6 に戻す方針決定）
- 中期（機能実装）
  - マッチング申請時の300コイン徴収・仮押さえの内部処理（状態/履歴）をモックAPIに追加
  - 授業申請→承認→完了→送金のステートマシン整備
  - プロフィール（先輩）に料金項目 + 最低料金バリデーション追加
- 長期（本番統合）
  - Supabase 認証/DB/リアルタイム統合、Stripe Connect での購入/エスクロー/送金実装

### 2025-09-07（申請画面・検索UI・通知画面の大幅改修）

- 授業申請（LessonRequestScreen）
  - 二重スクロールを解消し、固定CTAを画面下に固定＋中央寄せ（セーフエリア対応）。
  - 下部見切れ対策として ScrollView の contentContainerStyle.paddingBottom を増加。
  - ヘッダーの左右/上のセーフエリアを白で連結し、青い背景が見えないように統一。
  - 申請ボタンの位置・余白を微調整（少し上に配置）。

- 探す（SearchScreen）
  - 検索バー/フィルタボタンを白カード化（背景=white、border=gray300、薄い影）で背景となじまないよう改善。
  - 上下余白を調整し、左右幅をカード（TutorCard）と統一（spacing.md）。
  - 視認性と一貫性を向上。

- 通知（NotificationScreen）
  - レイアウト再構成：左上に種類アイコン（丸背景なし/サイズ拡大）、中央に人物アイコン（実画像）、その下に本文、右上に時刻。
  - 右側の矢印を削除。
  - 未読の背景色を濃く（primary+'15'）し、左側の青い線は削除。
  - アイテムの境界線を gray200 に変更、背景を白にして境目を明確化。
  - 「要対応」バッジはテキスト末尾から独立した丸ピルに変更し、中央揃えで表示。
  - ヘッダー左右の余白を統一（spacing.md）。「すべて既読」ボタンの位置・余白を調整。
  - 人物アイコンは randomuser.me のモック画像を使用（名前に応じて割当）。

影響ファイル

- src/screens/LessonRequestScreen.tsx
- src/screens/SearchScreen.tsx
- src/screens/NotificationScreen.tsx
- docs/requirements_diff.md（本差分）

補足

- モック画像URLは将来的に backend の avatar_url に差し替え可能。
