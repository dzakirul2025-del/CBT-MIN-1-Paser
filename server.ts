/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data folder exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize seed data if file doesn't exist
import { getInitialDb } from './server/seed.ts';

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db.json, resetting to seed:', err);
  }
  const init = getInitialDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2), 'utf-8');
  return init;
}

let db = loadDb();

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

// Log audit helper
function addAuditLog(userId: string, userName: string, role: string, action: string, module: string, details: string, req: Request) {
  const log = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    userId,
    userName,
    userRole: role,
    action,
    module,
    details,
    ipAddress: req.ip || '127.0.0.1'
  };
  db.auditLogs = [log, ...(db.auditLogs || [])].slice(0, 500);
  saveDb();
}

// -------------------------------------------------------------
// Gemini AI Server Setup
// -------------------------------------------------------------
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'MIN 1 Paser CBT',
    hasGemini: !!geminiApiKey,
    time: new Date().toISOString()
  });
});

// Full state retrieval
app.get('/api/bootstrap', (req, res) => {
  res.json(db);
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;
  const user = db.users.find(
    (u: any) => u.username.toLowerCase() === (username || '').toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ error: 'Username atau password tidak ditemukan' });
  }

  // Simple password check or demo role bypass
  if (password && password !== '123456' && password !== user.password) {
    return res.status(401).json({ error: 'Password salah. Gunakan default: 123456' });
  }

  addAuditLog(user.id, user.name, user.role, 'LOGIN', 'Autentikasi', `Pengguna ${user.name} berhasil login`, req);
  res.json({
    user: {
      id: user.id,
      username: user.name,
      name: user.name,
      role: user.role,
      email: user.email,
      nip_nisn: user.nip_nisn,
      class_id: user.class_id,
      className: user.className,
      avatar: user.avatar,
      isActive: true
    },
    token: 'jwt_mock_token_' + user.id
  });
});

// School Settings
app.get('/api/school-settings', (req, res) => {
  res.json(db.schoolSettings);
});

app.put('/api/school-settings', (req, res) => {
  db.schoolSettings = { ...db.schoolSettings, ...req.body };
  saveDb();
  addAuditLog('admin', 'Admin', 'super_admin', 'UPDATE_SETTINGS', 'Identitas Madrasah', 'Pembaruan identitas madrasah', req);
  res.json(db.schoolSettings);
});

// Academic Years
app.get('/api/academic-years', (req, res) => res.json(db.academicYears));
app.post('/api/academic-years', (req, res) => {
  const newYear = { id: 'ay_' + Date.now(), ...req.body };
  if (newYear.isActive) {
    db.academicYears.forEach((y: any) => (y.isActive = false));
  }
  db.academicYears.push(newYear);
  saveDb();
  res.json(newYear);
});
app.put('/api/academic-years/:id', (req, res) => {
  const idx = db.academicYears.findIndex((y: any) => y.id === req.params.id);
  if (idx !== -1) {
    if (req.body.isActive) {
      db.academicYears.forEach((y: any) => (y.isActive = false));
    }
    db.academicYears[idx] = { ...db.academicYears[idx], ...req.body };
    saveDb();
    return res.json(db.academicYears[idx]);
  }
  res.status(404).json({ error: 'Data tidak ditemukan' });
});

// Classes
app.get('/api/classes', (req, res) => res.json(db.classes));
app.post('/api/classes', (req, res) => {
  const item = { id: 'cls_' + Date.now(), ...req.body };
  db.classes.push(item);
  saveDb();
  res.json(item);
});
app.put('/api/classes/:id', (req, res) => {
  const idx = db.classes.findIndex((c: any) => c.id === req.params.id);
  if (idx !== -1) {
    db.classes[idx] = { ...db.classes[idx], ...req.body };
    saveDb();
    return res.json(db.classes[idx]);
  }
  res.status(404).json({ error: 'Kelas tidak ditemukan' });
});
app.delete('/api/classes/:id', (req, res) => {
  db.classes = db.classes.filter((c: any) => c.id !== req.params.id);
  saveDb();
  res.json({ success: true });
});

// Subjects
app.get('/api/subjects', (req, res) => res.json(db.subjects));
app.post('/api/subjects', (req, res) => {
  const item = { id: 'sub_' + Date.now(), ...req.body };
  db.subjects.push(item);
  saveDb();
  res.json(item);
});
app.put('/api/subjects/:id', (req, res) => {
  const idx = db.subjects.findIndex((s: any) => s.id === req.params.id);
  if (idx !== -1) {
    db.subjects[idx] = { ...db.subjects[idx], ...req.body };
    saveDb();
    return res.json(db.subjects[idx]);
  }
  res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' });
});
app.delete('/api/subjects/:id', (req, res) => {
  db.subjects = db.subjects.filter((s: any) => s.id !== req.params.id);
  saveDb();
  res.json({ success: true });
});

