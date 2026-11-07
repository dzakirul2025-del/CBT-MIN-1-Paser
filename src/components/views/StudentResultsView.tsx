/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, CheckCircle2, XCircle, BookOpen, Clock } from 'lucide-react';
import { ExamResult } from '../../types/index.ts';

interface StudentResultsViewProps {
  results: ExamResult[];
  currentUser: any;
}

export const StudentResultsView: React.FC<StudentResultsViewProps> = ({
  results,
  currentUser
}) => {
  const studentResults = results.filter((r) => r.studentId === currentUser.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Riwayat Asesmen & Nilai CBT Siswa
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Daftar ujian yang telah Anda selesaikan, perolehan skor akhir, dan status ketuntasan KKTP madrasah.
        </p>
      </div>

      {studentResults.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">Belum Ada Riwayat Ujian</h3>
          <p className="text-xs text-slate-400 mt-1">
            Anda belum menyelesaikan sesi ujian CBT. Masuk ke menu "Ruang Ujian CBT" untuk memulai ujian.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {studentResults.map((res) => (
            <div
              key={res.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{res.examTitle}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    {res.subjectName}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span>Benar: <strong className="text-emerald-400">{res.correctAnswersCount}</strong></span>
                  <span>Salah: <strong className="text-rose-400">{res.wrongAnswersCount}</strong></span>
                  <span>Kosong: {res.unansweredCount}</span>
                  <span>Waktu Kirim: {new Date(res.submittedAt).toLocaleDateString('id-ID')}</span>
                </div>

                {res.teacherNotes && (
                  <div className="p-2.5 rounded-xl bg-slate-950 text-slate-300 text-xs mt-3 italic">
                    Catatan Guru: "{res.teacherNotes}"
                  </div>
                )}
              </div>

              <div className="text-right flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <div className="text-3xl font-extrabold text-amber-400 font-mono">
                  {res.finalGrade}
                </div>
                <div className="mt-1">
                  {res.isPassed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> TUNTAS (≥{res.kktp})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <XCircle className="w-3 h-3" /> REMEDIAL (&lt;{res.kktp})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
