// モック実装の動作確認用サンプル

import { mockApiClient } from './index';

export async function runMockApiTests() {
  console.log('🧪 モックAPI実装の動作確認を開始');

  try {
    // 1. 認証テスト
    console.log('\n--- 認証テスト ---');

    const signInResult = await mockApiClient.auth.signIn(
      'hanako.tanaka@example.com',
      'password123',
    );
    console.log('サインイン結果:', signInResult);

    const currentUser = await mockApiClient.auth.getCurrentUser();
    console.log('現在のユーザー:', currentUser);

    // 2. 生徒プロフィール取得テスト
    console.log('\n--- 生徒プロフィールテスト ---');

    const studentProfile = await mockApiClient.student.getProfile('student-1');
    console.log('生徒プロフィール:', studentProfile);

    // 3. 家庭教師検索テスト
    console.log('\n--- 家庭教師検索テスト ---');

    const allTutors = await mockApiClient.student.searchTutors();
    console.log('全家庭教師:', allTutors);

    const mathTutors = await mockApiClient.student.searchTutors({
      subject: '数学',
      min_rating: 4.5,
    });
    console.log('数学の高評価家庭教師:', mathTutors);

    // 4. レッスン予約テスト
    console.log('\n--- レッスン予約テスト ---');

    const bookingResult = await mockApiClient.student.bookLesson('tutor-2', {
      tutor_id: 'tutor-2',
      student_id: 'student-1',
      subject: '英語',
      scheduled_at: '2024-02-01T10:00:00Z',
      duration_minutes: 60,
      coin_cost: 100,
    });
    console.log('レッスン予約結果:', bookingResult);

    // 5. レッスン履歴取得テスト
    console.log('\n--- レッスン履歴テスト ---');

    const lessons = await mockApiClient.student.getLessons({
      status: 'completed',
    });
    console.log('完了済みレッスン:', lessons);

    // 6. コイン残高確認テスト
    console.log('\n--- コイン残高テスト ---');

    const balance = await mockApiClient.coin.getBalance('student-1');
    console.log('コイン残高:', balance);

    // 7. コイン購入テスト
    console.log('\n--- コイン購入テスト ---');

    const coinPurchase = await mockApiClient.coin.purchaseCoins('student-1', 500, 'pm_card_visa');
    console.log('コイン購入結果:', coinPurchase);

    // 8. 取引履歴テスト
    console.log('\n--- 取引履歴テスト ---');

    const transactions = await mockApiClient.coin.getTransactionHistory('student-1');
    console.log('取引履歴:', transactions);

    // 9. レッスン評価テスト
    console.log('\n--- レッスン評価テスト ---');

    const rating = await mockApiClient.student.rateLesson('lesson-1', 5);
    console.log('レッスン評価結果:', rating);

    console.log('\n✅ すべてのテストが完了しました');
  } catch (error) {
    console.error('❌ テストエラー:', error);
  }
}

// エラーハンドリングテスト
export async function runErrorHandlingTests() {
  console.log('\n🚨 エラーハンドリングテスト');

  try {
    // 存在しないユーザーでサインイン
    const failedSignIn = await mockApiClient.auth.signIn(
      'nonexistent@example.com',
      'wrongpassword',
    );
    console.log('存在しないユーザーサインイン:', failedSignIn);

    // 不正な評価
    const invalidRating = await mockApiClient.student.rateLesson('lesson-1', 6);
    console.log('不正な評価:', invalidRating);

    // コイン不足での予約
    const insufficientCoins = await mockApiClient.student.bookLesson('tutor-1', {
      tutor_id: 'tutor-1',
      student_id: 'student-1',
      subject: '数学',
      scheduled_at: '2024-02-15T19:00:00Z',
      duration_minutes: 120,
      coin_cost: 10000, // 大きすぎる金額
    });
    console.log('コイン不足予約:', insufficientCoins);

    console.log('\n✅ エラーハンドリングテストが完了しました');
  } catch (error) {
    console.error('❌ エラーハンドリングテストエラー:', error);
  }
}

// 使用例
// runMockApiTests();
// runErrorHandlingTests();