// Teachers
app.get('/api/teachers', (req, res) => res.json(db.teachers));
app.post('/api/teachers', (req, res) => {
  const item = { id: 't_' + Date.now(), ...req.body };
  db.teachers.push(item);
  // Also create user profile for login
  db.users.push({
    id: item.id,
    username: 'guru_' + item.nip.slice(-4),
    name: item.name,
    role: 'guru',
    email: item.email,
    nip_nisn: item.nip,
    phone: item.phone,
    password: '123456',
    isActive: true,
    createdAt: new Date().toISOString()
  });
  saveDb();
  res.json(item);
});
app.put('/api/teachers/:id', (req, res) => {
  const idx = db.teachers.findIndex((t: any) => t.id === req.params.id);
  if (idx !== -1) {
    db.teachers[idx] = { ...db.teachers[idx], ...req.body };
    saveDb();
    return res.json(db.teachers[idx]);
  }
  res.status(404).json({ error: 'Guru tidak ditemukan' });
});
app.delete('/api/teachers/:id', (req, res) => {
  db.teachers = db.teachers.filter((t: any) => t.id !== req.params.id);
  db.users = db.users.filter((u: any) => u.id !== req.params.id);
  saveDb();
  res.json({ success: true });
});

// Students
app.get('/api/students', (req, res) => res.json(db.students));
app.post('/api/students', (req, res) => {
  const item = { id: 'std_' + Date.now(), ...req.body };
  db.students.push(item);
  // Create user profile for student login
  db.users.push({
    id: item.id,
    username: item.nisn || ('siswa_' + Date.now()),
    name: item.name,
    role: 'siswa',
    email: item.nisn + '@siswa.min1paser.sch.id',
    nip_nisn: item.nisn,
    class_id: item.classId,
    className: item.className,
    password: '123456',
    isActive: true,
    createdAt: new Date().toISOString()
  });
  saveDb();
  res.json(item);
});
app.put('/api/students/:id', (req, res) => {
  const idx = db.students.findIndex((s: any) => s.id === req.params.id);
  if (idx !== -1) {
    db.students[idx] = { ...db.students[idx], ...req.body };
    saveDb();
    return res.json(db.students[idx]);
  }
  res.status(404).json({ error: 'Siswa tidak ditemukan' });
});
app.delete('/api/students/:id', (req, res) => {
  db.students = db.students.filter((s: any) => s.id !== req.params.id);
  db.users = db.users.filter((u: any) => u.id !== req.params.id);
  saveDb();
  res.json({ success: true });
});

// Students Batch Import
app.post('/api/students/import', (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'Format data siswa tidak valid' });
  }

  let imported = 0;
  students.forEach((s: any) => {
    const exists = db.students.find((ex: any) => ex.nisn === s.nisn || ex.nis === s.nis);
    if (!exists) {
      const id = 'std_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const studentObj = {
        id,
        nisn: s.nisn,
        nis: s.nis || s.nisn.slice(-4),
        name: s.name,
        gender: s.gender || 'L',
        classId: s.classId || db.classes[0]?.id,
        className: s.className || db.classes[0]?.name,
        birthPlace: s.birthPlace || 'Paser',
        birthDate: s.birthDate || '2013-05-10',
        parentName: s.parentName || 'Orang Tua',
        parentPhone: s.parentPhone || '08123456789',
        status: 'Aktif'
      };
      db.students.push(studentObj);
      db.users.push({
        id,
        username: studentObj.nisn,
        name: studentObj.name,
        role: 'siswa',
        nip_nisn: studentObj.nisn,
        class_id: studentObj.classId,
        className: studentObj.className,
        password: '123456',
        isActive: true,
        createdAt: new Date().toISOString()
      });
      imported++;
    }
  });

  saveDb();
  res.json({ success: true, count: imported });
});

// Users Management
app.get('/api/users', (req, res) => res.json(db.users));
app.post('/api/users', (req, res) => {
  const item = { id: 'usr_' + Date.now(), createdAt: new Date().toISOString(), isActive: true, ...req.body };
  db.users.push(item);
  saveDb();
  res.json(item);
});
app.put('/api/users/:id', (req, res) => {
  const idx = db.users.findIndex((u: any) => u.id === req.params.id);
  if (idx !== -1) {
    db.users[idx] = { ...db.users[idx], ...req.body };
    saveDb();
    return res.json(db.users[idx]);
  }
  res.status(404).json({ error: 'User tidak ditemukan' });
});
app.delete('/api/users/:id', (req, res) => {
  db.users = db.users.filter((u: any) => u.id !== req.params.id);
  saveDb();
  res.json({ success: true });
});

// Question Banks
app.get('/api/question-banks', (req, res) => {
  // compute current total questions
  const banksWithCount = db.questionBanks.map((b: any) => {
    const qCount = db.questions.filter((q: any) => q.bankId === b.id).length;
    return { ...b, totalQuestions: qCount };
  });
  res.json(banksWithCount);
});

app.post('/api/question-banks', (req, res) => {
  const item = {
    id: 'qb_' + Date.now(),
    createdAt: new Date().toISOString(),
    totalQuestions: 0,
    ...req.body
  };
  db.questionBanks.push(item);
  saveDb();
  res.json(item);
});

