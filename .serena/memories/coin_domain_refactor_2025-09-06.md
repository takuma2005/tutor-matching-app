# コイン設計のドメイン層導入（2025-09-06）

- 目的: モック→本番（Supabase/Stripe等）への移行を最小差分で実現するため、Port & Adapter パターンで抽象化
- 追加: CoinGateway（抽象）/ MockCoinGateway（実装）/ CoinManager（アプリサービス）/ coinEvents（PubSub）
  - CoinGateway: getBalance / purchase / applyDelta / getHistory
  - MockCoinGateway: 既存 mockCoinService を内部利用、applyDelta は addMockTransaction で残高更新
  - CoinManager: 各操作後に最新残高を取得し coinEvents.emitBalanceChanged で通知
  - UserContext: coinEvents を購読し user.coins を即時反映
- 適用箇所:
  - CoinManagementScreen: CoinManager.purchase を使用
  - LessonRequestScreen: 授業申請成功後に CoinManager.syncBalance で真値同期
  - TutorDetailScreen: CoinManager.applyDelta(...,'matching') で即時反映（モックでは取引記録）
- UI/UX:
  - Home: QuickActions 非表示・新着の先輩セクション追加・セクション間の余白統一
  - Favorite: 再お気に入り不可問題のフォールバック修正（student.id → user.id → 'local'）
  - Auth: モック時に起動時自動ログイン（プロフィール未検出の軽減）
- 今後: ProdCoinGateway 追加で本番APIへ差し替え。purchase/applyDelta/syncBalance の呼び出し口は据え置き
