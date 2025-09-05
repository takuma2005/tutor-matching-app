export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tutor extends User {
  subjects: Subject[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  bio: string;
  experience: number; // years
  education: string;
  certifications: string[];
  availability: TimeSlot[];
  isVerified: boolean;
}

export interface Student extends User {
  grade?: string;
  learningGoals: string[];
  preferredSubjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  category: string;
}

export interface TimeSlot {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string;
  isAvailable: boolean;
}

export interface TutoringSession {
  id: string;
  tutorId: string;
  studentId: string;
  subjectId: string;
  scheduledAt: Date;
  duration: number; // minutes
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
  location?: string;
  isOnline: boolean;
  meetingLink?: string;
  notes?: string;
}

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export interface MatchRequest {
  id: string;
  studentId: string;
  subjectId: string;
  preferredSchedule: TimeSlot[];
  budgetRange: {
    min: number;
    max: number;
  };
  learningGoals: string;
  preferredLocation?: string;
  isOnlineOnly: boolean;
  status: 'pending' | 'matched' | 'cancelled';
  createdAt: Date;
}