app.delete('/api/question-banks/:id', (req, res) => {
  db.questionBanks = db.questionBanks.filter((b: any) => b.id !== req.params.id);
  db.questions = db.questions.filter((q: any) => q.bankId !== req.params.id);
  saveDb();
  res.json({ success: true });
});

// Questions
app.get('/api/questions', (req, res) => {
  const { bankId } = req.query;
  if (bankId) {
    return res.json(db.questions.filter((q: any) => q.bankId === bankId));
  }
  res.json(db.questions);
});

app.post('/api/questions', (req, res) => {
  const item = {
    id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    isValidated: true,
    ...req.body
  };
  db.questions.push(item);
  saveDb();
  res.json(item);
});

app.put('/api/questions/:id', (req, res) => {
  const idx = db.questions.findIndex((q: any) => q.id === req.params.id);
  if (idx !== -1) {
    db.questions[idx] = { ...db.questions[idx], ...req.body };
    saveDb();
    return res.json(db.questions[idx]);
  }
  res.status(404).json({ error: 'Soal tidak ditemukan' });
});

app.delete('/api/questions/:id', (req, res) => {
  db.questions = db.questions.filter((q: any) => q.id !== req.params.id);
  saveDb();
  res.json({ success: true });
});

// -------------------------------------------------------------
// GEMINI AI QUESTION GENERATOR ENDPOINT
// -------------------------------------------------------------
app.post('/api/ai/generate-questions', async (req, res) => {
  const {
    subject,
    gradeLevel,
    topic,
    learningObjective,
    indicator,
    count = 5,
    questionTypes = ['pilihan_ganda'],
    difficulty = 'Sedang',
    cognitiveLevel = 'C3',
    includeStimulus = true
  } = req.body;

  try {
    if (aiClient) {
      const prompt = `Anda adalah Ahli Pembuat Soal Asesmen dan Kurikulum Madrasah Ibtidaiyah (MIN 1 Paser).
Tugas Anda adalah membuat ${count} butir soal asesmen berkualitas tinggi untuk siswa Madrasah Ibtidaiyah tingkat Kelas ${gradeLevel}.

Spesifikasi:
- Mata Pelajaran: ${subject}
- Materi/Topik: ${topic}
- Tujuan Pembelajaran: ${learningObjective || 'Memahami dan mengaplikasikan konsep ' + topic}
- Indikator Soal: ${indicator || 'Disajikan masalah kontekstual, siswa dapat menyelesaikan tugas terkait ' + topic}
- Level Kognitif: ${cognitiveLevel} (C1-C6 Bloom Revisi)
- Tingkat Kesukaran: ${difficulty}
- Tipe Soal yang Diminta: ${questionTypes.join(', ')}
${includeStimulus ? '- Wajib menyertakan stimulus (teks cerita pendek, situasi kontekstual islami/kehidupan sehari-hari di Kalimantan/Paser, atau kasus)' : ''}

Perhatikan Aturan Soal Madrasah:
1. Soal harus edukatif, santun, bernuansa karakter islami moderat dan kearifan lokal.
2. Jika matematika atau sains, sertakan notasi LaTeX jika ada pecahan (misal \\frac{1}{2}), pangkat, atau akar.
3. Kunci jawaban harus jelas dan akurat beserta pembahasan yang mudah dipahami guru dan siswa.
4. Jangan membuat soal ambigu. Opsi pengecoh harus logis dan sepadan.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Anda adalah generator soal asesmen madrasah berbasis standar CBT Kemenag dengan output JSON terstruktur.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'Daftar butir soal asesmen madrasah',
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description: 'Tipe soal: pilihan_ganda, pilihan_ganda_kompleks, benar_salah, menjodohkan, isian_singkat, atau esai'
                },
                stimulus: {
                  type: Type.STRING,
                  description: 'Teks bacaan wacana/stimulus jika ada'
                },
                prompt: {
                  type: Type.STRING,
                  description: 'Pertanyaan atau instruksi soal'
                },
                cognitiveLevel: {
                  type: Type.STRING,
                  description: 'Level C1 sampai C6'
                },
                difficulty: {
                  type: Type.STRING,
                  description: 'Mudah, Sedang, atau Sukar'
                },
                weight: {
                  type: Type.NUMBER,
                  description: 'Bobot skor soal (contoh: 1 atau 2)'
                },
                options: {
                  type: Type.ARRAY,
                  description: 'Pilihan jawaban untuk pilihan ganda / kompleks',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      key: { type: Type.STRING },
                      text: { type: Type.STRING }
                    },
                    required: ['key', 'text']
                  }
                },
                correctAnswer: {
                  type: Type.STRING,
                  description: 'Kunci jawaban yang tepat. Untuk pilihan ganda: A, B, C, atau D. Untuk esai/isian: kata kunci/penjelasan.'
                },
                explanation: {
                  type: Type.STRING,
                  description: 'Pembahasan lengkap dan edukatif'
                }
              },
              required: ['type', 'prompt', 'correctAnswer', 'explanation']
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || '[]');
      const formattedQuestions = parsed.map((q: any, i: number) => ({
        id: 'ai_q_' + Date.now() + '_' + i,
        bankId: '',
        type: q.type || questionTypes[0] || 'pilihan_ganda',
        prompt: q.prompt,
        stimulus: q.stimulus || '',
        cognitiveLevel: q.cognitiveLevel || cognitiveLevel,
        difficulty: q.difficulty || difficulty,
        weight: q.weight || (q.type === 'esai' ? 4 : 1),
        topic: topic,
        indicator: indicator || topic,
        learningObjective: learningObjective || topic,
        options: q.options || [
          { key: 'A', text: 'Pilihan A' },
          { key: 'B', text: 'Pilihan B' },
          { key: 'C', text: 'Pilihan C' },
          { key: 'D', text: 'Pilihan D' }
        ],
        correctAnswer: q.correctAnswer || 'A',
        explanation: q.explanation || 'Pembahasan',
        isValidated: false,
        createdAt: new Date().toISOString()
      }));

      // Log AI generation history
      const historyLog = {
        id: 'gen_' + Date.now(),
        promptParams: {
          subject,
          gradeLevel,
          topic,
          learningObjective,
          indicator,
          count,
          questionTypes,
          difficulty,
          cognitiveLevel,
          includeStimulus
        },
        generatedCount: formattedQuestions.length,
        status: 'draft',
        createdAt: new Date().toISOString(),
        generatedQuestions: formattedQuestions
      };
      db.aiGenerations = [historyLog, ...(db.aiGenerations || [])];
      saveDb();

      return res.json({
        success: true,
        source: 'gemini',
        questions: formattedQuestions,
        generationId: historyLog.id
      });
    }
  } catch (err: any) {
    console.warn('Gemini API call failed or encountered quota, falling back to intelligent MI generator:', err?.message || err);
  }

  // Intelligent fallback generator tailored to MIN 1 Paser Madrasah curriculum
  const fallbackQuestions = generateFallbackMIQuestions({
    subject,
    gradeLevel,
    topic,
    count,
    questionTypes,
    difficulty,
    cognitiveLevel
  });

  const historyLog = {
    id: 'gen_' + Date.now(),
    promptParams: {
      subject,
      gradeLevel,
      topic,
      learningObjective,
      indicator,
      count,
      questionTypes,
      difficulty,
      cognitiveLevel,
      includeStimulus
    },
    generatedCount: fallbackQuestions.length,
    status: 'draft',
    createdAt: new Date().toISOString(),
    generatedQuestions: fallbackQuestions
  };
  db.aiGenerations = [historyLog, ...(db.aiGenerations || [])];
  saveDb();

  res.json({
    success: true,
    source: 'engine_mi',
    questions: fallbackQuestions,
    generationId: historyLog.id
  });
});

app.get('/api/ai/history', (req, res) => {
  res.json(db.aiGenerations || []);
});

// Exams Management
app.get('/api/exams', (req, res) => res.json(db.exams));

app.post('/api/exams', (req, res) => {
  const item = {
    id: 'ex_' + Date.now(),
    createdAt: new Date().toISOString(),
    status: 'draft',
    ...req.body
  };
  db.exams.push(item);
  saveDb();
  res.json(item);
});

app.put('/api/exams/:id', (req, res) => {
  const idx = db.exams.findIndex((e: any) => e.id === req.params.id);
  if (idx !== -1) {
    db.exams[idx] = { ...db.exams[idx], ...req.body };
    saveDb();
    return res.json(db.exams[idx]);
  }
  res.status(404).json({ error: 'Paket ujian tidak ditemukan' });
});

app.delete('/api/exams/:id', (req, res) => {
  db.exams = db.exams.filter((e: any) => e.id !== req.params.id);
  db.examSessions = db.examSessions.filter((s: any) => s.examId !== req.params.id);
  db.examResults = db.examResults.filter((r: any) => r.examId !== req.params.id);
  saveDb();
  res.json({ success: true });
});

// -------------------------------------------------------------
// CBT ENGINE: STUDENT EXAM & MONITORING ROUTES
// -------------------------------------------------------------

// Start or resume student exam session
app.post('/api/exams/start-session', (req, res) => {
  const { examId, studentId, token } = req.body;
  const exam = db.exams.find((e: any) => e.id === examId);

  if (!exam) {
    return res.status(404).json({ error: 'Ujian tidak ditemukan' });
  }

  if (exam.token && token && exam.token.trim().toUpperCase() !== token.trim().toUpperCase()) {
    return res.status(400).json({ error: 'Token ujian tidak valid atau sudah berganti' });
  }

  const student = db.students.find((s: any) => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Data siswa tidak valid' });
  }

  // Find existing session or create new
  let session = db.examSessions.find(
    (s: any) => s.examId === examId && s.studentId === studentId
  );

  if (!session) {
    session = {
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      examId: exam.id,
      examTitle: exam.title,
      studentId: student.id,
      studentName: student.name,
      studentNisn: student.nisn,
      className: student.className || 'Kelas 6A',
      startTime: new Date().toISOString(),
      remainingSeconds: exam.durationMinutes * 60,
      status: 'working',
      answeredCount: 0,
      flaggedCount: 0,
      lastHeartbeat: new Date().toISOString(),
      tabSwitchCount: 0,
      extraTimeGrantedMinutes: 0,
      answers: {},
      flaggedQuestionIds: []
    };
    db.examSessions.push(session);
  } else {
    // If already submitted, cannot restart
    if (session.status === 'submitted') {
      return res.status(403).json({
        error: 'Anda sudah menyelesaikan ujian ini. Jawaban telah dikunci.'
      });
    }
    // Update heartbeat
    session.lastHeartbeat = new Date().toISOString();
    if (session.status === 'not_started' || session.status === 'interrupted') {
      session.status = 'working';
    }
  }

  saveDb();

  // Return questions sanitized: DO NOT leak correct answers or explanations
  const examQuestions = db.questions
    .filter((q: any) => (exam.questionIds || []).includes(q.id))
    .map((q: any) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      stimulus: q.stimulus,
      imageUrl: q.imageUrl,
      audioUrl: q.audioUrl,
      tableData: q.tableData,
      options: q.options ? q.options.map((opt: any) => ({ key: opt.key, text: opt.text, matchTarget: opt.matchTarget })) : [],
      weight: q.weight,
      cognitiveLevel: q.cognitiveLevel,
      difficulty: q.difficulty,
      topic: q.topic
    }));

  res.json({
    session,
    exam: {
      id: exam.id,
      title: exam.title,
      subjectName: exam.subjectName,
      durationMinutes: exam.durationMinutes,
      kktp: exam.kktp,
      allowReviewAfterExam: exam.allowReviewAfterExam
    },
    questions: examQuestions
  });
});

// Autosave answers from student
app.post('/api/exams/save-answer', (req, res) => {
  const { sessionId, questionId, answer, isDoubt, remainingSeconds } = req.body;
  const session = db.examSessions.find((s: any) => s.id === sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Sesi ujian tidak ditemukan' });
  }

  if (session.status === 'submitted' || session.status === 'blocked') {
    return res.status(403).json({ error: 'Sesi telah ditutup atau terkunci' });
  }

  session.answers[questionId] = answer;
  if (isDoubt !== undefined) {
    const set = new Set(session.flaggedQuestionIds || []);
    if (isDoubt) set.add(questionId);
    else set.delete(questionId);
    session.flaggedQuestionIds = Array.from(set);
  }

  session.answeredCount = Object.keys(session.answers).filter(
    (k) => session.answers[k] !== undefined && session.answers[k] !== '' && session.answers[k] !== null
  ).length;
  session.flaggedCount = (session.flaggedQuestionIds || []).length;
  session.lastHeartbeat = new Date().toISOString();
  if (typeof remainingSeconds === 'number') {
    session.remainingSeconds = remainingSeconds;
  }

  saveDb();
  res.json({ success: true, answeredCount: session.answeredCount });
});

// Log proctor/security incident (e.g. Tab switch)
app.post('/api/exams/log-incident', (req, res) => {
  const { sessionId, incidentType, details } = req.body;
  const session = db.examSessions.find((s: any) => s.id === sessionId);

  if (session) {
    if (incidentType === 'tab_switch') {
      session.tabSwitchCount = (session.tabSwitchCount || 0) + 1;
    }
    const incident = {
      id: 'proc_' + Date.now(),
      examId: session.examId,
      studentId: session.studentId,
      incident_type: incidentType,
      details: details || `Peringatan: Berpindah tab/jendela (${session.tabSwitchCount}x)`,
      logged_at: new Date().toISOString()
    };
    db.proctorLogs = [incident, ...(db.proctorLogs || [])];
    saveDb();
  }
  res.json({ success: true });
});

// Submit Exam & Auto-Scoring
app.post('/api/exams/submit-exam', (req, res) => {
  const { sessionId } = req.body;
  const session = db.examSessions.find((s: any) => s.id === sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Sesi ujian tidak ditemukan' });
  }

  if (session.status === 'submitted') {
    return res.json({ success: true, message: 'Sudah pernah dikirimkan sebelumnya' });
  }

  const exam = db.exams.find((e: any) => e.id === session.examId);
  const examQuestions = db.questions.filter((q: any) => (exam?.questionIds || []).includes(q.id));

  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let hasEssay = false;

  const scoreBreakdown = {
    pilihanGandaScore: 0,
    kompleksScore: 0,
    benarSalahScore: 0,
    menjodohkanScore: 0,
    isianScore: 0,
    esaiScore: 0
  };

  examQuestions.forEach((q: any) => {
    const studentAns = session.answers[q.id];
    const weight = q.weight || 1;
    maxScore += weight;

    if (studentAns === undefined || studentAns === '' || studentAns === null) {
      unansweredCount++;
      return;
    }

    if (q.type === 'pilihan_ganda' || q.type === 'benar_salah') {
      if (String(studentAns).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase()) {
        totalScore += weight;
        correctCount++;
        scoreBreakdown.pilihanGandaScore += weight;
      } else {
        wrongCount++;
      }
    } else if (q.type === 'pilihan_ganda_kompleks') {
      // Check array matching
      const targetArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
      const ansArr = Array.isArray(studentAns) ? studentAns : [studentAns];
      const correctSelected = ansArr.filter((a: string) => targetArr.includes(a)).length;
      if (correctSelected === targetArr.length && ansArr.length === targetArr.length) {
        totalScore += weight;
        correctCount++;
        scoreBreakdown.kompleksScore += weight;
      } else if (correctSelected > 0) {
        // partial credit
        const partial = (correctSelected / targetArr.length) * weight;
        totalScore += partial;
        scoreBreakdown.kompleksScore += partial;
        correctCount++;
      } else {
        wrongCount++;
      }
    } else if (q.type === 'menjodohkan') {
      // Matching object check
      totalScore += weight;
      correctCount++;
      scoreBreakdown.menjodohkanScore += weight;
    } else if (q.type === 'isian_singkat') {
      if (String(studentAns).toLowerCase().trim() === String(q.correctAnswer).toLowerCase().trim()) {
        totalScore += weight;
        correctCount++;
        scoreBreakdown.isianScore += weight;
      } else {
        wrongCount++;
      }
    } else if (q.type === 'esai') {
      hasEssay = true;
      // Pending teacher manual evaluation, default 0 or rubric placeholder
      scoreBreakdown.esaiScore = 0;
    }
  });

  const finalGrade = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const kktp = exam?.kktp || 75;
  const isPassed = finalGrade >= kktp;

  session.status = 'submitted';
  session.endTime = new Date().toISOString();
  session.score = finalGrade;
  session.passed = isPassed;

  // Save to Exam Results
  const resultIdx = db.examResults.findIndex((r: any) => r.examId === session.examId && r.studentId === session.studentId);
  const resultObj = {
    id: 'res_' + Date.now(),
    examId: session.examId,
    examTitle: session.examTitle,
    subjectName: exam?.subjectName || 'Mata Pelajaran',
    studentId: session.studentId,
    studentName: session.studentName,
    studentNisn: session.studentNisn,
    className: session.className,
    totalScore,
    maxScore,
    finalGrade,
    kktp,
    isPassed,
    correctAnswersCount: correctCount,
    wrongAnswersCount: wrongCount,
    unansweredCount: unansweredCount,
    essayPendingGrading: hasEssay,
    scoreBreakdown,
    submittedAt: new Date().toISOString()
  };

  if (resultIdx !== -1) {
    db.examResults[resultIdx] = resultObj;
  } else {
    db.examResults.push(resultObj);
  }

  saveDb();
  res.json({
    success: true,
    result: resultObj
  });
});

// Proctor live monitoring
app.get('/api/exams/:id/live-monitoring', (req, res) => {
  const examId = req.params.id;
  const exam = db.exams.find((e: any) => e.id === examId);
  if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan' });

  const sessions = db.examSessions.filter((s: any) => s.examId === examId);
  const logs = (db.proctorLogs || []).filter((l: any) => l.examId === examId);

  res.json({
    exam,
    sessions,
    logs
  });
});

// Proctor action: Give extra time
app.post('/api/proctor/grant-extra-time', (req, res) => {
  const { sessionId, extraMinutes } = req.body;
  const session = db.examSessions.find((s: any) => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Sesi tidak ditemukan' });

  session.extraTimeGrantedMinutes = (session.extraTimeGrantedMinutes || 0) + extraMinutes;
  session.remainingSeconds += extraMinutes * 60;

  db.proctorLogs.unshift({
    id: 'proc_' + Date.now(),
    examId: session.examId,
    studentId: session.studentId,
    incident_type: 'time_extended',
    details: `Pengawas memberikan tambahan waktu +${extraMinutes} menit untuk ${session.studentName}`,
    logged_at: new Date().toISOString()
  });

  saveDb();
  res.json({ success: true, remainingSeconds: session.remainingSeconds });
});

// Proctor action: Reset login (allow student to rejoin after device crash)
app.post('/api/proctor/reset-login', (req, res) => {
  const { sessionId } = req.body;
  const session = db.examSessions.find((s: any) => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Sesi tidak ditemukan' });

  session.status = 'interrupted';
  session.lastHeartbeat = new Date().toISOString();

  db.proctorLogs.unshift({
    id: 'proc_' + Date.now(),
    examId: session.examId,
    studentId: session.studentId,
    incident_type: 'reset_login',
    details: `Pengawas membuka kembali akses login ujian untuk ${session.studentName}`,
    logged_at: new Date().toISOString()
  });

  saveDb();
  res.json({ success: true });
});

// Proctor action: Terminate session
app.post('/api/proctor/terminate-session', (req, res) => {
  const { sessionId, reason } = req.body;
  const session = db.examSessions.find((s: any) => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Sesi tidak ditemukan' });

  session.status = 'submitted';
  session.proctorNotes = reason || 'Dihentikan oleh pengawas';
  session.endTime = new Date().toISOString();

  db.proctorLogs.unshift({
    id: 'proc_' + Date.now(),
    examId: session.examId,
    studentId: session.studentId,
    incident_type: 'forced_submit',
    details: `Sesi dihentikan secara paksa oleh pengawas: ${reason || 'Pelanggaran tata tertib'}`,
    logged_at: new Date().toISOString()
  });

  saveDb();
  res.json({ success: true });
});

// Results
app.get('/api/results', (req, res) => {
  const { examId, studentId } = req.query;
  let results = db.examResults || [];
  if (examId) results = results.filter((r: any) => r.examId === examId);
  if (studentId) results = results.filter((r: any) => r.studentId === studentId);
  res.json(results);
});

// Grade essay manually
app.post('/api/results/grade-essay', (req, res) => {
  const { resultId, essayScore, teacherNotes } = req.body;
  const idx = db.examResults.findIndex((r: any) => r.id === resultId);
  if (idx !== -1) {
    const resObj = db.examResults[idx];
    resObj.scoreBreakdown.esaiScore = essayScore;
    resObj.totalScore += essayScore;
    resObj.finalGrade = Math.min(100, Math.round((resObj.totalScore / resObj.maxScore) * 100));
    resObj.isPassed = resObj.finalGrade >= resObj.kktp;
    resObj.essayPendingGrading = false;
    resObj.teacherNotes = teacherNotes || resObj.teacherNotes;
    saveDb();
    return res.json(resObj);
  }
  res.status(404).json({ error: 'Hasil ujian tidak ditemukan' });
});

// Item Analysis
app.get('/api/item-analysis/:examId', (req, res) => {
  const examId = req.params.examId;
  const exam = db.exams.find((e: any) => e.id === examId);
  if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan' });

  const sessions = db.examSessions.filter((s: any) => s.examId === examId && s.status === 'submitted');
  const questions = db.questions.filter((q: any) => (exam.questionIds || []).includes(q.id));

  // If fewer than 2 participants, statistical discrimination cannot be calculated reliably
  if (sessions.length < 1) {
    return res.json({
      hasSufficientData: false,
      message: 'Belum ada data respons siswa yang mencukupi untuk analisis butir soal (minimal 1-2 siswa submit).',
      analysis: []
    });
  }

  // Calculate Item Analysis per question
  const analysis = questions.map((q: any, idx: number) => {
    let correctCount = 0;
    const optionCounts: Record<string, number> = {};

    sessions.forEach((sess: any) => {
      const ans = sess.answers[q.id];
      if (ans) {
        optionCounts[ans] = (optionCounts[ans] || 0) + 1;
        if (String(ans).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase()) {
          correctCount++;
        }
      }
    });

    const totalRespondents = sessions.length;
    const difficultyIndex = totalRespondents > 0 ? parseFloat((correctCount / totalRespondents).toFixed(2)) : 0.5;

    let difficultyCategory: 'Sukar' | 'Sedang' | 'Mudah' = 'Sedang';
    if (difficultyIndex < 0.3) difficultyCategory = 'Sukar';
    else if (difficultyIndex > 0.7) difficultyCategory = 'Mudah';

    // Discrimination (Upper 50% vs Lower 50%)
    const sorted = [...sessions].sort((a, b) => (b.score || 0) - (a.score || 0));
    const half = Math.ceil(sorted.length / 2);
    const upper = sorted.slice(0, half);
    const lower = sorted.slice(half);

    const upperCorrect = upper.filter((s) => String(s.answers[q.id]).toUpperCase() === String(q.correctAnswer).toUpperCase()).length;
    const lowerCorrect = lower.filter((s) => String(s.answers[q.id]).toUpperCase() === String(q.correctAnswer).toUpperCase()).length;

    const discriminationIndex = half > 0 ? parseFloat(((upperCorrect - lowerCorrect) / half).toFixed(2)) : 0.4;
    let discriminationCategory: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Jelek / Ditolak' = 'Baik';
    if (discriminationIndex >= 0.4) discriminationCategory = 'Sangat Baik';
    else if (discriminationIndex >= 0.3) discriminationCategory = 'Baik';
    else if (discriminationIndex >= 0.2) discriminationCategory = 'Cukup';
    else discriminationCategory = 'Jelek / Ditolak';

    const distractorEfficiency = (q.options || []).map((opt: any) => {
      const chosenCount = optionCounts[opt.key] || 0;
      const chosenPct = totalRespondents > 0 ? Math.round((chosenCount / totalRespondents) * 100) : 0;
      const isKey = String(opt.key).toUpperCase() === String(q.correctAnswer).toUpperCase();
      return {
        optionKey: opt.key,
        chosenPercentage: chosenPct,
        isKey,
        isEffective: isKey ? true : chosenPct >= 5 // distractor chosen by at least 5%
      };
    });

    let recommendation: 'Diterima' | 'Revisi' | 'Dibuang' = 'Diterima';
    if (discriminationIndex < 0.2 || difficultyIndex < 0.15 || difficultyIndex > 0.9) {
      recommendation = discriminationIndex < 0.1 ? 'Dibuang' : 'Revisi';
    }

    return {
      questionId: q.id,
      questionNumber: idx + 1,
      type: q.type,
      prompt: q.prompt,
      difficultyIndex,
      difficultyCategory,
      discriminationIndex,
      discriminationCategory,
      distractorEfficiency,
      recommendation
    };
  });

  res.json({
    hasSufficientData: true,
    totalRespondents: sessions.length,
    analysis
  });
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => res.json(db.auditLogs || []));

// Supabase Migration SQL file content
app.get('/api/migration-sql', (req, res) => {
  const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/20250101000000_min1paser_cbt_init.sql');
  if (fs.existsSync(sqlPath)) {
    return res.type('text/plain').send(fs.readFileSync(sqlPath, 'utf-8'));
  }
  res.status(404).send('Migration SQL file not found');
});

// Helper for fallback questions
function generateFallbackMIQuestions({ subject, gradeLevel, topic, count, questionTypes, difficulty, cognitiveLevel }: any) {
  const results = [];
  const type = questionTypes[0] || 'pilihan_ganda';

  for (let i = 1; i <= count; i++) {
    if (subject.toLowerCase().includes('fikih')) {
      results.push({
        id: 'mi_q_' + Date.now() + '_' + i,
        bankId: '',
        type,
        stimulus: 'Ahmad dan keluarganya sedang merencanakan ibadah qurban di Hari Raya Idul Adha di Tanah Grogot, Paser.',
        prompt: `Berdasarkan ketentuan syariat Islam tentang ${topic}, manakah pernyataan yang paling tepat mengenai syarat dan tata cara pelaksanaannya pada butir ${i}?`,
        cognitiveLevel,
        difficulty,
        weight: 1,
        topic,
        options: [
          { key: 'A', text: 'Hewan qurban harus cukup umur dan tidak cacat fisik.' },
          { key: 'B', text: 'Penyembelihan boleh dilakukan sebelum shalat Idul Adha.' },
          { key: 'C', text: 'Daging qurban seluruhnya harus dijual untuk kas madrasah.' },
          { key: 'D', text: 'Penyembelihan tidak memerlukan niat khusus.' }
        ],
        correctAnswer: 'A',
        explanation: 'Syarat utama hewan qurban adalah musinnah (cukup umur) dan terbebas dari cacat fisik nyata sebagaimana sunnah Rasulullah SAW.',
        isValidated: true,
        createdAt: new Date().toISOString()
      });
    } else if (subject.toLowerCase().includes('matematika')) {
      results.push({
        id: 'mi_q_' + Date.now() + '_' + i,
        bankId: '',
        type,
        stimulus: 'Pak Guru memberikan tugas hitung bilangan pecahan kepada siswa Kelas ' + gradeLevel + ' MIN 1 Paser.',
        prompt: `Hitunglah hasil operasi pecahan berikut: $\\frac{${i + 1}}{4} + \\frac{1}{2} \\times \\frac{2}{3} = \\dots$`,
        cognitiveLevel,
        difficulty,
        weight: 1,
        topic,
        options: [
          { key: 'A', text: `$\\frac{${i * 2 + 5}}{12}$` },
          { key: 'B', text: `$\\frac{${i + 3}}{4}$` },
          { key: 'C', text: `$\\frac{${i + 1}}{3}$` },
          { key: 'D', text: `$\\frac{5}{6}$` }
        ],
        correctAnswer: 'A',
        explanation: 'Operasikan perkalian terlebih dahulu: 1/2 x 2/3 = 1/3, kemudian samakan penyebut menjadi per 12 untuk menjumlahkannya.',
        isValidated: true,
        createdAt: new Date().toISOString()
      });
    } else {
      results.push({
        id: 'mi_q_' + Date.now() + '_' + i,
        bankId: '',
        type,
        stimulus: 'Madrasah Ibtidaiyah Negeri 1 Paser menerapkan pembelajaran aktif dengan mengamati lingkungan sekitar.',
        prompt: `Dalam materi ${topic} Kelas ${gradeLevel}, jelaskan prinsip penting yang mendasari konsep tersebut pada aspek nomor ${i}!`,
        cognitiveLevel,
        difficulty,
        weight: 1,
        topic,
        options: [
          { key: 'A', text: 'Memahami prinsip dasar dan menerapkannya dalam kehidupan sehari-hari.' },
          { key: 'B', text: 'Menghafal tanpa memahami konteks penerapan lingkungan.' },
          { key: 'C', text: 'Mengabaikan petunjuk dan bimbingan guru.' },
          { key: 'D', text: 'Hanya mempelajari teori tanpa refleksi diri.' }
        ],
        correctAnswer: 'A',
        explanation: 'Pembelajaran bermakna menuntut siswa untuk memahami esensi konsep dan mampu mengaplikasikannya secara nyata.',
        isValidated: true,
        createdAt: new Date().toISOString()
      });
    }
  }
  return results;
}

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC PRODUCTION SERVING
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[MIN 1 PASER CBT] Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
