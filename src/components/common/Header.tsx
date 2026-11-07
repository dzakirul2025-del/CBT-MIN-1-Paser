/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile, SchoolSettings } from '../../types/index.ts';
import { LogOut, Shield, User, School, Sparkles } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  schoolSettings: SchoolSettings;
  onLogout: () => void;
  onSwitchRole: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  schoolSettings,
  onLogout,
  onSwitchRole
}) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin_madrasah': return 'Admin Madrasah';
      case 'guru': return 'Guru Pengampu';
      case 'pengawas': return 'Pengawas CBT';
      case 'siswa': return 'Siswa Peserta';
      default: return role;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'admin_madrasah': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'guru': return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'pengawas': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'siswa': return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  return (
    <header className="bg-[#0B192C] text-white border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#0B192C] rounded-[10px] flex items-center justify-center">
              <School className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-wide text-white leading-tight">
                {schoolSettings.name || 'MIN 1 Paser'} <span className="text-amber-400 font-extrabold">CBT</span>
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20">
                T.P. {schoolSettings.academicYear} {schoolSettings.semester}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-wider uppercase font-semibold">
              {schoolSettings.subname || 'Madrasah Digital Assessment System'}
            </p>
          </div>
        </div>

        {/* Right side controls: Role switch & user profile */}
        <div className="flex items-center gap-3">
          {/* Quick role switcher for testing all modules */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2 py-1 text-xs">
            <span className="text-slate-400 flex items-center gap-1 text-[11px] mr-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Demo Role:
            </span>
            <select
              value={user.role}
              onChange={(e) => onSwitchRole(e.target.value)}
              className="bg-transparent text-amber-300 font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="super_admin" className="bg-slate-900 text-white">Super Admin</option>
              <option value="admin_madrasah" className="bg-slate-900 text-white">Admin Madrasah</option>
              <option value="guru" className="bg-slate-900 text-white">Guru</option>
              <option value="pengawas" className="bg-slate-900 text-white">Pengawas</option>
              <option value="siswa" className="bg-slate-900 text-white">Siswa (Kelas 6A)</option>
            </select>
          </div>

          {/* User info badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-amber-400 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-white leading-tight truncate max-w-[140px]">
                {user.name}
              </div>
              <span className={`inline-block px-1.5 py-0.2 rounded border text-[10px] font-medium ${getRoleBadgeStyle(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            title="Keluar"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
