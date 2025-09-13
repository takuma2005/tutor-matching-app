import uuid from 'react-native-uuid';

import type { ApiResponse, Lesson, CoinTransaction } from '../types';
import { mockDb } from './data';
import { mockNotificationService } from './notificationService';

import { COIN_CONSTANTS } from '@/constants/coinPlans';

export class MockEscrowService {
  // 授業申請を承認してエスクローを開始
  async approveLesson(lessonId: string): Promise<ApiResponse<Lesson>> {
    try {
      const lesson = mockDb.lessons.find((l) => l.id === lessonId);

      if (!lesson) {
        return {
          success: false,
          error: '授業が見つかりません。',
          data: {} as Lesson,
        };
      }

      if (lesson.status !== 'pending') {
        return {
          success: false,
          error: 'この授業は既に処理済みです。',
          data: lesson,
        };
      }

      // 学生の存在確認
      const student = mockDb.students.find((s) => s.id === lesson.student_id);
      if (!student) {
        return {
          success: false,
          error: '学生が見つかりません。',
          data: {} as Lesson,
        };
      }

      // 授業を承認状態に更新（仮押さえ → エスクロー）
      lesson.status = 'approved';
      lesson.escrow_status = 'escrowed';
      lesson.approved_at = new Date().toISOString();
      lesson.updated_at = new Date().toISOString();

      // 既存の pending 取引（lesson_payment）を completed に更新
      const pendingTx = mockDb.coinTransactions.find(
        (t) =>
          t.user_id === student.id &&
          t.related_id === lessonId &&
          t.type === 'lesson_payment' &&
          t.status === 'pending',
      );

      if (pendingTx) {
        pendingTx.status = 'completed';
        pendingTx.description = `授業料エスクロー: ${lesson.subject}`;
      } else {
        // フォールバック: 取引が見つからない場合は completed を新規作成
        const escrowTransaction: CoinTransaction = {
          id: String(uuid.v4()),
          user_id: student.id,
          amount: -lesson.coin_cost,
          type: 'lesson_payment',
          description: `授業料エスクロー: ${lesson.subject}`,
          related_id: lessonId,
          status: 'completed',
          created_at: new Date().toISOString(),
        };
        mockDb.coinTransactions.push(escrowTransaction);
      }

      // 通知: 学生へ授業承認の通知
      const tutor = mockDb.tutors.find((t) => t.id === lesson.tutor_id);
      if (tutor) {
        await mockNotificationService.createLessonApprovalNotification(
          lesson.student_id,
          lesson.tutor_id,
          tutor.name,
          lesson.subject,
          lessonId,
        );
      }

      return {
        success: true,
        data: lesson,
      };
    } catch {
      return {
        success: false,
        error: '授業の承認に失敗しました。',
        data: {} as Lesson,
      };
    }
  }

  // 授業申請を拒否してコインを返金
  async rejectLesson(lessonId: string, _reason?: string): Promise<ApiResponse<Lesson>> {
    try {
      const lesson = mockDb.lessons.find((l) => l.id === lessonId);

      if (!lesson) {
        return {
          success: false,
          error: '授業が見つかりません。',
          data: {} as Lesson,
        };
      }

      if (lesson.status !== 'pending') {
        return {
          success: false,
          error: 'この授業は既に処理済みです。',
          data: lesson,
        };
      }

      // 学生にコインを返金
      const student = mockDb.students.find((s) => s.id === lesson.student_id);
      if (student) {
        student.coins += lesson.coin_cost;

        // 返金取引記録を追加
        const refundTransaction: CoinTransaction = {
          id: String(uuid.v4()),
          user_id: student.id,
          amount: lesson.coin_cost,
          type: 'lesson_refund',
          description: `返金: 授業 ${lesson.subject}`,
          related_id: lessonId,
          status: 'completed',
          created_at: new Date().toISOString(),
        };
        mockDb.coinTransactions.push(refundTransaction);

        // 既存の pending 取引をキャンセルへ更新
        const pendingTx = mockDb.coinTransactions.find(
          (t) =>
            t.user_id === student.id &&
            t.related_id === lessonId &&
            t.type === 'lesson_payment' &&
            t.status === 'pending',
        );
        if (pendingTx) pendingTx.status = 'cancelled';
      }

      // 授業を拒否状態に更新
      lesson.status = 'rejected';
      lesson.escrow_status = 'refunded';
      lesson.updated_at = new Date().toISOString();

      return {
        success: true,
        data: lesson,
      };
    } catch {
      return {
        success: false,
        error: '授業の拒否に失敗しました。',
        data: {} as Lesson,
      };
    }
  }

  // 授業開始
  async startLesson(lessonId: string): Promise<ApiResponse<Lesson>> {
    try {
      const lesson = mockDb.lessons.find((l) => l.id === lessonId);

      if (!lesson) {
        return {
          success: false,
          error: '授業が見つかりません。',
          data: {} as Lesson,
        };
      }

      if (lesson.status !== 'approved') {
        return {
          success: false,
          error: 'この授業は開始できません。',
          data: lesson,
        };
      }

      // 授業を進行中に更新
      lesson.status = 'in_progress';
      lesson.updated_at = new Date().toISOString();

      return {
        success: true,
        data: lesson,
      };
    } catch {
      return {
        success: false,
        error: '授業の開始に失敗しました。',
        data: {} as Lesson,
      };
    }
  }

