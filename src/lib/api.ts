/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

async function safeJson(res: Response, fallback: any = null) {
  if (!res.ok) return fallback;
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return fallback;
  }
  try {
    return await res.json();
  } catch (e) {
    return fallback;
  }
}

// Client-side API service connecting to full-stack Express server
export const api = {
  async getBootstrap() {
    try {
      const res = await fetch('/api/bootstrap');
      return await safeJson(res, null);
    } catch (e) {
      return null;
    }
  },

  async login(username: string, password?: string, role?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });
    if (!res.ok) {
      const err = await safeJson(res, {});
      throw new Error(err?.error || 'Login gagal atau server belum siap');
    }
    return res.json();
  },

  // School Settings
  async getSchoolSettings() {
    const res = await fetch('/api/school-settings');
    return res.json();
  },
  async updateSchoolSettings(data: any) {
    const res = await fetch('/api/school-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Academic Years
  async getAcademicYears() {
    const res = await fetch('/api/academic-years');
    return res.json();
  },
  async saveAcademicYear(data: any) {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/academic-years/${data.id}` : '/api/academic-years';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Classes
  async getClasses() {
    const res = await fetch('/api/classes');
    return res.json();
  },
  async saveClass(data: any) {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/classes/${data.id}` : '/api/classes';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteClass(id: string) {
    const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Subjects
  async getSubjects() {
    const res = await fetch('/api/subjects');
    return res.json();
  },
  async saveSubject(data: any) {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/subjects/${data.id}` : '/api/subjects';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteSubject(id: string) {
    const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Teachers
  async getTeachers() {
    const res = await fetch('/api/teachers');
    return res.json();
  },
  async saveTeacher(data: any) {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/teachers/${data.id}` : '/api/teachers';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteTeacher(id: string) {
    const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Students
  async getStudents() {
    const res = await fetch('/api/students');
    return res.json();
  },
  async saveStudent(data: any) {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/students/${data.id}` : '/api/students';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteStudent(id: string) {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    return res.json();
  },
  async importStudents(students: any[]) {
    const res = await fetch('/api/students/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students })
    });
    return res.json();
  },

  // Users
  async getUsers() {
    const res = await fetch('/api/users');
    return res.json();
  },
  async saveUser(data: any) {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/users/${data.id}` : '/api/users';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteUser(id: string) {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Question Banks & Questions
  async getQuestionBanks() {
    const res = await fetch('/api/question-banks');
    return res.json();
  },
  async saveQuestionBank(data: any) {
    const res = await fetch('/api/question-banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteQuestionBank(id: string) {
    const res = await fetch(`/api/question-banks/${id}`, { method: 'DELETE' });
    return res.json();
  },
  async getQuestions(bankId?: string) {
    const url = bankId ? `/api/questions?bankId=${bankId}` : '/api/questions';
    const res = await fetch(url);
    return res.json();
  },
  async saveQuestion(data: any) {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/questions/${data.id}` : '/api/questions';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteQuestion(id: string) {
    const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // AI Generator
  async generateQuestionsAI(params: any) {
    const res = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memanggil generator AI');
    }
    return res.json();
  },
  async getAIHistory() {
    const res = await fetch('/api/ai/history');
    return res.json();
  },

  // Exams
  async getExams() {
    const res = await fetch('/api/exams');
    return res.json();
  },
  async saveExam(data: any) {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/exams/${data.id}` : '/api/exams';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteExam(id: string) {
    const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // CBT Student Exam Session
  async startStudentSession(examId: string, studentId: string, token: string) {
    const res = await fetch('/api/exams/start-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId, studentId, token })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memulai ujian');
    }
    return res.json();
  },
  async saveStudentAnswer(sessionId: string, questionId: string, answer: any, isDoubt?: boolean, remainingSeconds?: number) {
    const res = await fetch('/api/exams/save-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, questionId, answer, isDoubt, remainingSeconds })
    });
    return res.json();
  },
  async logExamIncident(sessionId: string, incidentType: string, details?: string) {
    const res = await fetch('/api/exams/log-incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, incidentType, details })
    });
    return res.json();
  },
  async submitStudentExam(sessionId: string) {
    const res = await fetch('/api/exams/submit-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal mengirim ujian');
    }
    return res.json();
  },

  // Proctor Live Monitoring
  async getLiveProctorData(examId: string) {
    const res = await fetch(`/api/exams/${examId}/live-monitoring`);
    return res.json();
  },
  async grantExtraTime(sessionId: string, extraMinutes: number) {
    const res = await fetch('/api/proctor/grant-extra-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, extraMinutes })
    });
    return res.json();
  },
  async resetStudentLogin(sessionId: string) {
    const res = await fetch('/api/proctor/reset-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    return res.json();
  },
  async terminateSession(sessionId: string, reason?: string) {
    const res = await fetch('/api/proctor/terminate-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, reason })
    });
    return res.json();
  },

  // Results & Essay Scoring
  async getResults(examId?: string, studentId?: string) {
    const query = new URLSearchParams();
    if (examId) query.append('examId', examId);
    if (studentId) query.append('studentId', studentId);
    const res = await fetch(`/api/results?${query.toString()}`);
    return res.json();
  },
  async gradeEssay(resultId: string, essayScore: number, teacherNotes?: string) {
    const res = await fetch('/api/results/grade-essay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId, essayScore, teacherNotes })
    });
    return res.json();
  },

  // Item Analysis
  async getItemAnalysis(examId: string) {
    const res = await fetch(`/api/item-analysis/${examId}`);
    return res.json();
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await fetch('/api/audit-logs');
    return res.json();
  },

  // Supabase SQL
  async getMigrationSql() {
    const res = await fetch('/api/migration-sql');
    return res.text();
  }
};
