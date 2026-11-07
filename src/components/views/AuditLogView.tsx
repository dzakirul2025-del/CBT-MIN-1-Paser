/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, Search, RefreshCw, Clock, User, Filter } from 'lucide-react';
import { AuditLog } from '../../types/index.ts';

interface AuditLogViewProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'all' || l.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const modules = Array.from(new Set(logs.map((l) => l.module)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Audit Log & Rekam Jejak Sistem
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pencatatan riwayat autentikasi, perubahan konfigurasi madrasah, pembuatan soal, dan intervensi CBT.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer self-start sm:self-auto"
          title="Refresh Log"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aktivitas, nama pengguna, atau aksi..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="all">Semua Modul Log ({logs.length})</option>
          {modules.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4">Pengguna</th>
              <th className="py-3 px-4">Modul</th>
              <th className="py-3 px-4">Aksi</th>
              <th className="py-3 px-4">Detail Kejadian</th>
              <th className="py-3 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('id-ID')}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white">{log.userName}</div>
                  <span className="text-[10px] uppercase font-semibold text-amber-400">
                    {log.userRole}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                    {log.module}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                  {log.action}
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  {log.details}
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
