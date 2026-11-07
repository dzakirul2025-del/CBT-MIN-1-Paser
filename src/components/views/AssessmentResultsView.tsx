/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  Download,
  FileSpreadsheet,
  Check,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ExamResult, ExamPackage } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface AssessmentResultsViewProps {
  results: ExamResult[];
  exams: ExamPackage[];
  onRefresh: () => void;
}

export const AssessmentResultsView: React.FC<AssessmentResultsViewProps> = ({
  results,
  exams,
  onRefresh
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedResultForGrading, setSelectedResultForGrading] = useState<ExamResult | null>(null);
  const [essayScoreInput, setEssayScoreInput] = useState<number>(3);
  const [teacherNotesInput, setTeacherNotesInput] = useState<string>('');
  const [gradingSaving, setGradingSaving] = useState(false);

  const filteredResults = results.filter((r) => {
    const matchesExam = selectedExamId === 'all' || r.examId === selectedExamId;
    const matchesSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentNisn.includes(search) ||
      r.examTitle.toLowerCase().includes(search.toLowerCase());
    return matchesExam && matchesSearch;
  });

  const handleOpenGradeModal = (res: ExamResult) => {
    setSelectedResultForGrading(res);
    setEssayScoreInput(res.scoreBreakdown?.esaiScore || 3);
    setTeacherNotesInput(res.teacherNotes || 'Pemahaman konsep materi sudah baik. Pertahankan ketelitian dalam menjawab.');
  };

  const handleSaveEssayGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResultForGrading) return;
    setGradingSaving(true);
    try {
      await api.gradeEssay(
        selectedResultForGrading.id,
        Number(essayScoreInput),
        teacherNotesInput
      );
      setSelectedResultForGrading(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan penilaian');
    } finally {
      setGradingSaving(false);
    }
  };

  const handleExportResultsExcel = () => {
    const exportData = filteredResults.map((r, i) => ({
      No: i + 1,
      'Nama Siswa': r.studentName,
      NISN: r.studentNisn,
      Kelas: r.className,
      Ujian: r.examTitle,
      'Mata Pelajaran': r.subjectName,
      'Skor Perolehan': r.totalScore,
      'Skor Maksimal': r.maxScore,
      'Nilai Akhir (0-100)': r.finalGrade,
      'KKTP': r.kktp,
      'Status Ketuntasan': r.isPassed ? 'TUNTAS' : 'REMEDIAL',
      'Benar': r.correctAnswersCount,
      'Salah': r.wrongAnswersCount,
      'Kosong': r.unansweredCount,
      'Catatan Guru': r.teacherNotes || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hasil Asesmen');
    XLSX.writeFile(wb, `Rekap_Nilai_CBT_MIN1Paser_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Hasil Asesmen & Penilaian CBT
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rekap perolehan nilai, ketuntasan KKTP madrasah, koreksi otomatis, dan penilaian manual esai berbasis rubrik.
          </p>
        </div>
        <button
          onClick={handleExportResultsExcel}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Rekap Nilai Excel</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa atau nama ujian..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="all">Semua Paket Ujian ({results.length})</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title}
            </option>
          ))}
        </select>
      </div>

      {/* Table Results */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Nama Siswa / NISN</th>
              <th className="py-3 px-4">Paket Asesmen</th>
              <th className="py-3 px-4">Jawaban (B/S/K)</th>
              <th className="py-3 px-4">Nilai Akhir</th>
              <th className="py-3 px-4">Ketuntasan KKTP</th>
              <th className="py-3 px-4">Penilaian Esai</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredResults.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white text-sm">{r.studentName}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{r.studentNisn} • {r.className}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-white">{r.examTitle}</div>
                  <div className="text-[11px] text-amber-400">{r.subjectName}</div>
                </td>
                <td className="py-3.5 px-4 text-[11px]">
                  <span className="text-emerald-400 font-bold">{r.correctAnswersCount} B</span> •{' '}
                  <span className="text-rose-400 font-bold">{r.wrongAnswersCount} S</span> •{' '}
                  <span className="text-slate-400">{r.unansweredCount} K</span>
                </td>
                <td className="py-3.5 px-4 font-mono">
                  <div className="text-base font-extrabold text-amber-400">{r.finalGrade}</div>
                  <div className="text-[10px] text-slate-400">Skor: {r.totalScore}/{r.maxScore}</div>
                </td>
                <td className="py-3.5 px-4">
                  {r.isPassed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> TUNTAS (≥{r.kktp})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <XCircle className="w-3 h-3" /> REMEDIAL (&lt;{r.kktp})
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {r.essayPendingGrading ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Perlu Dikoreksi
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold text-xs">
                      Ternilai ({r.scoreBreakdown?.esaiScore || 0} Poin)
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleOpenGradeModal(r)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Nilai Esai</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Manual Grading Rubric for Essay */}
      {selectedResultForGrading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit className="w-4 h-4 text-amber-400" />
              Penilaian Esai & Catatan Guru
            </h3>
            <p className="text-xs text-slate-300">
              Siswa: <span className="font-bold text-white">{selectedResultForGrading.studentName}</span> ({selectedResultForGrading.className})
            </p>

            <form onSubmit={handleSaveEssayGrade} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-300">
                <span className="font-bold text-amber-400 block">Rubrik Penilaian Esai Madrasah:</span>
                <p>• Skor 4: Argumentasi lengkap, tepat, mencerminkan pemahaman mendalam.</p>
                <p>• Skor 2-3: Menyebutkan sebagian besar poin jawaban dengan benar.</p>
                <p>• Skor 1: Jawaban kurang lengkap atau kurang relevan.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Skor Perolehan Soal Esai (Maksimal 4 Poin)
                </label>
                <input
                  type="number"
                  min={0}
                  max={4}
                  value={essayScoreInput}
                  onChange={(e) => setEssayScoreInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-base font-bold text-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Catatan Evaluasi / Umpan Balik Guru
                </label>
                <textarea
                  value={teacherNotesInput}
                  onChange={(e) => setTeacherNotesInput(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedResultForGrading(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={gradingSaving}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  {gradingSaving ? 'Menyimpan...' : 'Simpan Nilai & Perbarui'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
