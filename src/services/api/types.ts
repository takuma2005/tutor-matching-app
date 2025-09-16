// 家庭教師マッチングアプリの共通データ型とインターフェース定義
// モック→Supabase統合への移行を考慮した型設計

// 基本データ型
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'tutor';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Student extends User {
  age: number;
  grade: string;
  subjects_interested: string[];
  learning_goals?: string;
  preferred_schedule?: string;
  coins: number;
  // Additional optional fields used by screens
  interested_subjects?: string[]; // alias
  school?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export interface Tutor extends User {
  hourly_rate: number;
  subjects_taught: string[];
  experience_years: number;
  bio?: string;
  qualifications?: string[];
  availability: TimeSlot[];
  rating: number;
  total_lessons: number;
  // Additional fields used by mock data and screens
  school?: string;
  grade?: string;
  location?: string;
  online_available?: boolean;
}

export interface TimeSlot {
  day_of_week: number; // 0=日曜日, 1=月曜日, ...
  start_time: string; // "09:00"
  end_time: string; // "10:00"
}

export interface Lesson {
  id: string;
  tutor_id: string;
  student_id: string;
  subject: string;
  status:
    | 'pending'
    | 'approved'
    | 'scheduled'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'rejected';
  scheduled_at: string;
  duration_minutes: number;
  coin_cost: number;
  lesson_notes?: string;
  tutor_feedback?: string;
  student_rating?: number;
  escrow_status?: 'none' | 'reserved' | 'escrowed' | 'released' | 'refunded';
  approved_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'spend' | 'refund' | 'matching' | 'lesson_payment' | 'lesson_refund';
  description: string;
  stripe_payment_intent_id?: string;
  related_id?: string; // マッチングID、レッスンIDなど
  status?: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

// マッチング関連の型
export type MatchStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';

export interface MatchRequest {
  id: string;
  student_id: string;
  tutor_id: string;
  message: string;
  schedule_note?: string; // 希望日程の自由記述欄
  status: MatchStatus;
  coin_cost: number;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

// API レスポンス型
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

// 検索・フィルター型
export interface TutorSearchFilters {
  subject?: string;
  min_rating?: number;
  max_hourly_rate?: number;
  experience_years?: number;
  availability_day?: number;
  availability_time?: string;
}

export interface LessonSearchFilters {
  status?: Lesson['status'];
  subject?: string;
  date_from?: string;
  date_to?: string;
}

// APIクライアントインターフェース
export interface AuthService {
  signIn(email: string, password: string): Promise<ApiResponse<User>>;
  signUp(email: string, password: string, userData: Partial<User>): Promise<ApiResponse<User>>;
  signOut(): Promise<ApiResponse<null>>;
  getCurrentUser(): Promise<ApiResponse<User | null>>;
}

export interface StudentService {
  getProfile(userId: string): Promise<ApiResponse<Student>>;
  updateProfile(userId: string, updates: Partial<Student>): Promise<ApiResponse<Student>>;
  searchTutors(
    filters?: TutorSearchFilters,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<Tutor>>;

  // マッチング関連
  sendMatchRequest(
    studentId: string,
    tutorId: string,
    message: string,
    scheduleNote?: string,
  ): Promise<ApiResponse<MatchRequest>>;
  getMatchRequests(studentId: string, status?: MatchStatus): Promise<ApiResponse<MatchRequest[]>>;
  cancelMatchRequest(matchId: string): Promise<ApiResponse<MatchRequest>>;

  bookLesson(
    tutorId: string,
    lessonData: Omit<Lesson, 'id' | 'status' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<Lesson>>;
  getLessons(
    studentId: string,
    filters?: LessonSearchFilters,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<Lesson>>;
  rateLesson(lessonId: string, rating: number): Promise<ApiResponse<Lesson>>;
}

export interface TutorService {
  getProfile(userId: string): Promise<ApiResponse<Tutor>>;
  updateProfile(userId: string, updates: Partial<Tutor>): Promise<ApiResponse<Tutor>>;

  // マッチング関連
  getMatchRequests(status?: MatchStatus): Promise<ApiResponse<MatchRequest[]>>;
  approveMatchRequest(matchId: string): Promise<ApiResponse<MatchRequest>>;
  rejectMatchRequest(matchId: string, reason?: string): Promise<ApiResponse<MatchRequest>>;

  getLessons(
    filters?: LessonSearchFilters,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<Lesson>>;
  updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<ApiResponse<Lesson>>;
  updateAvailability(userId: string, availability: TimeSlot[]): Promise<ApiResponse<Tutor>>;
}

export interface CoinService {
  getBalance(userId: string): Promise<ApiResponse<{ balance: number }>>;
  purchaseCoins(
    userId: string,
    amount: number,
    paymentMethodId: string,
  ): Promise<ApiResponse<CoinTransaction>>;
  getTransactionHistory(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<CoinTransaction>>;
}

// チャット関連の型
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: MessageStatus;
}

export interface ChatModerationReport {
  id: string;
  chatRoomId: string;
  reporterId: string;
  reportedUserId: string;
  reason?: string;
  created_at: string;
}

export interface ChatBlock {
  id: string;
  chatRoomId: string;
  blockerId: string;
  blockedUserId: string;
  created_at: string;
  is_active: boolean;
}

export interface ChatRoom {
  id: string;
  tutorId: string;
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: Message;
  messageCount?: number;
}

export interface ChatService {
  getChatRooms(
    studentId: string,
  ): Promise<ApiResponse<(ChatRoom & { lastMessage?: Message; messageCount?: number })[]>>;
  getMessages(
    chatRoomId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<Message>>;
  sendMessage(chatRoomId: string, senderId: string, text: string): Promise<ApiResponse<Message>>;
  updateMessageStatus(
    messageId: string,
    status: MessageStatus,
    userId?: string,
  ): Promise<ApiResponse<Message>>;
  createChatRoom(tutorId: string, studentId: string): Promise<ApiResponse<ChatRoom>>;
  reportUser(
    chatRoomId: string,
    reporterId: string,
    reportedUserId: string,
    reason?: string,
  ): Promise<ApiResponse<ChatModerationReport>>;
  blockUser(
    chatRoomId: string,
    blockerId: string,
    blockedUserId: string,
  ): Promise<ApiResponse<ChatBlock>>;
  getModerationStatus(
    chatRoomId: string,
    userId: string,
  ): Promise<ApiResponse<{ blockedUsers: string[]; blockedByOtherUserId: string | null }>>;
}

// リアルタイム通知型
export interface NotificationPayload {
  type: 'lesson_booked' | 'lesson_cancelled' | 'lesson_completed' | 'payment_success';
  message: string;
  data: unknown;
  created_at: string;
}

export interface RealtimeService {
  subscribeToUserNotifications(
    userId: string,
    callback: (payload: NotificationPayload) => void,
  ): () => void;
  subscribeLessonUpdates(lessonId: string, callback: (lesson: Lesson) => void): () => void;
}
