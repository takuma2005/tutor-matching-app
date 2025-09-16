// 生徒向けサービスのモック実装

import {
  StudentService,
  Student,
  Tutor,
  Lesson,
  CoinTransaction,
  ApiResponse,
  PaginatedResponse,
  TutorSearchFilters,
  LessonSearchFilters,
  MatchRequest,
  MatchStatus,
} from '../types';
import { mockDb, delay, generateId, getCurrentTimestamp } from './data';
import { MockMatchingService } from './matchingService';

class MockStudentService implements StudentService {
  private students: Student[] = mockDb.students;
  private tutors: Tutor[] = mockDb.tutors;
  private lessons: Lesson[] = mockDb.lessons;
  private matchingService = new MockMatchingService();

  async getProfile(userId: string): Promise<ApiResponse<Student>> {
    await delay(300);

    const student = this.students.find((s) => s.id === userId);

    if (!student) {
      return {
        data: null as unknown as Student,
        success: false,
        error: '生徒のプロフィールが見つかりません',
      };
    }

    return {
      data: student,
      success: true,
    };
  }

  async updateProfile(userId: string, updates: Partial<Student>): Promise<ApiResponse<Student>> {
    await delay(500);

    const studentIndex = this.students.findIndex((s) => s.id === userId);

    if (studentIndex === -1) {
      return {
        data: null as unknown as Student,
        success: false,
        error: '生徒のプロフィールが見つかりません',
      };
    }

    const updatedStudent = {
      ...this.students[studentIndex],
      ...updates,
      updated_at: getCurrentTimestamp(),
    };

    this.students[studentIndex] = updatedStudent;

    return {
      data: updatedStudent,
      success: true,
    };
  }

