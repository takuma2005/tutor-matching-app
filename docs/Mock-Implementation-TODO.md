# Mock Implementation TODO（優先度付き）

この文書は、モック環境のままMVPのハッピーパスを成立させるために必要な追加実装・整備項目を、要件（docs/requirements.md・docs/plan.md）と現状コード（src/services/api/mock/\*\*, constants/ ほか）を突き合わせて洗い出したものです。コードへの具体的な反映ポイントを併記します。

最終更新: 2025-09-13

---

## 依存（前提）

- API層の切替は現状 EXPO_PUBLIC_USE_MOCK=true を参照（src/services/api/mock/index.ts）。要件では EXPO_PUBLIC_API_MODE=mock|supabase を想定 → 後述の統一対応が必要。
- コイン定数・プランは constants/coinPlans.ts で公式化済（OK）。
- モックDBは src/services/api/mock/data.ts の mockDb に一元化。

---

## HIGH（直近優先）

1. TutorService のモック実装と API クライアント統合

- 目的: 講師側の申請承認/拒否・レッスン一覧・空き時間更新など、講師向けユースケースをUIから呼べるようにする。
- 変更/追加:
  - 新規: src/services/api/mock/tutorService.ts
    - getProfile/updateProfile（型: Tutor）
    - getMatchRequests(status?) / approveMatchRequest(matchId) / rejectMatchRequest(matchId, reason?)
      - 内部で MockMatchingService を使用
    - getLessons(filters?, page?, limit?) / updateLesson(lessonId, updates)
    - updateAvailability(userId, availability: TimeSlot[])
  - 統合: src/services/api/mock/index.ts
    - mockApiClient に tutor: mockTutorService を追加エクスポート
- 参照: src/services/api/types.ts の TutorService IF

2. API モード切替の環境変数統一（ドキュメント整合）

- 目的: 要件の EXPO_PUBLIC_API_MODE=mock|supabase に合わせ、EXPO_PUBLIC_USE_MOCK との混在を解消。
- 変更/追加:
  - src/services/api/mock/index.ts の getApiClient()
    - 判定ロジックを API_MODE 優先に変更（USE_MOCKは後方互換）
    - 例: mode = process.env.EXPO_PUBLIC_API_MODE; if (mode==='mock') → mock, if (mode==='supabase') → prod; else fallback to USE_MOCK or **DEV**
  - docs/README or docs/plan.md に切替手順を追記（本ファイル末尾のドキュメント更新参照）

3. NotificationService の配線（マッチ/授業/メッセージ）

- 目的: 主要イベントで通知を生成し、画面の“通知”UIと連動させる。
- 変更/追加:
  - src/services/api/mock/index.ts に notification: mockNotificationService を追加
  - src/services/api/mock/matchingService.ts
    - sendMatchRequest 成功後 → 先輩向け createMatchRequestNotification()
    - approveMatchRequest 成功後 → 後輩向け createMatchApprovalNotification()
  - src/services/api/mock/escrowService.ts
    - approveLesson 成功後 → 学生/講師向け createLessonApprovalNotification()
    - completeLesson 成功後 → 講師向け createLessonCompletedNotification()
  - src/services/api/mock/chatService.ts
    - sendMessage 成功後 → 受信者向け createMessageNotification()

4. レッスン申請フローの整合（仮押さえ→承認→完了）

- 現状: StudentService.bookLesson で status='scheduled' & 残高減算。EscrowService.approveLesson でも負債トランザクションを追加しており、履歴と残高のタイミングがズレる恐れ。
- 目標: 要件の「申請で仮押さえ」「承認でエスクロー」「完了で送金」に一致させる。
- 変更/追加（提案）:
  - types.ts の CoinTransaction.status を活用
  - StudentService.bookLesson:
    - 新規レッスンは status='pending', lesson.escrow_status='reserved'
    - 学生の残高を coin_cost 分減算（仮押さえ）
    - 予約トランザクション（type: 'lesson_payment', status: 'pending', related_id: lessonId）を追加
  - MockEscrowService.approveLesson:
    - 予約トランザクションを検索し status='completed' に更新（“エスクロー移行”として確定）
    - 新規の負債トランザクションを追加しない（重複防止）
  - MockEscrowService.cancelLesson / rejectLesson:
    - pending/approved いずれも予約トランザクション or 同額返金トランザクションで整合
- 画面影響: LessonRequestScreen / LessonScreen の状態表示と履歴の同期

5. CoinService の取引台帳の一元化

- 現状: coinService.ts は内部配列（this.transactions）を保持。matching/escrow が mockDb.coinTransactions に書くため不整合の恐れ。
- 変更/追加:
  - coinService.ts の全参照を mockDb.coinTransactions に統一（読み書き先を一本化）
  - addMockTransaction も mockDb.coinTransactions を操作

6. チャットの二重実装の整理（ChatService vs MockChatRepository）

- 現状: services/api/mock/chatService.ts（REST風）と services/mock/MockChatRepository.ts（Repository +擬似RT）が並存。
- 目標: UI側の依存先を一本化（Hook useChat は Repositoryベース）。
- 選択肢:
  - A) ChatService を薄いアダプタにして内部で MockChatRepository を利用
  - B) UI からは Repository のみ参照し、ChatService は index.ts への露出を停止