  // 授業完了とコイン送金
  async completeLesson(
    lessonId: string,
    feedback?: string,
    rating?: number,
  ): Promise<ApiResponse<Lesson>> {
    try {
      const lesson = mockDb.lessons.find((l) => l.id === lessonId);

      if (!lesson) {
        return {
          success: false,
          error: '授業が見つかりません。',
          data: {} as Lesson,
        };
      }

      if (!['approved', 'in_progress'].includes(lesson.status)) {
        return {
          success: false,
          error: 'この授業は完了できません。',
          data: lesson,
        };
      }

      // 家庭教師を見つける
      const tutor = mockDb.tutors.find((t) => t.id === lesson.tutor_id);
      if (!tutor) {
        return {
          success: false,
          error: '家庭教師が見つかりません。',
          data: {} as Lesson,
        };
      }

      // プラットフォーム手数料を計算（requirements.md に従い 15%）
      const platformFee = Math.floor(lesson.coin_cost * COIN_CONSTANTS.PLATFORM_FEE_RATE);
      const tutorAmount = lesson.coin_cost - platformFee;

      // 家庭教師にコインを送金（実際のシステムでは家庭教師アカウントに送金）
      // ここではモックなので、送金記録のみ作成
      const transferTransaction: CoinTransaction = {
        id: String(uuid.v4()),
        user_id: tutor.id,
        amount: tutorAmount,
        type: 'lesson_payment',
        description: `授業料受取: ${lesson.subject}（手数料${platformFee}コイン差し引き後）`,
        related_id: lessonId,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      mockDb.coinTransactions.push(transferTransaction);

      // プラットフォーム手数料記録
      const feeTransaction: CoinTransaction = {
        id: String(uuid.v4()),
        user_id: 'platform',
        amount: platformFee,
        type: 'spend',
        description: `プラットフォーム手数料: ${lesson.subject}`,
        related_id: lessonId,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      mockDb.coinTransactions.push(feeTransaction);

      // 通知: 講師へ授業完了と受取通知
      const student = mockDb.students.find((s) => s.id === lesson.student_id);
      await mockNotificationService.createLessonCompletedNotification(
        lesson.tutor_id,
        lesson.student_id,
        student?.name || '生徒',
        lesson.subject,
        tutorAmount,
        lessonId,
      );

      // 授業を完了状態に更新
      lesson.status = 'completed';
      lesson.escrow_status = 'released';
      lesson.completed_at = new Date().toISOString();
      lesson.updated_at = new Date().toISOString();

      if (feedback) {
        lesson.tutor_feedback = feedback;
      }

      if (rating && rating >= 1 && rating <= 5) {
        lesson.student_rating = rating;
      }

      return {
        success: true,
        data: lesson,
      };
    } catch {
      return {
        success: false,
        error: '授業の完了に失敗しました。',
        data: {} as Lesson,
      };
    }
  }

  // 授業キャンセルとコイン返金
  async cancelLesson(lessonId: string, _reason?: string): Promise<ApiResponse<Lesson>> {
    try {
      const lesson = mockDb.lessons.find((l) => l.id === lessonId);

      if (!lesson) {
        return {
          success: false,
          error: '授業が見つかりません。',
          data: {} as Lesson,
        };
      }

      if (!['pending', 'approved'].includes(lesson.status)) {
        return {
          success: false,
          error: 'この授業はキャンセルできません。',
          data: lesson,
        };
      }

      // 学生にコインを返金
      const student = mockDb.students.find((s) => s.id === lesson.student_id);
      if (student) {
        student.coins += lesson.coin_cost;

        // 返金取引記録を追加
        const refundTransaction: CoinTransaction = {
          id: String(uuid.v4()),
          user_id: student.id,
          amount: lesson.coin_cost,
          type: 'lesson_refund',
          description: `返金: 授業 ${lesson.subject}`,
          related_id: lessonId,
          status: 'completed',
          created_at: new Date().toISOString(),
        };

        mockDb.coinTransactions.push(refundTransaction);

        // 既存の pending 取引をキャンセルへ更新
        const pendingTx = mockDb.coinTransactions.find(
          (t) =>
            t.user_id === student.id &&
            t.related_id === lessonId &&
            t.type === 'lesson_payment' &&
            t.status === 'pending',
        );
        if (pendingTx) pendingTx.status = 'cancelled';
      }

      // 授業をキャンセル状態に更新
      lesson.status = 'cancelled';
      lesson.escrow_status = 'refunded';
      lesson.updated_at = new Date().toISOString();

      return {
        success: true,
        data: lesson,
      };
    } catch {
      return {
        success: false,
        error: '授業のキャンセルに失敗しました。',
        data: {} as Lesson,
      };
    }
  }

  // エスクローステータスの確認
  async getEscrowStatus(lessonId: string): Promise<
    ApiResponse<{
      lesson: Lesson;
      transactions: CoinTransaction[];
    }>
  > {
    try {
      const lesson = mockDb.lessons.find((l) => l.id === lessonId);

      if (!lesson) {
        return {
          success: false,
          error: '授業が見つかりません。',
          data: {} as unknown as { lesson: Lesson; transactions: CoinTransaction[] },
        };
      }

      // 関連する取引を取得
      const transactions = mockDb.coinTransactions.filter((t) => t.related_id === lessonId);

      return {
        success: true,
        data: {
          lesson,
          transactions,
        },
      };
    } catch {
      return {
        success: false,
        error: 'エスクローステータスの取得に失敗しました。',
        data: {} as unknown as { lesson: Lesson; transactions: CoinTransaction[] },
      };
    }
  }
}
