import { mockDb, mockChatService, mockCoinService, mockStudentService } from '@/services/api/mock';
import type { Lesson, Student, CoinTransaction } from '@/services/api/types';

const createTestStudent = (id: string, coins = 0): Student => ({
  id,
  name: `Test ${id}`,
  email: `${id}@example.com`,
  role: 'student',
  age: 16,
  grade: '',
  subjects_interested: [],
  coins,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

describe('Mock services user isolation', () => {
  describe('student.getLessons', () => {
    const originalLessonsLength = mockDb.lessons.length;

    afterEach(() => {
      mockDb.lessons.splice(originalLessonsLength);
    });

    it('returns lessons only for the requested student', async () => {
      const studentA = 'student-test-a';
      const studentB = 'student-test-b';
      const baseTime = Date.now();
      const lessonTemplate = {
        tutor_id: '1',
        subject: '数学',
        status: 'scheduled' as const,
        scheduled_at: new Date().toISOString(),
        duration_minutes: 60,
        coin_cost: 120,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDb.lessons.push({
        id: `lesson-${baseTime}`,
        student_id: studentA,
        lesson_notes: 'A',
        ...lessonTemplate,
      } as Lesson);
      mockDb.lessons.push({
        id: `lesson-${baseTime + 1}`,
        student_id: studentB,
        lesson_notes: 'B',
        ...lessonTemplate,
      } as Lesson);

      const resA = await mockStudentService.getLessons(studentA);
      expect(resA.success).toBe(true);
      expect(resA.data).toHaveLength(1);
      expect(resA.data[0].student_id).toBe(studentA);

      const resB = await mockStudentService.getLessons(studentB);
      expect(resB.success).toBe(true);
      expect(resB.data).toHaveLength(1);
      expect(resB.data[0].student_id).toBe(studentB);
    });
  });

  describe('coin service', () => {
    const originalStudentLength = mockDb.students.length;
    const originalTransactionsLength = mockDb.coinTransactions.length;

    afterEach(() => {
      mockDb.students.splice(originalStudentLength);
      mockDb.coinTransactions.splice(originalTransactionsLength);
    });

    it('filters balances and history per user', async () => {
      const studentId = 'student-coins';
      const otherId = 'student-coins-other';
      mockDb.students.push(createTestStudent(studentId, 50));
      mockDb.students.push(createTestStudent(otherId, 90));

      const baseTime = Date.now();
      const txA: CoinTransaction = {
        id: `tx-${baseTime}`,
        user_id: studentId,
        amount: 30,
        type: 'purchase',
        description: 'Top up',
        created_at: new Date().toISOString(),
      };
      const txB: CoinTransaction = {
        id: `tx-${baseTime + 1}`,
        user_id: otherId,
        amount: 45,
        type: 'purchase',
        description: 'Other user top up',
        created_at: new Date().toISOString(),
      };

      mockDb.coinTransactions.push(txA, txB);

      const balanceA = await mockCoinService.getBalance(studentId);
      expect(balanceA.success).toBe(true);
      expect(balanceA.data.balance).toBe(50);

      const historyA = await mockCoinService.getTransactionHistory(studentId);
      expect(historyA.success).toBe(true);
      expect(historyA.data).toHaveLength(1);
      expect(historyA.data[0].user_id).toBe(studentId);
    });
  });

  describe('chat service', () => {
    const originalStudentsLength = mockDb.students.length;

    afterEach(() => {
      mockDb.students.splice(originalStudentsLength);
    });

    it('returns chat rooms only for existing student id and honours message updates', async () => {
      const defaultStudentId = mockDb.students[0]?.id ?? 'student-1';
      const rooms = await mockChatService.getChatRooms(defaultStudentId);
      expect(rooms.success).toBe(true);
      expect(rooms.data.every((room) => room.studentId === defaultStudentId)).toBe(true);

      const otherId = 'student-chat-isolation';
      mockDb.students.push(createTestStudent(otherId));
      const otherRooms = await mockChatService.getChatRooms(otherId);
      expect(otherRooms.success).toBe(true);
      expect(otherRooms.data).toHaveLength(0);

      const messagesResp = await mockChatService.getMessages(rooms.data[0].id, 1, 10);
      expect(messagesResp.success).toBe(true);
      const messageId = messagesResp.data[0]?.id;
      expect(messageId).toBeTruthy();

      if (messageId) {
        const updateResp = await mockChatService.updateMessageStatus(
          messageId,
          'read',
          defaultStudentId,
        );
        expect(updateResp.success).toBe(true);
        expect(updateResp.data.status).toBe('read');
      }
    });
  });
});
