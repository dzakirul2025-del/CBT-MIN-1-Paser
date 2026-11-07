/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Clock, Key, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { ExamPackage } from '../../types/index.ts';

interface ExamScheduleViewProps {
  exams: ExamPackage[];
  onNavigateToLive: (examId: string) => void;
}

export const ExamScheduleView: React.FC<ExamScheduleViewProps> = ({
  exams,
  onNavigateToLive
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredExams = exams.filter((e) => {
    if (filterStatus === 'all') return true;
    return e.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Jadwal Pelaksanaan Asesmen CBT
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kalender jadwal sesi asesmen, token aktif, ruang kelas peserta, dan kesiapan pengawasan.
          </p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer self-start sm:self-auto"
        >
          <option value="all">Semua Status Jadwal</option>
          <option value="ongoing">Sedang Berlangsung (Live)</option>
          <option value="published">Siap Dimulai</option>
          <option value="completed">Telah Selesai</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredExams.map((exam) => {
          const isOngoing = exam.status === 'ongoing';
          return (
            <div
              key={exam.id}
              className={`p-5 rounded-2xl border transition shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isOngoing
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-emerald-500/5'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                    isOngoing
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-amber-400 border-slate-700'
                  }`}
                >
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-white">{exam.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isOngoing
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {exam.status === 'ongoing' ? 'Sedang Berlangsung' : exam.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" /> {exam.subjectName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-400" /> Kelas {exam.gradeLevel} MI (
                      {(exam.targetClassNames || []).join(', ')})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> {exam.startTime} - {exam.endTime} ({exam.durationMinutes} Menit)
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side token & Action */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                    Token Peserta
                  </span>
                  <span className="font-mono text-base font-extrabold text-amber-400 tracking-wider">
                    {exam.token}
                  </span>
                </div>
                <button
                  onClick={() => onNavigateToLive(exam.id)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  <span>Pantau Ujian</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
