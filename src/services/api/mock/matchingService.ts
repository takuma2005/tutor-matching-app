import uuid from 'react-native-uuid';

import type { ApiResponse, MatchRequest, MatchStatus, CoinTransaction } from '../types';
import { mockDb } from './data';
import { mockNotificationService } from './notificationService';

import { COIN_CONSTANTS } from '@/constants/coinPlans';

export class MockMatchingService {
  // 学生がマッチング申請を送信
  async sendMatchRequest(
    studentId: string,
    tutorId: string,
    message: string,
    scheduleNote?: string,
  ): Promise<ApiResponse<MatchRequest>> {
    try {
      // バリデーション
      if (!message || message.trim().length < 20) {
        return {
          success: false,
          error: 'メッセージは20文字以上で入力してください。',
          data: {} as MatchRequest,
        };
      }

      // 学生の残高チェック
      const student = mockDb.students.find((s) => s.id === studentId);
      if (!student || student.coins < COIN_CONSTANTS.MATCHING_COST) {
        return {
          success: false,
          error: `コインが不足しています。必要コイン：${COIN_CONSTANTS.MATCHING_COST}コイン`,
          data: {} as MatchRequest,
        };
      }

      // 家庭教師の存在チェック
      const tutor = mockDb.tutors.find((t) => t.id === tutorId);
      if (!tutor) {
        return {
          success: false,
          error: '指定された家庭教師が見つかりません。',
          data: {} as MatchRequest,
        };
      }

      // 既存の申請チェック（同じ家庭教師への未承認申請があるかチェック）
      const existingRequest = mockDb.matchRequests.find(
        (req) =>
          req.student_id === studentId && req.tutor_id === tutorId && req.status === 'pending',
      );

      if (existingRequest) {
        return {
          success: false,
          error: 'この家庭教師への申請が既に送信されています。',
          data: {} as MatchRequest,
        };
      }

      const matchId = String(uuid.v4());
      const now = new Date().toISOString();

      // マッチング申請を作成
      const matchRequest: MatchRequest = {
        id: matchId,
        student_id: studentId,
        tutor_id: tutorId,
        message: message.trim(),
        schedule_note: scheduleNote?.trim() || undefined,
        status: 'pending',
        coin_cost: COIN_CONSTANTS.MATCHING_COST,
        created_at: now,
        updated_at: now,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7日後に期限切れ
      };

      // 学生のコイン残高から差し引き（仮押さえ）
      student.coins -= COIN_CONSTANTS.MATCHING_COST;

      // コイン取引記録を追加
      const transaction: CoinTransaction = {
        id: String(uuid.v4()),
        user_id: studentId,
        amount: -COIN_CONSTANTS.MATCHING_COST,
        type: 'matching',
        description: `${tutor.name}さんへのマッチング申請`,
        related_id: matchId,
        status: 'completed',
        created_at: now,
      };

      // データベースに保存
      mockDb.matchRequests.push(matchRequest);
      mockDb.coinTransactions.push(transaction);

      // 通知: 先輩に申請受信を通知
      await mockNotificationService.createMatchRequestNotification(
        tutor.id,
        student.id,
        student.name,
        matchId,
      );

      return {
        success: true,
        data: matchRequest,
      };
    } catch {
      return {
        success: false,
        error: 'マッチング申請の送信に失敗しました。',
        data: {} as MatchRequest,
      };
    }
  }

  // 学生のマッチング申請一覧を取得
  async getStudentMatchRequests(
    studentId: string,
    status?: MatchStatus,
  ): Promise<ApiResponse<MatchRequest[]>> {
    try {
      let requests = mockDb.matchRequests.filter((req) => req.student_id === studentId);

      // 期限切れを自動遷移（副作用はモック限定）
      const now = Date.now();
      for (const r of requests) {
        if (r.status === 'pending' && r.expires_at && new Date(r.expires_at).getTime() < now) {
          r.status = 'expired';
          r.updated_at = new Date().toISOString();
        }
      }

      if (status) {
        requests = requests.filter((req) => req.status === status);
      }

      // 作成日時の降順でソート
      requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return {
        success: true,
        data: requests,
      };
    } catch {
      return {
        success: false,
        error: 'マッチング申請一覧の取得に失敗しました。',
        data: [],
      };
    }
  }

  // 家庭教師のマッチング申請一覧を取得
  async getTutorMatchRequests(
    tutorId: string,
    status?: MatchStatus,
  ): Promise<ApiResponse<MatchRequest[]>> {
    try {
      let requests = mockDb.matchRequests.filter((req) => req.tutor_id === tutorId);

      // 期限切れを自動遷移（副作用はモック限定）
      const now = Date.now();
      for (const r of requests) {
        if (r.status === 'pending' && r.expires_at && new Date(r.expires_at).getTime() < now) {
          r.status = 'expired';
          r.updated_at = new Date().toISOString();
        }
      }

      if (status) {
        requests = requests.filter((req) => req.status === status);
      }

      // 作成日時の降順でソート
      requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return {
        success: true,
        data: requests,
      };
    } catch {
      return {
        success: false,
        error: 'マッチング申請一覧の取得に失敗しました。',
        data: [],
      };
    }
  }

