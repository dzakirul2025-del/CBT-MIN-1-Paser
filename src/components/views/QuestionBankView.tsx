/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileQuestion,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  Code,
  Image,
  Table,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import {
  QuestionBank,
  Question,
  QuestionType,
  CognitiveLevel,
  Difficulty,
  Subject,
  Teacher
} from '../../types/index.ts';
import { MathRenderer } from '../common/MathRenderer.tsx';
import { api } from '../../lib/api.ts';

interface QuestionBankViewProps {
  questionBanks: QuestionBank[];
  questions: Question[];
  subjects: Subject[];
  teachers: Teacher[];
  onRefresh: () => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questionBanks,
  questions,
  subjects,
  teachers,
  onRefresh
}) => {
  const [selectedBankId, setSelectedBankId] = useState<string>(questionBanks[0]?.id || '');
  const [showBankModal, setShowBankModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Question bank form
  const [bankTitle, setBankTitle] = useState('');
  const [bankSubjectId, setBankSubjectId] = useState(subjects[0]?.id || '');
  const [bankGrade, setBankGrade] = useState(6);
  const [bankDesc, setBankDesc] = useState('');

  // Question editor form
  const [qType, setQType] = useState<QuestionType>('pilihan_ganda');
  const [qPrompt, setQPrompt] = useState('');
  const [qStimulus, setQStimulus] = useState('');
  const [qCognitive, setQCognitive] = useState<CognitiveLevel>('C3');
  const [qDifficulty, setQDifficulty] = useState<Difficulty>('Sedang');
  const [qWeight, setQWeight] = useState(1);
  const [qTopic, setQTopic] = useState('');
  const [qIndicator, setQIndicator] = useState('');
  const [qOptions, setQOptions] = useState([
    { key: 'A', text: '', matchTarget: '' },
    { key: 'B', text: '', matchTarget: '' },
    { key: 'C', text: '', matchTarget: '' },
    { key: 'D', text: '', matchTarget: '' }
  ]);
  const [qCorrectAnswer, setQCorrectAnswer] = useState('A');
  const [qExplanation, setQExplanation] = useState('');
  const [previewMath, setPreviewMath] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [saving, setSaving] = useState(false);

  const currentBank = questionBanks.find((b) => b.id === selectedBankId);
  const bankQuestions = questions.filter((q) => q.bankId === selectedBankId);

  const filteredQuestions = bankQuestions.filter((q) => {
    const matchesSearch =
      q.prompt.toLowerCase().includes(search.toLowerCase()) ||
      (q.topic || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.stimulus || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || q.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenAddBank = () => {
    setBankTitle('Bank Soal ' + (subjects[0]?.name || 'PAI') + ' Kelas 6');
    setBankSubjectId(subjects[0]?.id || '');
    setBankGrade(6);
    setBankDesc('Bank soal asesmen madrasah berstandar kurikulum nasional & Kemenag');
    setShowBankModal(true);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const sub = subjects.find((s) => s.id === bankSubjectId);
      const res = await api.saveQuestionBank({
        title: bankTitle,
        subjectId: bankSubjectId,
        subjectName: sub?.name || 'Mata Pelajaran',
        gradeLevel: bankGrade,
        authorId: teachers[0]?.id || 'admin',
        authorName: teachers[0]?.name || 'Guru Madrasah',
        description: bankDesc
      });
      setShowBankModal(false);
      onRefresh();
      setSelectedBankId(res.id);
    } catch (err: any) {
      alert(err.message || 'Gagal membuat bank soal');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (confirm('Yakin ingin menghapus Bank Soal ini beserta seluruh butir soal di dalamnya?')) {
      await api.deleteQuestionBank(id);
      onRefresh();
      if (selectedBankId === id) {
        setSelectedBankId(questionBanks.filter((b) => b.id !== id)[0]?.id || '');
      }
    }
  };

  const handleOpenAddQuestion = () => {
    if (!selectedBankId) {
      alert('Pilih atau buat bank soal terlebih dahulu.');
      return;
    }
    setEditingQuestion(null);
    setQType('pilihan_ganda');
    setQPrompt('');
    setQStimulus('');
    setQCognitive('C3');
    setQDifficulty('Sedang');
    setQWeight(1);
    setQTopic(currentBank?.subjectName || 'Materi Pokok');
    setQIndicator('');
    setQOptions([
      { key: 'A', text: '', matchTarget: '' },
      { key: 'B', text: '', matchTarget: '' },
      { key: 'C', text: '', matchTarget: '' },
      { key: 'D', text: '', matchTarget: '' }
    ]);
    setQCorrectAnswer('A');
    setQExplanation('');
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQType(q.type);
    setQPrompt(q.prompt);
    setQStimulus(q.stimulus || '');
    setQCognitive(q.cognitiveLevel);
    setQDifficulty(q.difficulty);
    setQWeight(q.weight || 1);
    setQTopic(q.topic || '');
    setQIndicator(q.indicator || '');
    setQOptions(
      q.options && q.options.length > 0
        ? q.options.map((o) => ({ key: o.key, text: o.text, matchTarget: o.matchTarget || '' }))
        : [
            { key: 'A', text: '', matchTarget: '' },
            { key: 'B', text: '', matchTarget: '' },
            { key: 'C', text: '', matchTarget: '' },
            { key: 'D', text: '', matchTarget: '' }
          ]
    );
    setQCorrectAnswer(
      Array.isArray(q.correctAnswer)
        ? q.correctAnswer.join(', ')
        : typeof q.correctAnswer === 'object'
        ? JSON.stringify(q.correctAnswer)
        : String(q.correctAnswer)
    );
    setQExplanation(q.explanation || '');
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Yakin ingin menghapus butir soal ini?')) {
      await api.deleteQuestion(id);
      onRefresh();
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalCorrect: any = qCorrectAnswer;
      if (qType === 'pilihan_ganda_kompleks') {
        finalCorrect = qCorrectAnswer.split(',').map((s) => s.trim().toUpperCase());
      } else if (qType === 'menjodohkan') {
        try {
          finalCorrect = JSON.parse(qCorrectAnswer);
        } catch {
          finalCorrect = qCorrectAnswer;
        }
      }

      await api.saveQuestion({
        id: editingQuestion?.id,
        bankId: selectedBankId,
        type: qType,
        prompt: qPrompt,
        stimulus: qStimulus,
        cognitiveLevel: qCognitive,
        difficulty: qDifficulty,
        weight: qWeight,
        topic: qTopic,
        indicator: qIndicator,
        options: qOptions,
        correctAnswer: finalCorrect,
        explanation: qExplanation
      });
      setShowQuestionModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan butir soal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-amber-400" />
            Bank Soal Madrasah
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bank butir soal terstruktur (10 Tipe Soal: Pilihan Ganda, Kompleks, Benar/Salah, Menjodohkan, Isian, Esai, Formula LaTeX, Wacana Stimulus).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddBank}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Buat Bank Soal</span>
          </button>
          <button
            onClick={handleOpenAddQuestion}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Butir Soal</span>
          </button>
        </div>
      </div>

      {/* Select Bank Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {questionBanks.map((bank) => (
          <button
            key={bank.id}
            onClick={() => setSelectedBankId(bank.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 cursor-pointer border ${
              selectedBankId === bank.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span>{bank.title}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedBankId === bank.id
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-slate-800 text-amber-400'
              }`}
            >
              {bank.totalQuestions || 0} Soal
            </span>
          </button>
        ))}
      </div>

      {/* Current Selected Bank Info Banner */}
      {currentBank && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{currentBank.title}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                Kelas {currentBank.gradeLevel} MI
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                {currentBank.subjectName}
              </span>
            </div>
            <p className="text-slate-400 mt-1">{currentBank.description || 'Penyusun: ' + currentBank.authorName}</p>
          </div>
          <button
            onClick={() => handleDeleteBank(currentBank.id)}
            className="p-1.5 text-xs text-rose-400 hover:bg-rose-500/15 rounded-lg border border-rose-500/30 transition self-start sm:self-auto cursor-pointer"
          >
            Hapus Bank Ini
          </button>
        </div>
      )}

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari dalam bank soal berdasarkan stimulus wacana, pertanyaan, atau materi..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="all">Semua Tipe Soal ({bankQuestions.length})</option>
          <option value="pilihan_ganda">Pilihan Ganda</option>
          <option value="pilihan_ganda_kompleks">Pilihan Ganda Kompleks</option>
          <option value="benar_salah">Benar / Salah</option>
          <option value="menjodohkan">Menjodohkan</option>
          <option value="isian_singkat">Isian Singkat</option>
          <option value="esai">Esai / Uraian</option>
        </select>
      </div>

      {/* Questions list */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          <FileQuestion className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">Belum ada butir soal di bank ini</p>
          <p className="text-xs text-slate-400 mt-1">
            Klik tombol "Tambah Butir Soal" atau gunakan "Generator Soal AI" untuk membuat soal otomatis berbasis kurikulum.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, index) => (
            <div
              key={q.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 font-extrabold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-200 border border-slate-700">
                    {q.type.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300">
                    {q.cognitiveLevel}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                    Tingkat: {q.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Bobot: {q.weight || 1} Poin
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditQuestion(q)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stimulus jika ada */}
              {q.stimulus && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 border-l-4 border-l-amber-400">
                  <span className="font-bold text-amber-400 block mb-1">Stimulus / Wacana:</span>
                  <MathRenderer content={q.stimulus} />
                </div>
              )}

              {/* Prompt / Soal */}
              <div className="text-sm font-semibold text-white">
                <MathRenderer content={q.prompt} />
              </div>

              {/* Options */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  {q.options.map((opt) => {
                    const isKey =
                      String(opt.key).toUpperCase() === String(q.correctAnswer).toUpperCase() ||
                      (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt.key));
                    return (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition ${
                          isKey
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-medium'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                            isKey ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <div className="flex-1">
                          <MathRenderer content={opt.text} />
                          {opt.matchTarget && (
                            <span className="text-[11px] text-amber-400 block mt-1">
                              Pasangan: {opt.matchTarget}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Correct Answer and Explanation */}
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-emerald-400 mr-1">Kunci Jawaban:</span>
                  <span className="font-semibold text-white">
                    {Array.isArray(q.correctAnswer)
                      ? q.correctAnswer.join(', ')
                      : typeof q.correctAnswer === 'object'
                      ? JSON.stringify(q.correctAnswer)
                      : q.correctAnswer}
                  </span>
                </div>
                {q.explanation && (
                  <div className="text-[11px] text-slate-400 italic">
                    Pembahasan: {q.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Bank Soal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Buat Bank Soal Baru</h3>
            <form onSubmit={handleSaveBank} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Judul Bank Soal</label>
                <input
                  type="text"
                  value={bankTitle}
                  onChange={(e) => setBankTitle(e.target.value)}
                  placeholder="Contoh: Bank Soal Fikih Kelas 6 SAS Genap"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Mata Pelajaran</label>
                  <select
                    value={bankSubjectId}
                    onChange={(e) => setBankSubjectId(e.target.value)}
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
                    value={bankGrade}
                    onChange={(e) => setBankGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((l) => (
                      <option key={l} value={l}>Kelas {l} MI</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Deskripsi / Keterangan</label>
                <textarea
                  value={bankDesc}
                  onChange={(e) => setBankDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Bank Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Question */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-base font-bold text-white mb-4">
              {editingQuestion ? 'Edit Butir Soal' : 'Tambah Butir Soal Baru'}
            </h3>
            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipe Soal</label>
                  <select
                    value={qType}
                    onChange={(e: any) => setQType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="pilihan_ganda">Pilihan Ganda (PG)</option>
                    <option value="pilihan_ganda_kompleks">Pilihan Ganda Kompleks</option>
                    <option value="benar_salah">Benar / Salah</option>
                    <option value="menjodohkan">Menjodohkan</option>
                    <option value="isian_singkat">Isian Singkat</option>
                    <option value="esai">Esai / Uraian</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Level Kognitif</label>
                  <select
                    value={qCognitive}
                    onChange={(e: any) => setQCognitive(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="C1">C1 - Mengingat</option>
                    <option value="C2">C2 - Memahami</option>
                    <option value="C3">C3 - Mengaplikasikan</option>
                    <option value="C4">C4 - Menganalisis (HOTS)</option>
                    <option value="C5">C5 - Mengevaluasi (HOTS)</option>
                    <option value="C6">C6 - Mencipta (HOTS)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tingkat Kesukaran</label>
                  <select
                    value={qDifficulty}
                    onChange={(e: any) => setQDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sukar">Sukar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Stimulus Wacana / Narasi (Opsional)
                </label>
                <textarea
                  value={qStimulus}
                  onChange={(e) => setQStimulus(e.target.value)}
                  rows={2}
                  placeholder="Konteks cerita, wacana islami, atau tabel stimulus..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">
                    {'Pertanyaan Soal (Dukung Notasi LaTeX seperti $x^2$ atau $\\frac{a}{b}$)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMath(!previewMath)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" /> {previewMath ? 'Sembunyikan Preview' : 'Preview KaTeX'}
                  </button>
                </div>
                <textarea
                  value={qPrompt}
                  onChange={(e) => setQPrompt(e.target.value)}
                  rows={3}
                  placeholder="Tuliskan pertanyaan di sini..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  required
                />
                {previewMath && qPrompt && (
                  <div className="mt-2 p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-white">
                    <span className="text-[10px] text-amber-400 font-bold block mb-1">Hasil KaTeX Render:</span>
                    <MathRenderer content={qPrompt} />
                  </div>
                )}
              </div>

              {/* Option fields for choice questions */}
              {(qType === 'pilihan_ganda' || qType === 'pilihan_ganda_kompleks' || qType === 'benar_salah') && (
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-300">Pilihan Jawaban</label>
                  {qOptions.map((opt, i) => (
                    <div key={opt.key} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0">
                        {opt.key}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...qOptions];
                          updated[i].text = e.target.value;
                          setQOptions(updated);
                        }}
                        placeholder={`Teks pilihan ${opt.key}`}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Kunci Jawaban Tepat
                  </label>
                  <input
                    type="text"
                    value={qCorrectAnswer}
                    onChange={(e) => setQCorrectAnswer(e.target.value)}
                    placeholder="Contoh: A, atau A, C untuk kompleks, atau kata kunci"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none font-bold text-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bobot Skor</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={qWeight}
                    onChange={(e) => setQWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Pembahasan / Rasional Jawaban</label>
                <textarea
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  rows={2}
                  placeholder="Penjelasan edukatif agar siswa dan guru dapat meninjau kebenaran soal..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Butir Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
