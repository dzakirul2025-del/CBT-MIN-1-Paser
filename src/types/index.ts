/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'super_admin' | 'admin_madrasah' | 'guru' | 'pengawas' | 'siswa';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  avatar?: string;
  nip_nisn?: string;
  class_id?: string;
  className?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SchoolSettings {
  id: string;
  name: string;
  subname: string;
  npsn: string;
  nsm: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  headmasterName: string;
  headmasterNip: string;
  logoUrl: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  themeColor: string;
  accentColor: string;
}

export interface AcademicYear {
  id: string;
  year: string; // e.g. "2024/2025"
  semester: 'Ganjil' | 'Genap';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "Kelas 1A", "Kelas 6B"
  level: number; // 1 to 6
  academicYearId: string;
  homeroomTeacherId?: string;
  homeroomTeacherName?: string;
  studentCount?: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: 'Pendidikan Agama Islam' | 'Umum' | 'Muatan Lokal';
  levelMin: number;
  levelMax: number;
  kktpDefault: number;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  gender: 'L' | 'P';
  email: string;
  phone: string;
  subjectIds: string[];
  subjectNames?: string[];
  status: 'PNS' | 'PPPK' | 'Non-PNS';
  isHomeroom?: boolean;
}

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  className?: string;
  birthPlace: string;
  birthDate: string;
  parentName: string;
  parentPhone: string;
  status: 'Aktif' | 'Mutasi' | 'Lulus';
}

export type QuestionType =
  | 'pilihan_ganda'
  | 'pilihan_ganda_kompleks'
  | 'benar_salah'
  | 'menjodohkan'
  | 'isian_singkat'
  | 'esai';

export type CognitiveLevel = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6';
export type Difficulty = 'Mudah' | 'Sedang' | 'Sukar';

export interface QuestionOption {
  id: string;
  key: string; // 'A', 'B', 'C', 'D' or pairing key
  text: string;
  imageUrl?: string;
  isCorrect?: boolean;
  matchTarget?: string; // for menjodohkan
}

export interface Question {
  id: string;
  bankId: string;
  type: QuestionType;
  prompt: string; // Markdown / LaTeX / Text
  stimulus?: string; // Cerita, tabel, wacana
  imageUrl?: string;
  audioUrl?: string;
  tableData?: string[][];
  options?: QuestionOption[];
  correctAnswer: string | string[] | Record<string, string>; // varies by type
  explanation?: string;
  cognitiveLevel: CognitiveLevel;
  difficulty: Difficulty;
  weight: number;
  topic: string;
  indicator?: string;
  learningObjective?: string;
  isValidated: boolean;
  createdAt: string;
}

export interface QuestionBank {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  gradeLevel: number; // 1-6
  authorId: string;
  authorName: string;
  academicYearId: string;
  totalQuestions: number;
  createdAt: string;
  description?: string;
}

export type AssessmentType =
  | 'Asesmen Harian'
  | 'Sumatif Lingkup Materi'
  | 'Sumatif Tengah Semester'
  | 'Sumatif Akhir Semester'
  | 'Ujian Madrasah'
  | 'Try Out'
  | 'Ujian Praktik';

export interface ExamPackage {
  id: string;
  title: string;
  assessmentType: AssessmentType;
  subjectId: string;
  subjectName: string;
  gradeLevel: number;
  targetClassIds: string[];
  targetClassNames?: string[];
  authorTeacherId: string;
  authorName: string;
  proctorTeacherId?: string;
  proctorName?: string;
  startDate: string;
  endDate: string;
  startTime: string; // "07:30"
  endTime: string; // "09:30"
  durationMinutes: number;
  token: string;
  kktp: number;
  totalQuestions: number;
  totalScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowReviewAfterExam: boolean;
  maxAttempts: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'archived';
  questionIds: string[];
  createdAt: string;
}

export type SessionStatus = 'not_started' | 'working' | 'submitted' | 'interrupted' | 'blocked';

export interface StudentExamSession {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  className: string;
  startTime?: string;
  endTime?: string;
  remainingSeconds: number;
  status: SessionStatus;
  answeredCount: number;
  flaggedCount: number;
  ipAddress?: string;
  deviceInfo?: string;
  lastHeartbeat: string;
  tabSwitchCount: number;
  extraTimeGrantedMinutes: number;
  answers: Record<string, any>; // questionId -> answer
  flaggedQuestionIds: string[];
  proctorNotes?: string;
  score?: number;
  passed?: boolean;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  className: string;
  totalScore: number;
  maxScore: number;
  finalGrade: number; // 0-100
  kktp: number;
  isPassed: boolean;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  unansweredCount: number;
  essayPendingGrading: boolean;
  scoreBreakdown: {
    pilihanGandaScore: number;
    kompleksScore: number;
    benarSalahScore: number;
    menjodohkanScore: number;
    isianScore: number;
    esaiScore: number;
  };
  teacherNotes?: string;
  submittedAt: string;
}

export interface ItemAnalysisData {
  questionId: string;
  questionNumber: number;
  type: QuestionType;
  prompt: string;
  difficultyIndex: number; // P: 0.0 - 1.0
  difficultyCategory: 'Sukar' | 'Sedang' | 'Mudah';
  discriminationIndex: number; // D: -1.0 to 1.0
  discriminationCategory: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Jelek / Ditolak';
  distractorEfficiency: {
    optionKey: string;
    chosenPercentage: number;
    isKey: boolean;
    isEffective: boolean;
  }[];
  recommendation: 'Diterima' | 'Revisi' | 'Dibuang';
}

export interface AIGenerationLog {
  id: string;
  promptParams: {
    subject: string;
    gradeLevel: number;
    topic: string;
    learningObjective: string;
    indicator: string;
    count: number;
    questionTypes: QuestionType[];
    difficulty: Difficulty;
    cognitiveLevel: CognitiveLevel;
    includeStimulus: boolean;
  };
  generatedCount: number;
  status: 'draft' | 'approved' | 'partially_saved' | 'rejected';
  createdAt: string;
  generatedQuestions: Question[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}
