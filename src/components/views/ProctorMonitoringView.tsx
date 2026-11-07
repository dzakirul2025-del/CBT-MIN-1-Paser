/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Eye,
  Radio,
  Clock,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Unlock,
  StopCircle,
  ShieldAlert,
  Search,
  CheckCircle2,
  WifiOff
} from 'lucide-react';
import { ExamPackage, StudentExamSession } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface ProctorMonitoringViewProps {
  exams: ExamPackage[];
  initialExamId?: string;
}

export const ProctorMonitoringView: React.FC<ProctorMonitoringViewProps> = ({
  exams,
  initialExamId
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || exams[0]?.id || '');
  const [exam, setExam] = useState<ExamPackage | null>(null);
  const [sessions, setSessions] = useState<StudentExamSession[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected session for extra time or terminate modal
  const [selectedSessionForAction, setSelectedSessionForAction] = useState<StudentExamSession | null>(null);
  const [actionType, setActionType] = useState<'extra_time' | 'terminate' | 'reset' | null>(null);
  const [extraMinutes, setExtraMinutes] = useState(10);
  const [terminateReason, setTerminateReason] = useState('Pelanggaran tata tertib ujian');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLiveMonitor = async () => {
    if (!selectedExamId) return;
    try {
      const data = await api.getLiveProctorData(selectedExamId);
      setExam(data.exam);
      setSessions(data.sessions || []);
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching live proctor data:', err);
    }
  };

  useEffect(() => {
    fetchLiveMonitor();
    const interval = setInterval(fetchLiveMonitor, 3000); // Polling every 3s
    return () => clearInterval(interval);
  }, [selectedExamId]);

  // Statistics
  const totalCount = sessions.length;
  const workingCount = sessions.filter((s) => s.status === 'working').length;
  const submittedCount = sessions.filter((s) => s.status === 'submitted').length;
  const interruptedCount = sessions.filter((s) => s.status === 'interrupted' || s.status === 'blocked').length;

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentNisn.includes(search) ||
      (s.className || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGrantExtraTime = async () => {
    if (!selectedSessionForAction) return;
    setActionLoading(true);
    try {
      await api.grantExtraTime(selectedSessionForAction.id, Number(extraMinutes));
      setActionType(null);
      fetchLiveMonitor();
    } catch (err: any) {
      alert(err.message || 'Gagal menambah waktu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetLogin = async (sess: StudentExamSession) => {
    if (confirm(`Izinkan ${sess.studentName} untuk masuk dan melanjutkan ujian kembali di perangkat baru?`)) {
      await api.resetStudentLogin(sess.id);
      fetchLiveMonitor();
    }
  };

  const handleTerminateSession = async () => {
    if (!selectedSessionForAction) return;
    setActionLoading(true);
    try {
      await api.terminateSession(selectedSessionForAction.id, terminateReason);
      setActionType(null);
      fetchLiveMonitor();
    } catch (err: any) {
      alert(err.message || 'Gagal menghentikan sesi');
    } finally {
      setActionLoading(false);
    }
  };

  const formatRemaining = (sec: number) => {
    if (sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            Monitoring Pengawas Realtime (Live Proctor)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pemantauan langsung status pengerjaan siswa, sisa waktu ujian, deteksi insiden/tab switch, dan kontrol intervensi pengawas.
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
                {ex.title} ({ex.token})
              </option>
            ))}
          </select>
          <button
            onClick={fetchLiveMonitor}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Proctor Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Total Peserta Terdaftar</span>
          <div className="text-2xl font-bold text-white mt-1">{totalCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Peserta aktif sesi ini</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-xl shadow-sm bg-emerald-500/5">
          <span className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Sedang Mengerjakan
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{workingCount}</div>
          <span className="text-[11px] text-emerald-400/80 mt-1 block font-medium">Aktif terhubung</span>
        </div>

        <div className="bg-slate-900/90 border border-blue-500/30 p-4 rounded-xl shadow-sm bg-blue-500/5">
          <span className="text-xs text-blue-300 font-medium">Sudah Selesai (Submit)</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{submittedCount}</div>
          <span className="text-[11px] text-blue-400/80 mt-1 block font-medium">Jawaban telah dikunci</span>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 p-4 rounded-xl shadow-sm bg-amber-500/5">
          <span className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Kendala / Terputus
          </span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{interruptedCount}</div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">Perlu bantuan reset login</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari peserta berdasarkan nama atau NISN..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="all">Semua Status Peserta ({sessions.length})</option>
          <option value="working">Sedang Mengerjakan</option>
          <option value="submitted">Sudah Selesai</option>
          <option value="interrupted">Terputus / Perlu Reset</option>
        </select>
      </div>

      {/* Proctor Live Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Nama Siswa / NISN</th>
              <th className="py-3 px-4">Kelas</th>
              <th className="py-3 px-4">Status Peserta</th>
              <th className="py-3 px-4">Progres Soal</th>
              <th className="py-3 px-4">Sisa Waktu</th>
              <th className="py-3 px-4">Peringatan Tab</th>
              <th className="py-3 px-4 text-right">Kontrol Pengawas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredSessions.map((sess) => {
              const totalQ = exam?.totalQuestions || 6;
              const answered = sess.answeredCount || 0;
              const percent = Math.min(100, Math.round((answered / totalQ) * 100));

              return (
                <tr key={sess.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{sess.studentName}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{sess.studentNisn}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-300">
                    {sess.className}
                  </td>
                  <td className="py-3.5 px-4">
                    {sess.status === 'working' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Mengerjakan
                      </span>
                    ) : sess.status === 'submitted' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <WifiOff className="w-3 h-3" /> Terputus
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-36">
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span className="text-white">{answered} / {totalQ} Soal</span>
                        <span className="text-amber-400">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {sess.status === 'submitted' ? (
                      <span className="text-slate-400 text-xs">Selesai</span>
                    ) : (
                      <span className={sess.remainingSeconds < 300 ? 'text-rose-400' : 'text-amber-400'}>
                        {formatRemaining(sess.remainingSeconds)}
                      </span>
                    )}
                    {sess.extraTimeGrantedMinutes > 0 && (
                      <span className="block text-[10px] text-emerald-400">
                        (+{sess.extraTimeGrantedMinutes}m)
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {sess.tabSwitchCount > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {sess.tabSwitchCount}x Pindah Tab
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Normal</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {sess.status !== 'submitted' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedSessionForAction(sess);
                            setActionType('extra_time');
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
                          title="Tambah Waktu Ujian"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetLogin(sess)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                          title="Reset Akses Login (Ganti Perangkat)"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSessionForAction(sess);
                            setActionType('terminate');
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                          title="Hentikan Sesi Ujian"
                        >
                          <StopCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Proctor Incident Log */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Catatan Kejadian & Log Insiden Pengawasan
        </h3>
        <div className="divide-y divide-slate-800 text-xs">
          {logs.length === 0 ? (
            <div className="py-3 text-slate-400 italic">Belum ada kejadian tercatat selama sesi ini.</div>
          ) : (
            logs.map((log: any) => (
              <div key={log.id} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-white font-semibold">{log.incident_type}:</span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {new Date(log.logged_at).toLocaleTimeString('id-ID')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Add Extra Time */}
      {actionType === 'extra_time' && selectedSessionForAction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Tambah Waktu Ujian Peserta
            </h3>
            <p className="text-xs text-slate-300">
              Berikan perpanjangan durasi untuk peserta <span className="font-bold text-amber-400">{selectedSessionForAction.studentName}</span>
            </p>
            <div className="flex justify-center gap-2">
              {[5, 10, 15, 30].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setExtraMinutes(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    extraMinutes === m
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  +{m} Menit
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleGrantExtraTime}
                className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                {actionLoading ? 'Menyimpan...' : 'Tambahkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Terminate Session */}
      {actionType === 'terminate' && selectedSessionForAction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white text-center">
              Hentikan Sesi Ujian Secara Paksa
            </h3>
            <p className="text-xs text-slate-300 text-center">
              Sesi peserta <span className="font-bold text-rose-400">{selectedSessionForAction.studentName}</span> akan langsung diselesaikan dan dikunci.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alasan Penghentian</label>
              <textarea
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleTerminateSession}
                className="px-4 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs"
              >
                {actionLoading ? 'Memproses...' : 'Hentikan Sesi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