  // 家庭教師がマッチング申請を承認
  async approveMatchRequest(matchId: string): Promise<ApiResponse<MatchRequest>> {
    try {
      const matchRequest = mockDb.matchRequests.find((req) => req.id === matchId);

      if (!matchRequest) {
        return {
          success: false,
          error: 'マッチング申請が見つかりません。',
          data: {} as MatchRequest,
        };
      }

      if (matchRequest.status !== 'pending') {
        return {
          success: false,
          error: 'この申請は既に処理済みです。',
          data: matchRequest,
        };
      }

      // 申請を承認に更新
      matchRequest.status = 'approved';
      matchRequest.updated_at = new Date().toISOString();

      // チャットルームを自動作成
      const chatRoomId = String(uuid.v4());
      const chatRoom = {
        id: chatRoomId,
        tutorId: matchRequest.tutor_id,
        studentId: matchRequest.student_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.chatRooms.push(chatRoom);

      // 通知: 後輩に承認通知
      const tutor = mockDb.tutors.find((t) => t.id === matchRequest.tutor_id);
      if (tutor) {
        await mockNotificationService.createMatchApprovalNotification(
          matchRequest.student_id,
          matchRequest.tutor_id,
          tutor.name,
          matchId,
        );
      }

      return {
        success: true,
        data: matchRequest,
      };
    } catch {
      return {
        success: false,
        error: 'マッチング申請の承認に失敗しました。',
        data: {} as MatchRequest,
      };
    }
  }

  // 家庭教師がマッチング申請を拒否
  async rejectMatchRequest(matchId: string, _reason?: string): Promise<ApiResponse<MatchRequest>> {
    try {
      const matchRequest = mockDb.matchRequests.find((req) => req.id === matchId);

      if (!matchRequest) {
        return {
          success: false,
          error: 'マッチング申請が見つかりません。',
          data: {} as MatchRequest,
        };
      }

      if (matchRequest.status !== 'pending') {
        return {
          success: false,
          error: 'この申請は既に処理済みです。',
          data: matchRequest,
        };
      }

      // 申請を拒否に更新
      matchRequest.status = 'rejected';
      matchRequest.updated_at = new Date().toISOString();

      // 学生にコインを返金
      const student = mockDb.students.find((s) => s.id === matchRequest.student_id);
      if (student) {
        student.coins += matchRequest.coin_cost;

        // 返金取引記録を追加
        const refundTransaction: CoinTransaction = {
          id: String(uuid.v4()),
          user_id: student.id,
          amount: matchRequest.coin_cost,
          type: 'refund',
          description: `返金: マッチング申請`,
          related_id: matchId,
          status: 'completed',
          created_at: new Date().toISOString(),
        };
        mockDb.coinTransactions.push(refundTransaction);
      }

      const tutor = mockDb.tutors.find((t) => t.id === matchRequest.tutor_id);

      await Promise.all([
        mockNotificationService.createMatchRejectionNotificationForStudent(
          matchRequest.student_id,
          tutor?.name ?? '担当の先輩',
          matchId,
        ),
        ...(tutor
          ? [
              mockNotificationService.createMatchRejectionNotificationForTutor(
                tutor.id,
                student?.name ?? '後輩',
                matchId,
              ),
            ]
          : []),
      ]);

      return {
        success: true,
        data: matchRequest,
      };
    } catch {
      return {
        success: false,
        error: 'マッチング申請の拒否に失敗しました。',
        data: {} as MatchRequest,
      };
    }
  }

  // 学生がマッチング申請をキャンセル
  async cancelMatchRequest(matchId: string): Promise<ApiResponse<MatchRequest>> {
    try {
      const matchRequest = mockDb.matchRequests.find((req) => req.id === matchId);

      if (!matchRequest) {
        return {
          success: false,
          error: 'マッチング申請が見つかりません。',
          data: {} as MatchRequest,
        };
      }

      if (matchRequest.status !== 'pending') {
        return {
          success: false,
          error: 'この申請はキャンセルできません。',
          data: matchRequest,
        };
      }

      // 申請をキャンセルに更新
      matchRequest.status = 'cancelled';
      matchRequest.updated_at = new Date().toISOString();

      // 学生にコインを返金
      const student = mockDb.students.find((s) => s.id === matchRequest.student_id);
      if (student) {
        student.coins += matchRequest.coin_cost;

        // 返金取引記録を追加
        const refundTransaction: CoinTransaction = {
          id: String(uuid.v4()),
          user_id: student.id,
          amount: matchRequest.coin_cost,
          type: 'refund',
          description: `返金: マッチング申請`,
          related_id: matchId,
          status: 'completed',
          created_at: new Date().toISOString(),
        };
        mockDb.coinTransactions.push(refundTransaction);
      }

      const tutor = mockDb.tutors.find((t) => t.id === matchRequest.tutor_id);

      await Promise.all([
        mockNotificationService.createMatchCancellationNotificationForStudent(
          matchRequest.student_id,
          tutor?.name ?? '担当の先輩',
          matchId,
        ),
        ...(tutor
          ? [
              mockNotificationService.createMatchCancellationNotificationForTutor(
                tutor.id,
                student?.name ?? '後輩',
                matchId,
              ),
            ]
          : []),
      ]);

      return {
        success: true,
        data: matchRequest,
      };
    } catch {
      return {
        success: false,
        error: 'マッチング申請のキャンセルに失敗しました。',
        data: {} as MatchRequest,
      };
    }
  }
}
