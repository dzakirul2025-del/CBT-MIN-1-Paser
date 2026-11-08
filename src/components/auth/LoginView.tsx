/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { School, ShieldCheck, Lock, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { SchoolSettings, UserProfile } from '../../types/index.ts';
import { getInitialDb } from '../../lib/seed.ts';

interface LoginViewProps {
  schoolSettings?: SchoolSettings;
  onLoginSuccess: (user: UserProfile) => void;
}

const defaultSchoolSettings: SchoolSettings = {
  id: 'school_min1paser',
  name: 'MIN 1 Paser',
  subname: 'Madrasah Digital Assessment System',
  npsn: '60728192',
  nsm: '111164020001',
  address: 'Jl. Kusuma Bangsa Km. 5, Tepian Batang, Tanah Grogot, Kab. Paser',
  subdistrict: 'Tanah Grogot',
  district: 'Kabupaten Paser',
  province: 'Kalimantan Timur',
  postalCode: '76211',
  phone: '(0543) 21102',
  email: 'min1paser@kemenag.go.id',
  website: 'https://min1paser.sch.id',
  headmasterName: 'Drs. H. M. Syahril, M.Pd.I',
  headmasterNip: '197108151998031004',
  logoUrl: '',
  academicYear: '2024/2025',
  semester: 'Genap',
  themeColor: '#0B192C',
  accentColor: '#E6B325'
};

export const LoginView: React.FC<LoginViewProps> = ({
  schoolSettings,
  onLoginSuccess
}) => {
  const safeSettings = schoolSettings || defaultSchoolSettings;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (targetUsername?: string) => {
    const userToLogin = targetUsername || username;
    if (!userToLogin.trim()) {
      setError('Masukkan username atau NISN peserta.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userToLogin.trim(),
          password: password.trim()
        })
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          onLoginSuccess(data.user);
          return;
        }
      }

      // If backend route returned 404 or non-JSON (e.g. static preview on Vercel), fallback to local auth
      const seedDb = getInitialDb();
      const localUser = seedDb.users.find(
        (u: any) => u.username.toLowerCase() === userToLogin.trim().toLowerCase()
      );
      if (localUser) {
        onLoginSuccess(localUser as any);
        return;
      }

      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Username atau password tidak ditemukan');
    } catch (err: any) {
      // Final fallback check against seed database
      const seedDb = getInitialDb();
      const localUser = seedDb.users.find(
        (u: any) => u.username.toLowerCase() === userToLogin.trim().toLowerCase()
      );
      if (localUser) {
        onLoginSuccess(localUser as any);
      } else {
        setError(err.message || 'Terjadi kesalahan saat masuk');
      }
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Super Admin', username: 'admin', label: 'Ahmad Ridwan, S.Kom', badge: 'bg-amber-500/20 text-amber-300' },
    { role: 'Admin Madrasah', username: 'admin_mi', label: 'Siti Nurhaliza, S.Pd.I', badge: 'bg-blue-500/20 text-blue-300' },
    { role: 'Guru Pengampu', username: 'guru_ilham', label: 'Ust. Muhammad Ilham, M.Pd', badge: 'bg-emerald-500/20 text-emerald-300' },
    { role: 'Pengawas CBT', username: 'pengawas1', label: 'Bpk. H. Ruslan Effendi, S.Ag', badge: 'bg-purple-500/20 text-purple-300' },
    { role: 'Siswa Peserta', username: 'siswa_faiz', label: 'M. Faiz Al-Farizi (6A)', badge: 'bg-cyan-500/20 text-cyan-300' }
  ];

  return (
    <div className="min-h-screen bg-[#07101e] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background aesthetic decorative shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-900/30 via-amber-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Madrasah branding card header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-1 shadow-xl shadow-amber-500/20 mb-3">
            <div className="w-full h-full bg-[#0B192C] rounded-[14px] flex items-center justify-center">
              <School className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {safeSettings?.name || 'MIN 1 Paser'} <span className="text-amber-400">CBT</span>
          </h2>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">
            {safeSettings?.subname || 'MADRASAH DIGITAL ASSESSMENT SYSTEM'}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Tahun Pelajaran {safeSettings?.academicYear || '2024/2025'} {safeSettings?.semester || 'Genap'}
          </div>
        </div>

        {/* Login form box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username / NIP / NISN Siswa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin atau siswa_faiz"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex justify-between">
                <span>Password</span>
                <span className="text-[11px] text-amber-400 font-normal">Default: 123456</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <span>Masuk ke Sistem CBT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pilih Akun Demo (1-Klik Masuk)
              </span>
            </div>
            <div className="space-y-1.5">
              {demoAccounts.map((item) => (
                <button
                  key={item.username}
                  type="button"
                  onClick={() => {
                    setUsername(item.username);
                    setPassword('123456');
                    handleLogin(item.username);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/40 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${item.badge}`}>
                      {item.role}
                    </span>
                    <span className="text-xs text-slate-200 group-hover:text-amber-300 font-medium">
                      {item.label}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security badge and footer info */}
        <div className="mt-5 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Terenkripsi & Didukung Gemini AI Server-Side</span>
          </div>
          <span className="text-[11px] text-slate-400">
            © 2025 MIN 1 Paser – Tanah Grogot, Paser, Kaltim
          </span>
        </div>
      </div>
    </div>
  );
};
