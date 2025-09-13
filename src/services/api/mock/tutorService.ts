// 先輩（Tutor）向けサービスのモック実装

import {
  TutorService,
  Tutor,
  Lesson,
  ApiResponse,
  PaginatedResponse,
  LessonSearchFilters,
  MatchRequest,
  MatchStatus,
  TimeSlot,
} from '../types';
import { mockAuthService } from './authService';
import { mockDb, delay, getCurrentTimestamp } from './data';
import { MockMatchingService } from './matchingService';

import { COIN_CONSTANTS } from '@/constants/coinPlans';

class MockTutorService implements TutorService {
  private tutors: Tutor[] = mockDb.tutors;
  private lessons: Lesson[] = mockDb.lessons;
  private matchingService = new MockMatchingService();

  // ユーティリティ: 現在ログイン中の先輩IDを取得
  private async getCurrentTutorId(): Promise<string> {
    const res = await mockAuthService.getCurrentUser();
    const user = res.data;
    if (!user) throw new Error('未ログインです');
    // tutors に存在確認
    const tutor = this.tutors.find((t) => t.id === user.id);
    if (!tutor) throw new Error('先輩アカウントが見つかりません');
    return tutor.id;
  }

  async getProfile(userId: string): Promise<ApiResponse<Tutor>> {
    await delay(300);

    const tutor = this.tutors.find((t) => t.id === userId);
    if (!tutor) {
      return {
        data: null as unknown as Tutor,
        success: false,
        error: '先輩のプロフィールが見つかりません',
      };
    }

    return { success: true, data: tutor };
  }

  async updateProfile(userId: string, updates: Partial<Tutor>): Promise<ApiResponse<Tutor>> {
    await delay(400);

    const idx = this.tutors.findIndex((t) => t.id === userId);
    if (idx === -1) {
      return {
        data: null as unknown as Tutor,
        success: false,
        error: '先輩のプロフィールが見つかりません',
      };
    }

    // 最低料金のサーバ側バリデーション
    if (
      typeof updates.hourly_rate === 'number' &&
      updates.hourly_rate < COIN_CONSTANTS.MIN_HOURLY_RATE
    ) {
      return {
        data: null as unknown as Tutor,
        success: false,
        error: `最低料金は ${COIN_CONSTANTS.MIN_HOURLY_RATE} コイン/時です`,
      };
    }

    const updated: Tutor = {
      ...this.tutors[idx],
      ...updates,
      updated_at: getCurrentTimestamp(),
    };

    this.tutors[idx] = updated;
    return { success: true, data: updated };
  }

  // マッチング申請一覧（先輩側）
  async getMatchRequests(status?: MatchStatus): Promise<ApiResponse<MatchRequest[]>> {
    await delay(250);
    try {
      const tutorId = await this.getCurrentTutorId();
      return await this.matchingService.getTutorMatchRequests(tutorId, status);
    } catch (e) {
      return { success: false, error: (e as Error).message, data: [] };
    }
  }

  async approveMatchRequest(matchId: string): Promise<ApiResponse<MatchRequest>> {
    return this.matchingService.approveMatchRequest(matchId);
  }

  async rejectMatchRequest(matchId: string, reason?: string): Promise<ApiResponse<MatchRequest>> {
    return this.matchingService.rejectMatchRequest(matchId, reason);
  }

  // レッスン一覧（先輩側）
  async getLessons(
    filters?: LessonSearchFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Lesson>> {
    await delay(300);

    let tutorLessons = [...this.lessons];

    try {
      const tutorId = await this.getCurrentTutorId();
      tutorLessons = tutorLessons.filter((l) => l.tutor_id === tutorId);
    } catch (_) {
      // 未ログイン等の場合は空
      tutorLessons = [];
    }

    if (filters) {
      if (filters.status) {
        tutorLessons = tutorLessons.filter((l) => l.status === filters.status);
      }
      if (filters.subject) {
        tutorLessons = tutorLessons.filter((l) =>
          l.subject.toLowerCase().includes(filters.subject!.toLowerCase()),
        );
      }
      if (filters.date_from) {
        const from = new Date(filters.date_from);
        tutorLessons = tutorLessons.filter((l) => new Date(l.scheduled_at) >= from);
      }
      if (filters.date_to) {
        const to = new Date(filters.date_to);
        tutorLessons = tutorLessons.filter((l) => new Date(l.scheduled_at) <= to);
      }
    }

    // 日時降順
    tutorLessons.sort(
      (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
    );

    // ページネーション
    const total = tutorLessons.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const slice = tutorLessons.slice(start, end);

    return {
      success: true,
      data: slice,
      pagination: { page, limit, total, has_more: end < total },
    };
  }

  async updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
    await delay(300);

    const idx = this.lessons.findIndex((l) => l.id === lessonId);
    if (idx === -1) return { success: false, error: '授業が見つかりません', data: {} as Lesson };

    // 所有チェック（先輩）
    try {
      const tutorId = await this.getCurrentTutorId();
      if (this.lessons[idx].tutor_id !== tutorId) {
        return {
          success: false,
          error: 'この授業を更新する権限がありません',
          data: this.lessons[idx],
        };
      }
    } catch (e) {
      return { success: false, error: (e as Error).message, data: {} as Lesson };
    }

    const updated: Lesson = { ...this.lessons[idx], ...updates, updated_at: getCurrentTimestamp() };
    this.lessons[idx] = updated;
    return { success: true, data: updated };
  }

  async updateAvailability(userId: string, availability: TimeSlot[]): Promise<ApiResponse<Tutor>> {
    await delay(200);
    const idx = this.tutors.findIndex((t) => t.id === userId);
    if (idx === -1) return { success: false, error: '先輩が見つかりません', data: {} as Tutor };

    this.tutors[idx] = { ...this.tutors[idx], availability, updated_at: getCurrentTimestamp() };
    return { success: true, data: this.tutors[idx] };
  }
}

export const mockTutorService = new MockTutorService();
export default MockTutorService;
