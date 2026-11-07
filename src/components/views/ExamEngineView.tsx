/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  School,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Wifi,
  WifiOff,
  User,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import {
  Student,
  ExamPackage,
  Question,
  StudentExamSession,
  SchoolSettings
} from '../../types/index.ts';
import { MathRenderer } from '../common/MathRenderer.tsx';
import { api } from '../../lib/api.ts';

interface ExamEngineViewProps {
  currentUser: any;
  schoolSettings: SchoolSettings;
  availableExams: ExamPackage[];
  onFinishExam: () => void;
}

export const ExamEngineView: React.FC<ExamEngineViewProps> = ({
  currentUser,
  schoolSettings,
  availableExams,
  onFinishExam
}) => {
  // Session State
  const [selectedExamId, setSelectedExamId] = useState<string>(availableExams[0]?.id || '');
  const [tokenInput, setTokenInput] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [session, setSession] = useState<StudentExamSession | null>(null);
  const [examMeta, setExamMeta] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Exam answers & doubt state
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(3600);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [examCompletedResult, setExamCompletedResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const currentQ = questions[currentIndex];
  const timerRef = useRef<any>(null);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Anti-cheat window blur / visibility detection
  useEffect(() => {
    if (!sessionStarted || !session || session.status === 'submitted') return;

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const next = prev + 1;
          api.logExamIncident(session.id, 'tab_switch', `Peserta meninggalkan jendela ujian (${next}x)`);
          return next;
        });
        setShowWarningModal(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [sessionStarted, session]);

  // Countdown timer
  useEffect(() => {
    if (!sessionStarted || !session || session.status === 'submitted') return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionStarted, session]);

  // Start or resume CBT session
  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await api.startStudentSession(
        selectedExamId,
        currentUser.id,
        tokenInput.trim()
      );

      setSession(res.session);
      setExamMeta(res.exam);
      setQuestions(res.questions || []);
      setAnswers(res.session.answers || {});
      setFlaggedIds(res.session.flaggedQuestionIds || []);
      setRemainingSeconds(res.session.remainingSeconds || res.exam.durationMinutes * 60);
      setSessionStarted(true);

      // Backup to localStorage
      localStorage.setItem(`cbt_backup_${res.session.id}`, JSON.stringify(res.session.answers || {}));
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memulai ujian');
    }
  };

  // Autosave answer to server & localStorage
  const handleSaveAnswer = useCallback(
    async (qId: string, val: any) => {
      if (!session) return;
      const newAnswers = { ...answers, [qId]: val };
      setAnswers(newAnswers);

      // Save local backup immediately
      try {
        localStorage.setItem(`cbt_backup_${session.id}`, JSON.stringify(newAnswers));
      } catch (e) {
        console.error(e);
      }

      // Sync to server
      try {
        await api.saveStudentAnswer(
          session.id,
          qId,
          val,
          flaggedIds.includes(qId),
          remainingSeconds
        );
      } catch (err) {
        console.warn('Network sync failed, stored in offline backup:', err);
      }
    },
    [session, answers, flaggedIds, remainingSeconds]
  );

  // Toggle Ragu-ragu (Doubt flag)
  const handleToggleFlag = async () => {
    if (!currentQ || !session) return;
    const isCurrentlyFlagged = flaggedIds.includes(currentQ.id);
    let nextFlagged = [...flaggedIds];
    if (isCurrentlyFlagged) {
      nextFlagged = nextFlagged.filter((id) => id !== currentQ.id);
    } else {
      nextFlagged.push(currentQ.id);
    }
    setFlaggedIds(nextFlagged);

    try {
      await api.saveStudentAnswer(
        session.id,
        currentQ.id,
        answers[currentQ.id],
        !isCurrentlyFlagged,
        remainingSeconds
      );
    } catch (e) {
      console.warn(e);
    }
  };

  // Submit CBT
  const handleAutoSubmit = () => {
    alert('Waktu ujian telah habis! Jawaban Anda akan otomatis dikirimkan.');
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (!session) return;
    setSubmitting(true);
    setShowConfirmSubmit(false);

    try {
      const res = await api.submitStudentExam(session.id);
      setSession((prev) => (prev ? { ...prev, status: 'submitted' } : null));
      setExamCompletedResult(res.result);
    } catch (err: any) {
      alert(err.message || 'Gagal mengirimkan ujian');
    } finally {
      setSubmitting(false);
    }
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // Count answered
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== '' && answers[k] !== null
  ).length;
  const unansweredCount = questions.length - answeredCount;

  // View: Token Entry Gate
  if (!sessionStarted) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg mx-auto mb-3 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B192C] rounded-[14px] flex items-center justify-center">
                <School className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Ruang Ujian Digital Siswa MIN 1 Paser
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Selamat datang, <span className="text-amber-400 font-bold">{currentUser.name}</span> ({currentUser.className || 'Kelas 6A'}).
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStartExam} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Pilih Jadwal Ujian yang Akan Dikerjakan
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none text-xs font-semibold cursor-pointer"
              >
                {availableExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.subjectName} • {exam.durationMinutes} Menit)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 flex justify-between">
                <span>Masukkan Token Ujian dari Pengawas</span>
                <span className="text-amber-400 font-normal">
                  Contoh Token: {availableExams.find((e) => e.id === selectedExamId)?.token || 'PASER25'}
                </span>
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Masukkan 6-8 digit token..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-base tracking-widest font-mono font-extrabold uppercase text-center focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            {/* Student Exam Rules & Honor Code */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="font-bold text-slate-300 flex items-center gap-1.5 text-xs text-amber-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Tata Tertib Asesmen MIN 1 Paser:
              </div>
              <p>1. Kerjakan ujian dengan jujur, mandiri, dan teliti.</p>
              <p>2. Waktu akan terus berjalan secara otomatis berdasarkan jam server.</p>
              <p>3. Dilarang berpindah tab browser atau membuka aplikasi lain selama ujian berlangsung.</p>
              <p>4. Jawaban tersimpan otomatis secara berkala.</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <span>Mulai Mengerjakan Ujian Sekarang</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // View: Exam Completed Screen
  if (session && session.status === 'submitted') {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Alhamdulillah, Ujian Berhasil Dikirim!
          </h2>
          <p className="text-xs text-slate-400">
            Seluruh jawaban Anda pada mata pelajaran <span className="text-white font-semibold">{examMeta?.subjectName || 'Ujian'}</span> telah disimpan dan dikunci di server CBT MIN 1 Paser.
          </p>

          {examCompletedResult && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Perolehan Nilai Akhir
              </div>
              <div className="text-4xl font-extrabold text-amber-400 font-mono">
                {examCompletedResult.finalGrade}
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    examCompletedResult.isPassed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {examCompletedResult.isPassed ? 'TUNTAS KKTP' : 'REMEDIAL'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  (Batas KKTP: {examCompletedResult.kktp})
                </span>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Benar: <span className="text-emerald-400 font-bold">{examCompletedResult.correctAnswersCount}</span> •
                Salah: <span className="text-rose-400 font-bold"> {examCompletedResult.wrongAnswersCount}</span> •
                Kosong: {examCompletedResult.unansweredCount}
              </div>
            </div>
          )}

          <button
            onClick={onFinishExam}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // View: Live Student Exam Room Interface
  return (
    <div className="space-y-4">
      {/* Top Floating CBT Student Bar */}
      <div className="bg-[#0B192C] border border-slate-800 p-3.5 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sticky top-[65px] z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">
              {examMeta?.title || 'Ujian CBT MIN 1 Paser'}
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-2">
              <span className="text-amber-300 font-medium">{currentUser.name}</span>
              <span>• NISN: {currentUser.nip_nisn || '0091234567'}</span>
              <span>• {currentUser.className || 'Kelas 6A'}</span>
            </div>
          </div>
        </div>

        {/* Center / Right: Connection status & Timer */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Online indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Tersambung</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400 font-semibold">Offline (Local Buffer)</span>
              </>
            )}
          </div>

          {/* Countdown Timer with color alert */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
              remainingSeconds < 300
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-slate-900 text-amber-400 border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {/* Submit button in top bar */}
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Selesai Ujian</span>
          </button>
        </div>
      </div>

      {/* Main CBT Workspace: Left = Current Question Panel, Right = Question Number Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Question Card (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {currentQ ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 min-h-[420px] flex flex-col justify-between">
              <div className="space-y-4">
                {/* Question Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm shadow-sm">
                      Soal No. {currentIndex + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {currentQ.type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Flag doubt button */}
                  <button
                    onClick={handleToggleFlag}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                      flaggedIds.includes(currentQ.id)
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{flaggedIds.includes(currentQ.id) ? 'Ragu-ragu (Ditandai)' : 'Tandai Ragu-ragu'}</span>
                  </button>
                </div>

                {/* Stimulus jika ada */}
                {currentQ.stimulus && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 border-l-4 border-l-amber-400">
                    <span className="font-bold text-amber-400 block mb-1">Stimulus / Wacana:</span>
                    <MathRenderer content={currentQ.stimulus} />
                  </div>
                )}

                {/* Question Text */}
                <div className="text-sm font-semibold text-white leading-relaxed">
                  <MathRenderer content={currentQ.prompt} />
                </div>

                {/* Choice options or Inputs depending on type */}
                {currentQ.type === 'pilihan_ganda' || currentQ.type === 'benar_salah' ? (
                  <div className="space-y-2.5 pt-2">
                    {(currentQ.options || []).map((opt) => {
                      const isSelected = answers[currentQ.id] === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleSaveAnswer(currentQ.id, opt.key)}
                          className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-400 text-white font-medium shadow-sm'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-400'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="text-xs">
                            <MathRenderer content={opt.text} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : currentQ.type === 'pilihan_ganda_kompleks' ? (
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[11px] text-amber-400 font-semibold mb-1">
                      Pilih satu atau lebih pilihan jawaban yang benar:
                    </div>
                    {(currentQ.options || []).map((opt) => {
                      const selectedArr: string[] = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                      const isSelected = selectedArr.includes(opt.key);
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            let nextArr = [...selectedArr];
                            if (isSelected) nextArr = nextArr.filter((k) => k !== opt.key);
                            else nextArr.push(opt.key);
                            handleSaveAnswer(currentQ.id, nextArr);
                          }}
                          className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-400 text-white font-medium'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-amber-500 focus:ring-amber-400"
                          />
                          <span className="font-bold text-xs text-amber-300">{opt.key}.</span>
                          <span className="text-xs">
                            <MathRenderer content={opt.text} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : currentQ.type === 'isian_singkat' ? (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tuliskan Jawaban Singkat Anda:
                    </label>
                    <input
                      type="text"
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleSaveAnswer(currentQ.id, e.target.value)}
                      placeholder="Ketik jawaban di sini..."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                ) : (
                  /* Esai / Uraian */
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tuliskan Jawaban Uraian / Langkah Pengerjaan Lengkap Anda:
                    </label>
                    <textarea
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleSaveAnswer(currentQ.id, e.target.value)}
                      rows={5}
                      placeholder="Ketik jawaban esai secara runtut dan jelas..."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Navigation Buttons: Sebelumnya & Selanjutnya */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <div className="text-slate-400 font-medium">
                  {currentIndex + 1} dari {questions.length} Soal
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Memuat butir soal...</div>
          )}
        </div>

        {/* Right: Question Number Grid Navigation (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs">Navigasi Nomor Soal</span>
              <span className="text-[11px] text-slate-400">{answeredCount}/{questions.length} Terjawab</span>
            </div>

            {/* Grid of question numbers */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null;
                const isFlagged = flaggedIds.includes(q.id);
                const isCurrent = currentIndex === idx;

                let btnStyle = 'bg-slate-950 text-slate-400 border-slate-800';
                if (isCurrent) {
                  btnStyle = 'ring-2 ring-amber-400 bg-slate-800 text-white font-bold';
                }
                if (isAnswered && !isFlagged) {
                  btnStyle = 'bg-emerald-600 text-white font-bold border-emerald-500';
                } else if (isFlagged) {
                  btnStyle = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs flex items-center justify-center border transition cursor-pointer relative ${btnStyle}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-800 text-[10px] space-y-1.5 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block" />
                <span>Hijau: Soal Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 inline-block" />
                <span>Kuning: Ditandai Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-800 inline-block" />
                <span>Abu-abu: Belum Dijawab</span>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim & Selesaikan Ujian</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warning Modal on Tab Switch */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-sm w-full p-6 text-center space-y-3 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Peringatan Pengawasan CBT!</h3>
            <p className="text-xs text-slate-300">
              Anda terdeteksi berpindah tab atau meminimalkan jendela ujian ({tabSwitchWarnings}x).
              Aktivitas ini dicatat dalam log pengawas madrasah. Tetaplah fokus pada lembar soal.
            </p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer"
            >
              Saya Mengerti & Lanjutkan Ujian
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal Submit */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Konfirmasi Pengiriman Ujian</h3>
            <p className="text-xs text-slate-300">
              Apakah Anda yakin ingin menyelesaikan dan mengirimkan jawaban Anda sekarang?
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div className="text-emerald-400 font-bold">
                {answeredCount} Soal Terjawab
              </div>
              <div className={`${unansweredCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                {unansweredCount} Belum Dijawab
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-[11px] text-rose-300">
                Peringatan: Masih terdapat {unansweredCount} soal yang belum Anda jawab!
              </p>
            )}

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitExam}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Mengirim...' : 'Ya, Kirim Jawaban Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
