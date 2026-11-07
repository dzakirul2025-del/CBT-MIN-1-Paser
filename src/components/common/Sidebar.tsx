/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserRole } from '../../types/index.ts';
import {
  LayoutDashboard,
  School,
  Calendar,
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  UserCog,
  FileQuestion,
  Sparkles,
  PackageCheck,
  Clock,
  Eye,
  Award,
  BarChart3,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
  Laptop,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole
}) => {
  // Define all navigation menus matching Section 5 & CBT student navigation
  const allNavItems = [
    // Siswa exclusive navigation
    {
      id: 'ruang_ujian',
      label: 'Ruang Ujian CBT',
      icon: Laptop,
      roles: ['siswa'],
      highlight: true
    },
    {
      id: 'riwayat_nilai',
      label: 'Riwayat & Nilai Siswa',
      icon: Award,
      roles: ['siswa']
    },

    // 18 Modul Dashboard Admin / Staff
    {
      id: 'dashboard',
      label: '1. Dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'admin_madrasah', 'guru', 'pengawas']
    },
    {
      id: 'identitas_madrasah',
      label: '2. Identitas Madrasah',
      icon: School,
      roles: ['super_admin', 'admin_madrasah']
    },
    {
      id: 'tahun_pelajaran',
      label: '3. Tahun Pelajaran',
      icon: Calendar,
      roles: ['super_admin', 'admin_madrasah']
    },
    {
      id: 'data_guru',
      label: '4. Data Guru',
      icon: Users,
      roles: ['super_admin', 'admin_madrasah']
    },
    {
      id: 'data_siswa',
      label: '5. Data Siswa',
      icon: GraduationCap,
      roles: ['super_admin', 'admin_madrasah', 'guru']
    },
    {
      id: 'data_kelas',
      label: '6. Data Kelas',
      icon: Layers,
      roles: ['super_admin', 'admin_madrasah']
    },
    {
      id: 'mata_pelajaran',
      label: '7. Mata Pelajaran',
      icon: BookOpen,
      roles: ['super_admin', 'admin_madrasah']
    },
    {
      id: 'manajemen_pengguna',
      label: '8. Manajemen Pengguna',
      icon: UserCog,
      roles: ['super_admin']
    },
    {
      id: 'bank_soal',
      label: '9. Bank Soal',
      icon: FileQuestion,
      roles: ['super_admin', 'admin_madrasah', 'guru']
    },
    {
      id: 'generator_soal_ai',
      label: '10. Generator Soal AI',
      icon: Sparkles,
      roles: ['super_admin', 'guru'],
      badge: 'Gemini'
    },
    {
      id: 'paket_ujian',
      label: '11. Paket Ujian',
      icon: PackageCheck,
      roles: ['super_admin', 'admin_madrasah', 'guru']
    },
    {
      id: 'jadwal_ujian',
      label: '12. Jadwal Ujian',
      icon: Clock,
      roles: ['super_admin', 'admin_madrasah', 'guru', 'pengawas']
    },
    {
      id: 'monitoring_ujian',
      label: '13. Monitoring Ujian',
      icon: Eye,
      roles: ['super_admin', 'admin_madrasah', 'guru', 'pengawas'],
      badge: 'Live'
    },
    {
      id: 'hasil_asesmen',
      label: '14. Hasil Asesmen',
      icon: Award,
      roles: ['super_admin', 'admin_madrasah', 'guru']
    },
    {
      id: 'analisis_butir_soal',
      label: '15. Analisis Butir Soal',
      icon: BarChart3,
      roles: ['super_admin', 'guru']
    },
    {
      id: 'laporan',
      label: '16. Laporan & Ekspor',
      icon: FileSpreadsheet,
      roles: ['super_admin', 'admin_madrasah', 'guru']
    },
    {
      id: 'pengaturan',
      label: '17. Pengaturan & Supabase',
      icon: Settings,
      roles: ['super_admin']
    },
    {
      id: 'audit_log',
      label: '18. Audit Log',
      icon: ShieldAlert,
      roles: ['super_admin']
    }
  ];

  const visibleItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 h-[calc(100vh-57px)] sticky top-[57px]">
      <div className="p-3 border-b border-slate-800/80">
        <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-2 mb-1">
          Menu Navigasi
        </div>
        <div className="text-xs text-amber-400/90 font-medium px-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Akses: {userRole.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                    isActive
                      ? 'bg-slate-950 text-amber-300'
                      : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer madrasah indicator */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
        <div className="font-semibold text-slate-300">MIN 1 Paser CBT v2.5</div>
        <div className="text-[10px] text-slate-400">Kalimantan Timur</div>
      </div>
    </aside>
  );
};
