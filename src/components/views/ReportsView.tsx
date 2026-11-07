/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  School,
  GraduationCap,
  Award,
  BookOpen
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExamResult, SchoolSettings, ClassRoom, Subject, ExamPackage } from '../../types/index.ts';

interface ReportsViewProps {
  results: ExamResult[];
  schoolSettings: SchoolSettings;
  classes: ClassRoom[];
  subjects: Subject[];
  exams: ExamPackage[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  results,
  schoolSettings,
  classes,
  subjects,
  exams
}) => {
  const [reportType, setReportType] = useState<'individual' | 'class_summary' | 'exam_summary'>('individual');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(results[0]?.studentId || '');

  // Filtered results
  const filteredResults = results.filter((r) => {
    const matchExam = selectedExamId === 'all' || r.examId === selectedExamId;
    return matchExam;
  });

  const selectedStudentResult = results.find((r) => r.studentId === selectedStudentId);

  // Export PDF Report with School Header
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header Kemenag / MIN 1 Paser
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('KEMENTERIAN AGAMA REPUBLIK INDONESIA', 105, 15, { align: 'center' });
    doc.text(schoolSettings.name.toUpperCase(), 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(schoolSettings.address, 105, 28, { align: 'center' });
    doc.text(`NPSN: ${schoolSettings.npsn} | NSM: ${schoolSettings.nsm} | Email: ${schoolSettings.email}`, 105, 33, { align: 'center' });
    doc.line(14, 36, 196, 36);

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN HASIL ASESMEN CBT SISWA', 105, 44, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tahun Pelajaran: ${schoolSettings.academicYear} (${schoolSettings.semester})`, 105, 49, { align: 'center' });

    // Table
    const tableBody = filteredResults.map((r, i) => [
      i + 1,
      r.studentName,
      r.studentNisn,
      r.className,
      r.subjectName,
      r.finalGrade,
      r.kktp,
      r.isPassed ? 'TUNTAS' : 'REMEDIAL'
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['No', 'Nama Siswa', 'NISN', 'Kelas', 'Mata Pelajaran', 'Nilai', 'KKTP', 'Status']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [11, 25, 44], textColor: [230, 179, 37] },
      styles: { fontSize: 8 }
    });

    // Signature
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    const signY = Math.min(finalY + 15, 250);
    doc.setFontSize(9);
    doc.text(`Tanah Grogot, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 140, signY);
    doc.text('Kepala Madrasah,', 140, signY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolSettings.headmasterName, 140, signY + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIP. ${schoolSettings.headmasterNip}`, 140, signY + 30);

    doc.save(`Laporan_Asesmen_MIN1Paser_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Export Excel
  const handleExportExcel = () => {
    const data = filteredResults.map((r, idx) => ({
      No: idx + 1,
      'Nama Siswa': r.studentName,
      NISN: r.studentNisn,
      Kelas: r.className,
      'Mata Pelajaran': r.subjectName,
      'Ujian Asesmen': r.examTitle,
      'Nilai Akhir': r.finalGrade,
      'Batas KKTP': r.kktp,
      'Status Kelulusan': r.isPassed ? 'TUNTAS' : 'REMEDIAL',
      'Benar': r.correctAnswersCount,
      'Salah': r.wrongAnswersCount,
      'Catatan Guru': r.teacherNotes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Asesmen');
    XLSX.writeFile(wb, `Laporan_Asesmen_MIN1Paser_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Laporan & Rapor Asesmen Madrasah
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pencetakan hasil belajar siswa, rekap nilai kelas, dan ekspor dokumen resmi PDF / Excel ber-kop MIN 1 Paser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-rose-400" />
            <span>Cetak / Ekspor PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs">
        <button
          onClick={() => setReportType('individual')}
          className={`py-2 px-4 font-semibold border-b-2 transition cursor-pointer ${
            reportType === 'individual'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          A. Rapor Asesmen Individu Siswa
        </button>
        <button
          onClick={() => setReportType('class_summary')}
          className={`py-2 px-4 font-semibold border-b-2 transition cursor-pointer ${
            reportType === 'class_summary'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          B. Rekapitulasi Nilai Kolektif
        </button>
      </div>

      {reportType === 'individual' ? (
        /* Individual Student Assessment Report Card */
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">Pilih Siswa:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
            >
              {results.map((r) => (
                <option key={r.studentId} value={r.studentId}>
                  {r.studentName} ({r.className} • NISN: {r.studentNisn})
                </option>
              ))}
            </select>
          </div>

          {selectedStudentResult ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm max-w-3xl space-y-5">
              {/* Kop Madrasah Preview */}
              <div className="text-center pb-4 border-b-2 border-slate-700 space-y-1">
                <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  KEMENTERIAN AGAMA REPUBLIK INDONESIA
                </div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                  {schoolSettings.name}
                </h3>
                <p className="text-[11px] text-slate-400">{schoolSettings.address}</p>
                <p className="text-[10px] text-slate-400">
                  NPSN: {schoolSettings.npsn} | NSM: {schoolSettings.nsm} | T.P. {schoolSettings.academicYear} {schoolSettings.semester}
                </p>
              </div>

              {/* Student Identity */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Nama Siswa:</span>{' '}
                  <span className="font-bold text-white">{selectedStudentResult.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400">NISN / NIS:</span>{' '}
                  <span className="font-mono text-amber-300 font-bold">{selectedStudentResult.studentNisn}</span>
                </div>
                <div>
                  <span className="text-slate-400">Kelas:</span>{' '}
                  <span className="font-semibold text-white">{selectedStudentResult.className}</span>
                </div>
                <div>
                  <span className="text-slate-400">Mata Pelajaran:</span>{' '}
                  <span className="font-semibold text-white">{selectedStudentResult.subjectName}</span>
                </div>
              </div>

              {/* Score Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    Capaian Nilai Asesmen
                  </span>
                  <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
                    {selectedStudentResult.finalGrade}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Batas KKTP: {selectedStudentResult.kktp}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                      selectedStudentResult.isPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {selectedStudentResult.isPassed ? 'TUNTAS BELAJAR' : 'PERLU BIMBINGAN / REMEDIAL'}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Benar: {selectedStudentResult.correctAnswersCount} • Salah: {selectedStudentResult.wrongAnswersCount}
                  </div>
                </div>
              </div>

              {/* Teacher Feedback Notes */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="font-bold text-amber-400 block mb-1">Catatan Evaluasi Guru:</span>
                <p className="text-slate-300 italic">
                  "{selectedStudentResult.teacherNotes || 'Alhamdulillah ananda menunjukkan partisipasi aktif dan pemahaman yang baik selama pelaksanaan ujian CBT.'}"
                </p>
              </div>

              {/* Signature block */}
              <div className="pt-4 flex justify-between text-xs text-slate-400">
                <div>
                  <div>Orang Tua / Wali Siswa,</div>
                  <div className="h-14" />
                  <div className="border-t border-slate-700 pt-1 font-medium text-slate-300">
                    ( ..................................... )
                  </div>
                </div>
                <div className="text-right">
                  <div>Tanah Grogot, Paser</div>
                  <div>Kepala Madrasah,</div>
                  <div className="h-10" />
                  <div className="font-bold text-white">{schoolSettings.headmasterName}</div>
                  <div className="text-[11px]">NIP. {schoolSettings.headmasterNip}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Belum ada data nilai siswa.</div>
          )}
        </div>
      ) : (
        /* Collective Summary Table */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Nilai CBT</th>
                <th className="py-3 px-4">Status KKTP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredResults.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-slate-400">{i + 1}</td>
                  <td className="py-3 px-4 font-bold text-white">{r.studentName}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{r.studentNisn}</td>
                  <td className="py-3 px-4">{r.className}</td>
                  <td className="py-3 px-4 text-amber-300">{r.subjectName}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">{r.finalGrade}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.isPassed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {r.isPassed ? 'Tuntas' : 'Remedial'}
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
