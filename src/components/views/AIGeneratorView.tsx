/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit,
  Save,
  Check,
  History,
  FileQuestion,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { Subject, Question, QuestionBank, CognitiveLevel, Difficulty, QuestionType } from '../../types/index.ts';
import { MathRenderer } from '../common/MathRenderer.tsx';
import { api } from '../../lib/api.ts';

interface AIGeneratorViewProps {
  subjects: Subject[];
  questionBanks: QuestionBank[];
  onRefresh: () => void;
  onNavigateToBank: () => void;
}

export const AIGeneratorView: React.FC<AIGeneratorViewProps> = ({
  subjects,
  questionBanks,
  onRefresh,
  onNavigateToBank
}) => {
  // Generator Form state
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'Fikih');
  const [gradeLevel, setGradeLevel] = useState(6);
  const [topic, setTopic] = useState('Ketentuan Ibadah Qurban dan Hikmah Pensyariatannya');
  const [learningObjective, setLearningObjective] = useState('Menganalisis syarat, rukun, dan hikmah ibadah qurban dalam kehidupan bermasyarakat di Paser');
  const [indicator, setIndicator] = useState('Disajikan stimulus kontekstual, siswa dapat menentukan syarat sah hewan qurban dan hikmah sosialnya');
  const [questionCount, setQuestionCount] = useState(4);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['pilihan_ganda', 'pilihan_ganda_kompleks', 'esai']);
  const [difficulty, setDifficulty] = useState<Difficulty>('Sedang');
  const [cognitiveLevel, setCognitiveLevel] = useState<CognitiveLevel>('C4');
  const [includeStimulus, setIncludeStimulus] = useState(true);

  // Workflow Stages: 1. Generate -> 2. Preview -> 3. Validate -> 4. Edit -> 5. Approve -> 6. Save
  const [stage, setStage] = useState<'form' | 'preview' | 'approved'>('form');
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [targetBankId, setTargetBankId] = useState(questionBanks[0]?.id || '');
  const [sourceEngine, setSourceEngine] = useState<string>('');
  const [error, setError] = useState('');
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savingToBank, setSavingToBank] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGenerating(true);

    try {
      const res = await api.generateQuestionsAI({
        subject: selectedSubject,
        gradeLevel,
        topic,
        learningObjective,
        indicator,
        count: Number(questionCount),
        questionTypes: selectedTypes,
        difficulty,
        cognitiveLevel,
        includeStimulus
      });

      setGeneratedQuestions(res.questions || []);
      setSourceEngine(res.source || 'gemini');
      setStage('preview');
    } catch (err: any) {
      setError(err.message || 'Gagal memanggil AI generator');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleType = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    const updated = [...generatedQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedQuestions(updated);
  };

  const handleApproveAll = () => {
    const approved = generatedQuestions.map((q) => ({ ...q, isValidated: true }));
    setGeneratedQuestions(approved);
  };

  const handleSaveToBank = async () => {
    if (!targetBankId) {
      alert('Pilih bank soal tujuan penyimpanan!');
      return;
    }
    setSavingToBank(true);

    try {
      for (const q of generatedQuestions) {
        await api.saveQuestion({
          ...q,
          bankId: targetBankId,
          isValidated: true
        });
      }
      setStage('approved');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan soal ke bank soal');
    } finally {
      setSavingToBank(false);
    }
  };

  const handleLoadHistory = async () => {
    setShowHistory(true);
    try {
      const list = await api.getAIHistory();
      setHistoryList(list);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Generator Soal AI (Gemini Server-Side)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pembuat butir soal kurikulum Madrasah Ibtidaiyah berbasis AI. Otomatisasi HOTS C1-C6, stimulus kontekstual, dan validasi guru.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadHistory}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Riwayat Pembuatan AI</span>
          </button>
        </div>
      </div>

      {/* 6 Stages Progress Tracker as requested in Section 8 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Tahapan Standar Pembuatan Soal AI Madrasah:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
          {[
            { num: 1, label: '1. Form Input', active: stage === 'form' },
            { num: 2, label: '2. Generate AI', active: generating },
            { num: 3, label: '3. Preview Soal', active: stage === 'preview' },
            { num: 4, label: '4. Validasi Guru', active: stage === 'preview' && generatedQuestions.some((q) => q.isValidated) },
            { num: 5, label: '5. Persetujuan', active: stage === 'approved' },
            { num: 6, label: '6. Simpan ke Bank', active: stage === 'approved' }
          ].map((st) => (
            <div
              key={st.num}
              className={`p-2 rounded-xl text-center border font-semibold transition ${
                st.active
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800'
              }`}
            >
              {st.label}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stage 1: Form Generator */}
      {stage === 'form' && (
        <form onSubmit={handleGenerate} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Mata Pelajaran</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tingkat Kelas MI</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((l) => (
                  <option key={l} value={l}>Kelas {l} Madrasah Ibtidaiyah</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Jumlah Butir Soal (Batch 1-20)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none font-bold text-amber-400"
                required
              />
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Materi Pokok / Topik Pembahasan</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Operasi Pecahan Desimal atau Syarat Ibadah Qurban"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tujuan Pembelajaran</label>
                <input
                  type="text"
                  value={learningObjective}
                  onChange={(e) => setLearningObjective(e.target.value)}
                  placeholder="Rumusan tujuan capaian pembelajaran siswa"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Indikator Soal</label>
                <input
                  type="text"
                  value={indicator}
                  onChange={(e) => setIndicator(e.target.value)}
                  placeholder="Deskripsi perilaku yang diukur pada butir soal"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tipe Soal & Cognitive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-800">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Tipe Soal yang Diinginkan</label>
              <div className="space-y-1.5">
                {[
                  { id: 'pilihan_ganda', label: 'Pilihan Ganda (PG)' },
                  { id: 'pilihan_ganda_kompleks', label: 'Pilihan Ganda Kompleks' },
                  { id: 'benar_salah', label: 'Benar / Salah' },
                  { id: 'isian_singkat', label: 'Isian Singkat' },
                  { id: 'esai', label: 'Esai / Uraian HOTS' }
                ].map((item: any) => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(item.id)}
                      onChange={() => handleToggleType(item.id)}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Level Kognitif Target</label>
              <select
                value={cognitiveLevel}
                onChange={(e: any) => setCognitiveLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="C1">C1 – Mengingat Fakta</option>
                <option value="C2">C2 – Memahami Konsep</option>
                <option value="C3">C3 – Mengaplikasikan</option>
                <option value="C4">C4 – Menganalisis (HOTS Standar Kemenag)</option>
                <option value="C5">C5 – Mengevaluasi (HOTS Tinggi)</option>
                <option value="C6">C6 – Mengkreasi / Pemecahan Masalah</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Tingkat Kesukaran</label>
              <select
                value={difficulty}
                onChange={(e: any) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="Mudah">Mudah</option>
                <option value="Sedang">Sedang</option>
                <option value="Sukar">Sukar</option>
              </select>

              <div className="mt-3">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeStimulus}
                    onChange={(e) => setIncludeStimulus(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="font-medium text-amber-300">Sertakan Wacana / Stimulus Kontekstual</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              disabled={generating}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Memproses Pembuatan Soal AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Butir Soal AI Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Stage 2 & 3 & 4: Preview, Validate, Edit */}
      {stage === 'preview' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Hasil Generator Soal ({generatedQuestions.length} Butir Soal Siap)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono">
                  Engine: {sourceEngine.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Silakan lakukan peninjauan (preview), koreksi teks/kunci jika perlu, dan berikan validasi guru sebelum disimpan ke Bank Soal.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setStage('form')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Ubah Parameter
              </button>
              <button
                type="button"
                onClick={handleApproveAll}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Validasi Semua Soal
              </button>
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className={`bg-slate-900/90 border rounded-2xl p-5 shadow-sm space-y-3 transition ${
                  q.isValidated ? 'border-emerald-500/40' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-200">
                      {q.type.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300">
                      {q.cognitiveLevel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300">
                      Kesukaran: {q.difficulty}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpdateQuestion(idx, 'isValidated', !q.isValidated)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                      q.isValidated
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{q.isValidated ? 'Tervalidasi' : 'Beri Validasi'}</span>
                  </button>
                </div>

                {/* Stimulus Edit / Display */}
                {q.stimulus && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                    <span className="font-bold text-amber-400 block mb-1">Stimulus Wacana:</span>
                    <MathRenderer content={q.stimulus} />
                  </div>
                )}

                {/* Prompt */}
                <div className="text-sm font-semibold text-white">
                  <MathRenderer content={q.prompt} />
                </div>

                {/* Options preview */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt) => {
                      const isCorrect =
                        String(opt.key).toUpperCase() === String(q.correctAnswer).toUpperCase() ||
                        (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt.key));
                      return (
                        <div
                          key={opt.key}
                          className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                            isCorrect
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="flex-1">
                            <MathRenderer content={opt.text} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Answer key & explanation */}
                <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-emerald-400 mr-1">Kunci Jawaban:</span>
                    <span className="font-semibold text-white">
                      {Array.isArray(q.correctAnswer)
                        ? q.correctAnswer.join(', ')
                        : typeof q.correctAnswer === 'object'
                        ? JSON.stringify(q.correctAnswer)
                        : String(q.correctAnswer)}
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

          {/* Action Bar: Target Bank & Save */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-300">Pilih Bank Soal Tujuan:</span>
              <select
                value={targetBankId}
                onChange={(e) => setTargetBankId(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none cursor-pointer"
              >
                {questionBanks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.subjectName} - Kelas {b.gradeLevel})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSaveToBank}
              disabled={savingToBank}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingToBank ? 'Menyimpan...' : 'Setujui & Simpan ke Bank Soal'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Stage 5 & 6 Success Screen */}
      {stage === 'approved' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Soal Berhasil Disimpan ke Bank Soal!</h3>
          <p className="text-xs text-slate-400">
            Seluruh {generatedQuestions.length} butir soal telah berhasil divalidasi dan tersimpan di Bank Soal MIN 1 Paser. Anda dapat memasukkannya ke dalam Paket Ujian Asesmen.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setStage('form');
                setGeneratedQuestions([]);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Buat Soal Lain
            </button>
            <button
              onClick={onNavigateToBank}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Buka Bank Soal
            </button>
          </div>
        </div>
      )}

      {/* Modal History */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                Riwayat Pembuatan Soal AI
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {historyList.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-400">{item.promptParams?.subject} (Kelas {item.promptParams?.gradeLevel})</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-white font-medium">{item.promptParams?.topic}</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    Jumlah: {item.generatedCount} Soal • Level: {item.promptParams?.cognitiveLevel} • Status: {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