- 変更/追加: 方針Aの場合、chatService.ts 内で repository を初期化して各メソッドを委譲。

---

## MEDIUM（次点改善）

7. 先輩プロファイル更新の最低料金バリデーション

- 目的: MIN_HOURLY_RATE=1200 コイン/時を強制。
- 変更/追加:
  - TutorService.updateProfile 内で hourly_rate < MIN_HOURLY_RATE の場合エラー
  - 既存の zod バリデーション（src/utils/validation.ts）との二重化を避けるため、UI では事前検証、サーバ（モック）側でも最終チェック

8. マッチ申請の期限切れ処理（expires_at）

- 現状: matchingService は expires_at をセットするが、期限切れの自動遷移なし。
- 変更/追加:
  - 擬似的な“クリーンアップ”ユーティリティを追加（開発用）
  - get\*MatchRequests() 呼び出し時に期限切れの pending を expired へ更新（副作用OKなモック限定挙動）

9. RealtimeService のスタブ

- 目的: 型にある RealtimeService をモックで満たし、将来の Supabase 置換容易化。
- 変更/追加:
  - src/services/api/mock/realtimeService.ts を新規作成（subscribeToUserNotifications, subscribeLessonUpdates を notificationService / mockDb をポーリング or setInterval で擬似）
  - index.ts に realtime を追加

10. 返金・キャンセルの台帳表示整合

- 目的: 返金（マッチ拒否/キャンセル、授業拒否/キャンセル）時に履歴が直感的に見えるよう、description と type を統一。
- 変更/追加:
  - matchingService / escrowService の返金トランザクション description を共通パターンに統一
  - 種別は現行 union 型（refund / lesson_refund / matching）に従い揃える

11. 通知画面のUX補助（未読数・既読一括）

- 目的: NotificationScreen の要件と notificationService API を結線。
- 変更/追加:
  - markAllAsRead(userId) と getUnreadCount(userId) を画面から呼び出し
  - リフレッシュで getUserNotifications(limit) を再読込

---

## LOW（将来/保留）

12. 出金（Payout）モックの骨子

- 目的: 要件の PayoutRequest 型（requirements.md, 8章参照）に先行で合わせる。
- 変更/追加（スケルトンのみ）:
  - src/services/api/mock/payoutService.ts（createPayoutRequest, getPayoutRequests, cancelPayoutRequest など）
  - CoinTransaction に “出金手数料”の記録（typeは既存の spend または専用を検討）

13. 既読/未読の厳密な同期

- 目的: チャットの MessageStatus を厳密に遷移（sending→sent→delivered→read）。
- 変更/追加:
  - MockChatRepository 内の購読イベントに delivered/read を模擬（一定時間で自動遷移）

---

## 具体的コード変更ポイント（一部サンプル）

- src/services/api/mock/index.ts
  - mockApiClient に tutor, notification, realtime を追加
  - getApiClient の切替判定を EXPO_PUBLIC_API_MODE 優先へ

- src/services/api/mock/coinService.ts
  - 内部保持の transactions を廃止し、mockDb.coinTransactions を唯一の台帳として利用

- src/services/api/mock/studentService.ts
  - bookLesson: status='pending', escrow_status='reserved'、残高減算と pending 取引追加

- src/services/api/mock/escrowService.ts
  - approveLesson: 既存の pending 取引を completed に更新（重複負債の追加を廃止）
  - cancel/reject: pending/approved を問わず整合の取れた返金ロジック

- src/services/api/mock/matchingService.ts
  - 通知呼び出し（createMatchRequestNotification, createMatchApprovalNotification）を追加

- services/mock/ と services/api/mock/ のチャット二重化対応
  - 方針A: ChatService から MockChatRepository に委譲
  - または方針B: UI 側を Repository へ一本化し ChatService 露出を停止

---

## ドキュメント更新（提案）

- docs/README or WARP.md に追記
  - API/決済モード切替:
    - EXPO_PUBLIC_API_MODE=mock|supabase
    - EXPO_PUBLIC_PAYMENT_MODE=mock|stripe
    - 後方互換: EXPO_PUBLIC_USE_MOCK=true でも mock 選択（将来削除予定）
  - モックDBリセット手順（必要なら）
  - チャットのデータソース方針（Repository一本化 or ChatService委譲）

- docs/requirements_diff.md への反映
  - 本TODOの完了後、差分セクションに “レッスン仮押さえ/エスクロー履歴の整合” と “APIモード変数の統一” を追記

---

## 次アクション（推奨順）

1. CoinService の台帳一元化（HIGH-5）
2. StudentService/bookLesson と EscrowService の状態整合（HIGH-4）
3. NotificationService の配線（HIGH-3）
4. TutorService 実装と index 統合（HIGH-1）
5. API モード切替の環境変数統一（HIGH-2）
6. チャット実装の一本化方針を決定（HIGH-6）
7. MEDIUM 項目を順次実施（7→11）

---

以上。レビュー後、各項目を小粒PRに分割して進めることを推奨します。