  async searchTutors(
    filters?: TutorSearchFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Tutor>> {
    await delay(400);

    let filteredTutors = [...this.tutors];

    // フィルタリング適用
    if (filters) {
      if (filters.subject) {
        filteredTutors = filteredTutors.filter((tutor) =>
          tutor.subjects_taught.some((subject) =>
            subject.toLowerCase().includes(filters.subject!.toLowerCase()),
          ),
        );
      }

      if (filters.min_rating) {
        filteredTutors = filteredTutors.filter((tutor) => tutor.rating >= filters.min_rating!);
      }

      if (filters.max_hourly_rate) {
        filteredTutors = filteredTutors.filter(
          (tutor) => tutor.hourly_rate <= filters.max_hourly_rate!,
        );
      }

      if (filters.experience_years) {
        filteredTutors = filteredTutors.filter(
          (tutor) => tutor.experience_years >= filters.experience_years!,
        );
      }

      if (filters.availability_day !== undefined) {
        filteredTutors = filteredTutors.filter((tutor) =>
          tutor.availability.some((slot) => slot.day_of_week === filters.availability_day),
        );
      }
    }

    // ページネーション
    const total = filteredTutors.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTutors = filteredTutors.slice(startIndex, endIndex);

    return {
      data: paginatedTutors,
      success: true,
      pagination: {
        page,
        limit,
        total,
        has_more: endIndex < total,
      },
    };
  }

  async bookLesson(
    tutorId: string,
    lessonData: Omit<Lesson, 'id' | 'status' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<Lesson>> {
    await delay(600);

    // 家庭教師の存在確認
    const tutor = this.tutors.find((t) => t.id === tutorId);
    if (!tutor) {
      return {
        data: null as unknown as Lesson,
        success: false,
        error: '指定された家庭教師が見つかりません',
      };
    }

    // 生徒のコイン残高確認
    const student = this.students.find((s) => s.id === lessonData.student_id);
    if (!student) {
      return {
        data: null as unknown as Lesson,
        success: false,
        error: '生徒のプロフィールが見つかりません',
      };
    }

    if (student.coins < lessonData.coin_cost) {
      return {
        data: null as unknown as Lesson,
        success: false,
        error: 'コインが不足しています',
      };
    }

    // レッスンを作成（申請: pending、仮押さえ: reserved）
    const newLesson: Lesson = {
      ...lessonData,
      id: `lesson-${generateId()}`,
      status: 'pending',
      escrow_status: 'reserved',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    };

    this.lessons.push(newLesson);

    // 生徒のコインを仮押さえ（残高から差し引き）
    const studentIndex = this.students.findIndex((s) => s.id === lessonData.student_id);
    this.students[studentIndex].coins -= lessonData.coin_cost;

    // 取引台帳に pending を記録（related_id=lessonId）
    const reserveTx: CoinTransaction = {
      id: `tx-${generateId()}`,
      user_id: student.id,
      amount: -lessonData.coin_cost,
      type: 'lesson_payment',
      description: `授業仮押さえ: ${lessonData.subject}`,
      related_id: newLesson.id,
      status: 'pending',
      created_at: getCurrentTimestamp(),
    };
    mockDb.coinTransactions.push(reserveTx);

    return {
      data: newLesson,
      success: true,
    };
  }

  async getLessons(
    studentId: string,
    filters: LessonSearchFilters = {},
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Lesson>> {
    await delay(350);

    let filteredLessons = this.lessons.filter((lesson) => lesson.student_id === studentId);

    // フィルタリング適用
    if (filters.status) {
      filteredLessons = filteredLessons.filter((lesson) => lesson.status === filters.status);
    }

    if (filters.subject) {
      filteredLessons = filteredLessons.filter((lesson) =>
        lesson.subject.toLowerCase().includes(filters.subject!.toLowerCase()),
      );
    }

    if (filters.date_from) {
      const fromDate = new Date(filters.date_from);
      filteredLessons = filteredLessons.filter(
        (lesson) => new Date(lesson.scheduled_at) >= fromDate,
      );
    }

    if (filters.date_to) {
      const toDate = new Date(filters.date_to);
      filteredLessons = filteredLessons.filter((lesson) => new Date(lesson.scheduled_at) <= toDate);
    }

    // 日時順でソート（新しい順）
    filteredLessons.sort(
      (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
    );

    // ページネーション
    const total = filteredLessons.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLessons = filteredLessons.slice(startIndex, endIndex);

    return {
      data: paginatedLessons,
      success: true,
      pagination: {
        page,
        limit,
        total,
        has_more: endIndex < total,
      },
    };
  }

  async rateLesson(lessonId: string, rating: number): Promise<ApiResponse<Lesson>> {
    await delay(400);

    if (rating < 1 || rating > 5) {
      return {
        data: null as unknown as Lesson,
        success: false,
        error: '評価は1から5の間で入力してください',
      };
    }

    const lessonIndex = this.lessons.findIndex((l) => l.id === lessonId);

    if (lessonIndex === -1) {
      return {
        data: null as unknown as Lesson,
        success: false,
        error: 'レッスンが見つかりません',
      };
    }

    if (this.lessons[lessonIndex].status !== 'completed') {
      return {
        data: null as unknown as Lesson,
        success: false,
        error: '完了したレッスンのみ評価できます',
      };
    }

    // レッスンに評価を追加
    this.lessons[lessonIndex].student_rating = rating;
    this.lessons[lessonIndex].updated_at = getCurrentTimestamp();

    // 家庭教師の平均評価を更新（簡易実装）
    const tutorId = this.lessons[lessonIndex].tutor_id;
    const tutorLessons = this.lessons.filter(
      (l) => l.tutor_id === tutorId && l.status === 'completed' && l.student_rating !== undefined,
    );

    if (tutorLessons.length > 0) {
      const avgRating =
        tutorLessons.reduce((sum, lesson) => sum + (lesson.student_rating || 0), 0) /
        tutorLessons.length;

      const tutorIndex = this.tutors.findIndex((t) => t.id === tutorId);
      if (tutorIndex !== -1) {
        this.tutors[tutorIndex].rating = Math.round(avgRating * 10) / 10;
        this.tutors[tutorIndex].updated_at = getCurrentTimestamp();
      }
    }

    return {
      data: this.lessons[lessonIndex],
      success: true,
    };
  }

  // マッチング関連メソッド
  async sendMatchRequest(
    studentId: string,
    tutorId: string,
    message: string,
    scheduleNote?: string,
  ): Promise<ApiResponse<MatchRequest>> {
    return this.matchingService.sendMatchRequest(studentId, tutorId, message, scheduleNote);
  }

  async getMatchRequests(
    studentId: string,
    status?: MatchStatus,
  ): Promise<ApiResponse<MatchRequest[]>> {
    return this.matchingService.getStudentMatchRequests(studentId, status);
  }

  async cancelMatchRequest(matchId: string): Promise<ApiResponse<MatchRequest>> {
    return this.matchingService.cancelMatchRequest(matchId);
  }
}

export const mockStudentService = new MockStudentService();
export default MockStudentService;
