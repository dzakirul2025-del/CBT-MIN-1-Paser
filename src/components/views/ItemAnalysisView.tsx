/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { ExamPackage, ItemAnalysisData } from '../../types/index.ts';
import { MathRenderer } from '../common/MathRenderer.tsx';
import { api } from '../../lib/api.ts';

interface ItemAnalysisViewProps {
  exams: ExamPackage[];
}

export const ItemAnalysisView: React.FC<ItemAnalysisViewProps> = ({ exams }) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [analysisData, setAnalysisData] = useState<ItemAnalysisData[]>([]);
  const [hasSufficientData, setHasSufficientData] = useState<boolean>(true);
  const [respondentsCount, setRespondentsCount] = useState<number>(0);
  const [msg, setMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAnalysis = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    try {
      const res = await api.getItemAnalysis(selectedExamId);
      setHasSufficientData(res.hasSufficientData);
      setRespondentsCount(res.totalRespondents || 0);
      setAnalysisData(res.analysis || []);
      setMsg(res.message || '');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [selectedExamId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Analisis Kualitas Butir Soal Asesmen
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Parameter psikometrik asesmen: Tingkat Kesukaran ($P$), Daya Pembeda ($D$), Efektivitas Pengecoh Opsi, dan Rekomendasi Butir Soal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none font-semibold cursor-pointer"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
          <button
            onClick={fetchAnalysis}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            title="Refresh Analisis"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Card on Statistical Formulas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="font-bold text-amber-400 block mb-1">Tingkat Kesukaran (P):</span>
          <div className="text-[11px] text-slate-400">
            <MathRenderer content="P = B / N (Rasio jawaban benar terhadap total siswa). Sukar (<0.3), Sedang (0.3 - 0.7), Mudah (>0.7)." />
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="font-bold text-blue-400 block mb-1">Daya Pembeda (D):</span>
          <div className="text-[11px] text-slate-400">
            <MathRenderer content="D = (B_A - B_B) / (0.5 * N). Sangat Baik (≥0.4), Baik (0.3-0.39), Cukup (0.2-0.29), Jelek (<0.2)." />
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="font-bold text-emerald-400 block mb-1">Efektivitas Pengecoh:</span>
          <p className="text-[11px] text-slate-400">
            Pengecoh berfungsi efektif bila dipilih sekurang-kurangnya 5% dari total peserta ujian.
          </p>
        </div>
      </div>

      {!hasSufficientData ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Data Respons Belum Mencukupi</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {msg || 'Analisis butir soal memerlukan data jawaban siswa yang telah disubmit untuk menghitung kesukaran dan daya pembeda.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Soal</th>
                <th className="py-3 px-4">Pertanyaan / Butir</th>
                <th className="py-3 px-4">Tingkat Kesukaran (P)</th>
                <th className="py-3 px-4">Daya Pembeda (D)</th>
                <th className="py-3 px-4">Pola Jawaban Pengecoh</th>
                <th className="py-3 px-4 text-right">Rekomendasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {analysisData.map((item) => (
                <tr key={item.questionId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-amber-400 text-sm">
                    No. {item.questionNumber}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="line-clamp-2 text-white font-medium">
                      <MathRenderer content={item.prompt} />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-white text-sm">{item.difficultyIndex}</div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                        item.difficultyCategory === 'Sedang'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.difficultyCategory === 'Mudah'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.difficultyCategory}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-white text-sm">{item.discriminationIndex}</div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                        item.discriminationCategory === 'Sangat Baik' || item.discriminationCategory === 'Baik'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.discriminationCategory === 'Cukup'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {item.discriminationCategory}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.distractorEfficiency.map((dist) => (
                        <span
                          key={dist.optionKey}
                          title={`${dist.isKey ? 'Kunci' : 'Pengecoh'}: ${dist.chosenPercentage}% siswa`}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            dist.isKey
                              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                              : dist.isEffective
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {dist.optionKey}:{dist.chosenPercentage}%
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                        item.recommendation === 'Diterima'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : item.recommendation === 'Revisi'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.recommendation === 'Diterima' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      <span>{item.recommendation}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
