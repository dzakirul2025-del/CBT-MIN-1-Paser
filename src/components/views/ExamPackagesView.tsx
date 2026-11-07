/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PackageCheck,
  Plus,
  Trash2,
  Edit,
  Search,
  Eye,
  Clock,
  Key,
  Calendar,
  Layers,
  BookOpen,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  ExamPackage,
  Subject,
  ClassRoom,
  Teacher,
  Question,
  AssessmentType
} from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface ExamPackagesViewProps {
  exams: ExamPackage[];
  subjects: Subject[];
  classes: ClassRoom[];
  teachers: Teacher[];
  questions: Question[];
  onRefresh: () => void;
  onNavigateToLive: (examId: string) => void;
}

export const ExamPackagesView: React.FC<ExamPackagesViewProps> = ({
  exams,
  subjects,
  classes,
  teachers,
  questions,
  onRefresh,
  onNavigateToLive
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedExamForPreview, setSelectedExamForPreview] = useState<ExamPackage | null>(null);
  const [editingItem, setEditingItem] = useState<ExamPackage | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('Sumatif Akhir Semester');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [gradeLevel, setGradeLevel] = useState(6);
  const [targetClassIds, setTargetClassIds] = useState<string[]>(['cls_6a']);
  const [authorTeacherId, setAuthorTeacherId] = useState(teachers[0]?.id || '');
  const [proctorTeacherId, setProctorTeacherId] = useState(teachers[1]?.id || teachers[0]?.id || '');
  const [startDate, setStartDate] = useState('2025-06-02');
  const [endDate, setEndDate] = useState('2025-06-02');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [token, setToken] = useState('PASER25');
  const [kktp, setKktp] = useState(75);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [allowReviewAfterExam, setAllowReviewAfterExam] = useState(true);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published' | 'ongoing' | 'completed'>('published');
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('Sumatif Akhir Semester ' + (subjects[0]?.name || 'Fikih') + ' Kelas 6');
    setAssessmentType('Sumatif Akhir Semester');
    setSubjectId(subjects[0]?.id || '');
    setGradeLevel(6);
    setTargetClassIds(classes.filter((c) => c.level === 6).map((c) => c.id));
    setAuthorTeacherId(teachers[0]?.id || '');
    setProctorTeacherId(teachers[1]?.id || teachers[0]?.id || '');
    setStartDate('2025-06-02');
    setEndDate('2025-06-02');
    setStartTime('07:30');
    setEndTime('09:00');
    setDurationMinutes(60);
    setToken('TOKEN' + Math.floor(10 + Math.random() * 90));
    setKktp(75);
    setShuffleQuestions(true);
    setShuffleOptions(true);
    setAllowReviewAfterExam(true);
    setSelectedQuestionIds(questions.slice(0, 5).map((q) => q.id));
    setStatus('published');
    setShowModal(true);
  };

  const handleOpenEdit = (item: ExamPackage) => {
    setEditingItem(item);
    setTitle(item.title);
    setAssessmentType(item.assessmentType);
    setSubjectId(item.subjectId);
    setGradeLevel(item.gradeLevel);
    setTargetClassIds(item.targetClassIds || []);
    setAuthorTeacherId(item.authorTeacherId);
    setProctorTeacherId(item.proctorTeacherId || '');
    setStartDate(item.startDate);
    setEndDate(item.endDate);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setDurationMinutes(item.durationMinutes);
    setToken(item.token);
    setKktp(item.kktp);
    setShuffleQuestions(item.shuffleQuestions);
    setShuffleOptions(item.shuffleOptions);
    setAllowReviewAfterExam(item.allowReviewAfterExam);
    setSelectedQuestionIds(item.questionIds || []);
    setStatus(item.status as any);
    setShowModal(true);
  };

  const handleToggleQuestionSelect = (qId: string) => {
    if (selectedQuestionIds.includes(qId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== qId));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, qId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      alert('Pilih minimal 1 butir soal untuk paket ujian ini.');
      return;
    }

    setSaving(true);
    try {
      const sub = subjects.find((s) => s.id === subjectId);
      const author = teachers.find((t) => t.id === authorTeacherId);
      const proctor = teachers.find((t) => t.id === proctorTeacherId);
      const targetClassNames = classes.filter((c) => targetClassIds.includes(c.id)).map((c) => c.name);

      await api.saveExam({
        id: editingItem?.id,
        title,
        assessmentType,
        subjectId,
        subjectName: sub?.name || 'Mata Pelajaran',
        gradeLevel,
        targetClassIds,
        targetClassNames,
        authorTeacherId,
        authorName: author?.name || 'Guru Madrasah',
        proctorTeacherId,
        proctorName: proctor?.name || 'Pengawas CBT',
        startDate,
        endDate,
        startTime,
        endTime,
        durationMinutes: Number(durationMinutes),
        token: token.toUpperCase(),
        kktp: Number(kktp),
        totalQuestions: selectedQuestionIds.length,
        totalScore: selectedQuestionIds.length,
        shuffleQuestions,
        shuffleOptions,
        allowReviewAfterExam,
        questionIds: selectedQuestionIds,
        status
      });

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan paket ujian');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus paket ujian ini? Seluruh sesi peserta terkait akan dihapus.')) {
      await api.deleteExam(id);
      onRefresh();
    }
  };

  const handlePreview = (exam: ExamPackage) => {
    setSelectedExamForPreview(exam);
    setShowPreviewModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-400" />
            Paket Ujian CBT Madrasah
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi paket asesmen sumatif/formatif, token ujian, durasi, acak soal, dan penetapan peserta.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Paket Ujian</span>
        </button>
      </div>

      {/* Exam cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {exam.assessmentType}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    exam.status === 'ongoing'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                      : exam.status === 'published'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {exam.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{exam.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Mapel: <span className="text-slate-200 font-semibold">{exam.subjectName}</span> • Kelas {exam.gradeLevel} MI
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-3 mt-3 border-t border-slate-800/80">
                <div className="p-2 rounded-xl bg-slate-950/70">
                  <span className="text-[10px] text-slate-400 block">Durasi</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-amber-400" /> {exam.durationMinutes} Menit
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/70">
                  <span className="text-[10px] text-slate-400 block">Token CBT</span>
                  <span className="font-mono font-extrabold text-amber-400 flex items-center gap-1 mt-0.5">
                    <Key className="w-3 h-3" /> {exam.token}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/70">
                  <span className="text-[10px] text-slate-400 block">Jumlah Soal</span>
                  <span className="font-bold text-white mt-0.5 block">
                    {exam.questionIds?.length || exam.totalQuestions || 0} Butir
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/70">
                  <span className="text-[10px] text-slate-400 block">KKTP Acuan</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">
                    {exam.kktp}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">
                Pengawas: {exam.proctorName || 'Bpk. H. Ruslan Effendi'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePreview(exam)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Preview Paket Ujian"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateToLive(exam.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 font-semibold transition cursor-pointer"
                >
                  Live Monitor
                </button>
                <button
                  onClick={() => handleOpenEdit(exam)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Exam */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-base font-bold text-white mb-4">
              {editingItem ? 'Edit Konfigurasi Paket Ujian' : 'Buat Paket Ujian CBT Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama / Judul Ujian</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jenis Asesmen</label>
                  <select
                    value={assessmentType}
                    onChange={(e: any) => setAssessmentType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Asesmen Harian">Asesmen Harian</option>
                    <option value="Sumatif Lingkup Materi">Sumatif Lingkup Materi</option>
                    <option value="Sumatif Tengah Semester">Sumatif Tengah Semester</option>
                    <option value="Sumatif Akhir Semester">Sumatif Akhir Semester</option>
                    <option value="Ujian Madrasah">Ujian Madrasah</option>
                    <option value="Try Out">Try Out</option>
                    <option value="Ujian Praktik">Ujian Praktik</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Mata Pelajaran</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tingkat Kelas</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((l) => (
                      <option key={l} value={l}>Kelas {l} MI</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Token Ujian</label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none font-mono font-bold text-amber-400 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Batas KKTP</label>
                  <input
                    type="number"
                    value={kktp}
                    onChange={(e) => setKktp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status Ujian</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="published">Published (Siap)</option>
                    <option value="ongoing">Ongoing (Sedang Berjalan)</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Soal Selector from Bank Soal */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">
                    Pilih Butir Soal ({selectedQuestionIds.length} Terpilih)
                  </label>
                  <span className="text-[11px] text-amber-400">
                    Total Soal di Bank: {questions.length}
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto bg-slate-950 border border-slate-700 rounded-xl p-3 space-y-2 custom-scrollbar">
                  {questions.map((q) => (
                    <label
                      key={q.id}
                      className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.includes(q.id)}
                        onChange={() => handleToggleQuestionSelect(q.id)}
                        className="rounded text-amber-500 focus:ring-amber-400 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 uppercase font-bold">
                            {q.type.replace('_', ' ')}
                          </span>
                          <span>Level: {q.cognitiveLevel}</span>
                          <span>Bobot: {q.weight || 1}</span>
                        </div>
                        <div className="text-white text-xs font-medium mt-1 line-clamp-2">
                          {q.prompt}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options switches */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Acak Urutan Soal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Acak Pilihan Jawaban</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={allowReviewAfterExam}
                    onChange={(e) => setAllowReviewAfterExam(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Publikasi Nilai ke Siswa</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Paket Ujian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Paket Ujian */}
      {showPreviewModal && selectedExamForPreview && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedExamForPreview.title}</h3>
                <p className="text-xs text-slate-400">
                  Preview Naskah Paket Asesmen Sebelum Dipublikasikan
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {questions
                .filter((q) => (selectedExamForPreview.questionIds || []).includes(q.id))
                .map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">No. {idx + 1}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 uppercase">
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>
                    {q.stimulus && (
                      <div className="p-2.5 rounded-lg bg-slate-900 text-slate-300 italic">
                        {q.stimulus}
                      </div>
                    )}
                    <div className="text-white font-medium">{q.prompt}</div>
                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 pt-1 text-slate-300">
                        {q.options.map((opt) => (
                          <div key={opt.key} className="p-1.5 rounded bg-slate-900 text-[11px]">
                            <span className="font-bold text-amber-400 mr-1">{opt.key}.</span> {opt.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
