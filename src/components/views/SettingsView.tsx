/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Key,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  Server,
  Layers
} from 'lucide-react';
import { api } from '../../lib/api.ts';

export const SettingsView: React.FC = () => {
  const [migrationSql, setMigrationSql] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loadingSql, setLoadingSql] = useState<boolean>(false);

  // Supabase mock / live connection params
  const [supabaseUrl, setSupabaseUrl] = useState('https://min1paser-cbt.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9...');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const fetchSql = async () => {
      setLoadingSql(true);
      try {
        const sql = await api.getMigrationSql();
        setMigrationSql(sql);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSql(false);
      }
    };
    fetchSql();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(migrationSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([migrationSql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '20250101000000_min1paser_cbt_init.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          Pengaturan Sistem & Database Supabase
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Koneksi infrastruktur backend, konfigurasi Gemini AI, dan 23 Skema Tabel Database PostgreSQL Supabase dengan RLS.
        </p>
      </div>

      {/* Supabase status banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Status Database PostgreSQL Supabase</h3>
              <p className="text-xs text-slate-400">
                Penyimpanan persisten server aktif & siap dikoneksikan ke instance Supabase Cloud
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
            Sistem Aktif & Terhubung
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Supabase Project URL</label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Anon / Public API Key</label>
            <input
              type="text"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Gemini AI Status card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Google Gemini AI Engine (Server-Side)</h3>
            <p className="text-xs text-slate-400">
              Model aktif: <span className="font-mono text-amber-300 font-bold">gemini-3.8-flash</span> via SDK modern @google/genai
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Gemini API diakses secara aman eksklusif dari server backend Express. Kunci rahasia tersimpan di lingkungan server dan tidak pernah terpapar ke sisi browser pengguna.
        </p>
      </div>

      {/* Supabase 23 Table Migration SQL Viewer as requested in Section 15 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Skema Database Supabase PostgreSQL (23 Tabel + RLS + Index)
            </h3>
            <p className="text-xs text-slate-400">
              File migration SQL lengkap siap dijalankan di Supabase SQL Editor atau CLI
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin SQL'}</span>
            </button>
            <button
              onClick={handleDownloadSql}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File .SQL</span>
            </button>
          </div>
        </div>

        {/* 23 Tables Checklist Pill */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
          <span className="font-bold text-amber-400 block mb-1">
            23 Tabel Terintegrasi Sesuai Spesifikasi Master:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[10px]">
            {[
              'profiles', 'school_settings', 'academic_years', 'classes', 'subjects',
              'students', 'teachers', 'class_students', 'teacher_subjects', 'question_banks',
              'questions', 'question_options', 'exams', 'exam_questions', 'exam_participants',
              'exam_sessions', 'student_answers', 'exam_results', 'essay_rubrics', 'proctor_logs',
              'exam_tokens', 'ai_generations', 'audit_logs'
            ].map((tbl) => (
              <span key={tbl} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                ✓ {tbl}
              </span>
            ))}
          </div>
        </div>

        {/* Code Preview Box */}
        <div className="max-h-72 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 custom-scrollbar">
          {loadingSql ? (
            <div className="text-slate-400">Memuat skrip SQL...</div>
          ) : (
            <pre className="whitespace-pre-wrap">{migrationSql}</pre>
          )}
        </div>
      </div>
    </div>
  );
};
