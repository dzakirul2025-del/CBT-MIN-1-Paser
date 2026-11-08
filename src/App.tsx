/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { LoginView } from './components/auth/LoginView.tsx';
import { DashboardView } from './components/views/DashboardView.tsx';
import { SchoolSettingsView } from './components/views/SchoolSettingsView.tsx';
import { AcademicYearsView } from './components/views/AcademicYearsView.tsx';
import { ClassesView } from './components/views/ClassesView.tsx';
import { SubjectsView } from './components/views/SubjectsView.tsx';
import { TeachersView } from './components/views/TeachersView.tsx';
import { StudentsView } from './components/views/StudentsView.tsx';
import { UserManagementView } from './components/views/UserManagementView.tsx';
import { QuestionBankView } from './components/views/QuestionBankView.tsx';
import { AIGeneratorView } from './components/views/AIGeneratorView.tsx';
import { ExamPackagesView } from './components/views/ExamPackagesView.tsx';
import { ExamScheduleView } from './components/views/ExamScheduleView.tsx';
import { ExamEngineView } from './components/views/ExamEngineView.tsx';
import { ProctorMonitoringView } from './components/views/ProctorMonitoringView.tsx';
import { AssessmentResultsView } from './components/views/AssessmentResultsView.tsx';
import { ItemAnalysisView } from './components/views/ItemAnalysisView.tsx';
import { ReportsView } from './components/views/ReportsView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { AuditLogView } from './components/views/AuditLogView.tsx';
import { StudentResultsView } from './components/views/StudentResultsView.tsx';
import { UserProfile, SchoolSettings } from './types/index.ts';
import { api } from './lib/api.ts';
import { getInitialDb } from './lib/seed.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [db, setDb] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('min1paser_cbt_db');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return getInitialDb();
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [monitorExamId, setMonitorExamId] = useState<string>('');

  // Initial fetch from backend
  const refreshData = async () => {
    try {
      const data = await api.getBootstrap();
      if (data && data.schoolSettings) {
        setDb(data);
        try {
          localStorage.setItem('min1paser_cbt_db', JSON.stringify(data));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Failed to bootstrap app data from API, operating with local state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // When role changes, ensure default tab is valid for that role
  const handleRoleSwitch = (newRole: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole as any };
    setCurrentUser(updated);

    if (newRole === 'siswa') {
      setActiveTab('ruang_ujian');
    } else if (activeTab === 'ruang_ujian' || activeTab === 'riwayat_nilai') {
      setActiveTab('dashboard');
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'siswa') {
      setActiveTab('ruang_ujian');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const currentDb = db || getInitialDb();
  const schoolSettings: SchoolSettings = currentDb.schoolSettings;

  if (loading && !db) {
    return (
      <div className="min-h-screen bg-[#07101e] flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-spin mb-3">
          ◈
        </div>
        <p className="text-sm font-semibold text-white">Memuat Sistem CBT MIN 1 Paser...</p>
        <span className="text-xs text-slate-500 mt-1">Madrasah Digital Assessment System</span>
      </div>
    );
  }

  // Not logged in: Show Login Screen
  if (!currentUser) {
    return (
      <LoginView
        schoolSettings={schoolSettings}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07101e] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        user={currentUser}
        schoolSettings={schoolSettings}
        onLogout={handleLogout}
        onSwitchRole={handleRoleSwitch}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={currentUser.role}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* 1. Dashboard */}
            {activeTab === 'dashboard' && (
              <DashboardView
                db={db}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {/* 2. Identitas Madrasah */}
            {activeTab === 'identitas_madrasah' && (
              <SchoolSettingsView
                settings={schoolSettings}
                onUpdate={(up) => {
                  setDb((prev: any) => ({ ...prev, schoolSettings: up }));
                }}
              />
            )}

            {/* 3. Tahun Pelajaran */}
            {activeTab === 'tahun_pelajaran' && (
              <AcademicYearsView
                academicYears={db?.academicYears || []}
                onRefresh={refreshData}
              />
            )}

            {/* 4. Data Guru */}
            {activeTab === 'data_guru' && (
              <TeachersView
                teachers={db?.teachers || []}
                subjects={db?.subjects || []}
                onRefresh={refreshData}
              />
            )}

            {/* 5. Data Siswa */}
            {activeTab === 'data_siswa' && (
              <StudentsView
                students={db?.students || []}
                classes={db?.classes || []}
                onRefresh={refreshData}
              />
            )}

            {/* 6. Data Kelas */}
            {activeTab === 'data_kelas' && (
              <ClassesView
                classes={db?.classes || []}
                teachers={db?.teachers || []}
                onRefresh={refreshData}
              />
            )}

            {/* 7. Mata Pelajaran */}
            {activeTab === 'mata_pelajaran' && (
              <SubjectsView
                subjects={db?.subjects || []}
                onRefresh={refreshData}
              />
            )}

            {/* 8. Manajemen Pengguna */}
            {activeTab === 'manajemen_pengguna' && (
              <UserManagementView
                users={db?.users || []}
                onRefresh={refreshData}
              />
            )}

            {/* 9. Bank Soal */}
            {activeTab === 'bank_soal' && (
              <QuestionBankView
                questionBanks={db?.questionBanks || []}
                questions={db?.questions || []}
                subjects={db?.subjects || []}
                teachers={db?.teachers || []}
                onRefresh={refreshData}
              />
            )}

            {/* 10. Generator Soal AI */}
            {activeTab === 'generator_soal_ai' && (
              <AIGeneratorView
                subjects={db?.subjects || []}
                questionBanks={db?.questionBanks || []}
                onRefresh={refreshData}
                onNavigateToBank={() => setActiveTab('bank_soal')}
              />
            )}

            {/* 11. Paket Ujian */}
            {activeTab === 'paket_ujian' && (
              <ExamPackagesView
                exams={db?.exams || []}
                subjects={db?.subjects || []}
                classes={db?.classes || []}
                teachers={db?.teachers || []}
                questions={db?.questions || []}
                onRefresh={refreshData}
                onNavigateToLive={(exId) => {
                  setMonitorExamId(exId);
                  setActiveTab('monitoring_ujian');
                }}
              />
            )}

            {/* 12. Jadwal Ujian */}
            {activeTab === 'jadwal_ujian' && (
              <ExamScheduleView
                exams={db?.exams || []}
                onNavigateToLive={(exId) => {
                  setMonitorExamId(exId);
                  setActiveTab('monitoring_ujian');
                }}
              />
            )}

            {/* 13. Monitoring Ujian */}
            {activeTab === 'monitoring_ujian' && (
              <ProctorMonitoringView
                exams={db?.exams || []}
                initialExamId={monitorExamId}
              />
            )}

            {/* 14. Hasil Asesmen */}
            {activeTab === 'hasil_asesmen' && (
              <AssessmentResultsView
                results={db?.examResults || []}
                exams={db?.exams || []}
                onRefresh={refreshData}
              />
            )}

            {/* 15. Analisis Butir Soal */}
            {activeTab === 'analisis_butir_soal' && (
              <ItemAnalysisView
                exams={db?.exams || []}
              />
            )}

            {/* 16. Laporan */}
            {activeTab === 'laporan' && (
              <ReportsView
                results={db?.examResults || []}
                schoolSettings={schoolSettings}
                classes={db?.classes || []}
                subjects={db?.subjects || []}
                exams={db?.exams || []}
              />
            )}

            {/* 17. Pengaturan & Supabase */}
            {activeTab === 'pengaturan' && (
              <SettingsView />
            )}

            {/* 18. Audit Log */}
            {activeTab === 'audit_log' && (
              <AuditLogView
                logs={db?.auditLogs || []}
                onRefresh={refreshData}
              />
            )}

            {/* Siswa Exclusives: Ruang Ujian CBT & Riwayat Nilai */}
            {activeTab === 'ruang_ujian' && (
              <ExamEngineView
                currentUser={currentUser}
                schoolSettings={schoolSettings}
                availableExams={db?.exams || []}
                onFinishExam={() => {
                  refreshData();
                  setActiveTab('riwayat_nilai');
                }}
              />
            )}

            {activeTab === 'riwayat_nilai' && (
              <StudentResultsView
                results={db?.examResults || []}
                currentUser={currentUser}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
