# Senpai（先輩）プロジェクト概要

## プロジェクトの目的

**「先輩に教えてもらう青春体験」をコンセプトとした家庭教師マッチングアプリ**

- 学生（後輩）と家庭教師（先輩）をマッチング
- 安全で信頼できるプラットフォーム提供
- コイン制決済システム（1コイン = 1.25円）

## 技術スタック

- **フレームワーク**: React Native 0.79.6 + Expo ~53.0.22
- **言語**: TypeScript ~5.8.3 (strict mode)
- **状態管理**: Context API + useReducer
- **ナビゲーション**: React Navigation v7
- **バックエンド**: Supabase（データベース・認証・リアルタイム）
- **決済**: Stripe Connect
- **テスト**: Jest + Testing Library

## プロジェクト構造

```
src/
├── screens/          # 画面コンポーネント
├── components/       # 再利用可能UIコンポーネント
│   ├── common/       # 汎用コンポーネント
│   └── tutor/        # 先輩関連コンポーネント
├── navigation/       # React Navigationルーティング
├── services/         # API呼び出し・外部サービス統合
├── contexts/         # Context API（状態管理）
├── types/           # TypeScript型定義
├── styles/          # テーマ・色・スペーシング定義
└── utils/           # ユーティリティ関数

docs/                # 要件定義・ガイドライン
├── requirements.md  # 最新仕様（必読）
├── mobile-ui-spacing-guidelines.md
└── plan.md
```

## 開発環境

- Node.js (v16以上)
- Windows 10/11
- Expo CLI
- Expo Go アプリ（実機テスト用）

## 重要なビジネスルール

- **用語統一**: 後輩（学ぶ側）、先輩（教える側）
- **コイン体系**: 1コイン = 1.25円
- **マッチング料**: 300コイン（初回のみ）
- **決済フロー**: 申請→仮押さえ→承認→エスクロー→完了→送金
