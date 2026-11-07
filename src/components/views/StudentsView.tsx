/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  Search,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, ClassRoom } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface StudentsViewProps {
  students: Student[];
  classes: ClassRoom[];
  onRefresh: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  classes,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Student | null>(null);

  // Form states
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [birthPlace, setBirthPlace] = useState('Tanah Grogot');
  const [birthDate, setBirthDate] = useState('2013-05-15');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Mutasi' | 'Lulus'>('Aktif');

  // Search & Filter & Pagination
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [saving, setSaving] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.toLowerCase().includes(search.toLowerCase()) ||
      (s.className || '').toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === 'all' || s.classId === classFilter;
    return matchesSearch && matchesClass;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNisn('009' + Math.floor(1000000 + Math.random() * 9000000));
    setNis('2122' + Math.floor(1000 + Math.random() * 9000));
    setName('');
    setGender('L');
    setClassId(classes[0]?.id || '');
    setBirthPlace('Tanah Grogot');
    setBirthDate('2013-05-15');
    setParentName('');
    setParentPhone('0812' + Math.floor(10000000 + Math.random() * 90000000));
    setStatus('Aktif');
    setShowModal(true);
  };

  const handleOpenEdit = (item: Student) => {
    setEditingItem(item);
    setNisn(item.nisn);
    setNis(item.nis);
    setName(item.name);
    setGender(item.gender);
    setClassId(item.classId);
    setBirthPlace(item.birthPlace || 'Tanah Grogot');
    setBirthDate(item.birthDate || '2013-05-15');
    setParentName(item.parentName || '');
    setParentPhone(item.parentPhone || '');
    setStatus(item.status);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus data siswa ini?')) {
      await api.deleteStudent(id);
      onRefresh();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate duplicate NISN / NIS
    const dupNisn = students.find((s) => s.nisn === nisn && s.id !== editingItem?.id);
    if (dupNisn) {
      alert(`Peringatan: NISN ${nisn} sudah terdaftar atas nama ${dupNisn.name}!`);
      return;
    }

    setSaving(true);
    try {
      const selectedClass = classes.find((c) => c.id === classId);
      await api.saveStudent({
        id: editingItem?.id,
        nisn,
        nis,
        name,
        gender,
        classId,
        className: selectedClass?.name || 'Kelas MI',
        birthPlace,
        birthDate,
        parentName,
        parentPhone,
        status
      });
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan siswa');
    } finally {
      setSaving(false);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    const dataToExport = filtered.map((s, idx) => ({
      No: idx + 1,
      NISN: s.nisn,
      NIS: s.nis,
      'Nama Siswa': s.name,
      'L/P': s.gender,
      Kelas: s.className || '-',
      'Tempat Lahir': s.birthPlace,
      'Tanggal Lahir': s.birthDate,
      'Nama Orang Tua': s.parentName,
      'No. HP Wali': s.parentPhone,
      Status: s.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
    XLSX.writeFile(workbook, `Data_Siswa_MIN1Paser_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Download template Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NISN: '0091234580',
        NIS: '21220110',
        'Nama Lengkap': 'Ahmad Zaki Mubarak',
        'Jenis Kelamin (L/P)': 'L',
        'Nama Kelas': 'Kelas 6A',
        'Tempat Lahir': 'Tanah Grogot',
        'Tanggal Lahir (YYYY-MM-DD)': '2013-09-10',
        'Nama Orang Tua': 'H. Zainuddin',
        'No HP Orang Tua': '081234567890'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_Import_Siswa_MIN1Paser.xlsx');
  };

  // Import Excel File
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          alert('File Excel kosong atau format tidak sesuai.');
          return;
        }

        const formatted = data.map((row: any) => {
          const rawClass = row['Nama Kelas'] || row['Kelas'] || 'Kelas 6A';
          const matchedClass = classes.find((c) => c.name.toLowerCase() === String(rawClass).toLowerCase()) || classes[0];

          return {
            nisn: String(row['NISN'] || Math.floor(1000000000 + Math.random() * 9000000000)),
            nis: String(row['NIS'] || Math.floor(10000000 + Math.random() * 90000000)),
            name: String(row['Nama Lengkap'] || row['Nama Siswa'] || 'Siswa Baru'),
            gender: String(row['Jenis Kelamin (L/P)'] || row['L/P'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
            classId: matchedClass?.id,
            className: matchedClass?.name,
            birthPlace: String(row['Tempat Lahir'] || 'Tanah Grogot'),
            birthDate: String(row['Tanggal Lahir (YYYY-MM-DD)'] || '2013-01-01'),
            parentName: String(row['Nama Orang Tua'] || 'Orang Tua'),
            parentPhone: String(row['No HP Orang Tua'] || '081234567890')
          };
        });

        const res = await api.importStudents(formatted);
        setImportStatus(`Berhasil mengimpor ${res.count} siswa baru tanpa duplikat!`);
        setTimeout(() => {
          setImportStatus(null);
          setShowImportModal(false);
          onRefresh();
        }, 1500);
      } catch (err: any) {
        alert('Gagal membaca file Excel: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            Data Siswa Peserta Asesmen
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data pokok siswa MIN 1 Paser, validasi NISN/NIS unik, akun ujian CBT otomatis, dan import/export Excel.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa berdasarkan nama, NISN, atau NIS..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="all">Semua Rombel / Kelas ({students.length})</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">NISN / NIS</th>
              <th className="py-3 px-4">Nama Siswa</th>
              <th className="py-3 px-4">L/P</th>
              <th className="py-3 px-4">Kelas</th>
              <th className="py-3 px-4">Orang Tua / Wali</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {paginated.map((student) => (
              <tr key={student.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-mono">
                  <div className="font-bold text-amber-400">{student.nisn}</div>
                  <div className="text-[11px] text-slate-400">NIS: {student.nis}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white text-sm">{student.name}</div>
                  <div className="text-[11px] text-slate-400">{student.birthPlace}, {student.birthDate}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${student.gender === 'L' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'}`}>
                    {student.gender}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-200">
                  {student.className || '-'}
                </td>
                <td className="py-3.5 px-4 text-slate-400">
                  <div>{student.parentName || '-'}</div>
                  <div className="text-[11px]">{student.parentPhone || ''}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {student.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(student)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {paginated.length} dari {filtered.length} siswa</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 cursor-pointer"
            >
              Sebelumnya
            </button>
            <span className="px-2 py-1 text-slate-300">
              Halaman {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingItem ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="Contoh: 0091234567"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none font-mono font-bold text-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">NIS Madrasah</label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="Contoh: 21220101"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama sesuai akta kelahiran / ijazah"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pilih Kelas</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Nama ayah / ibu"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Data Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Import Data Siswa dari Excel
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Unggah file Excel (.xlsx / .xls) data siswa. Sistem akan otomatis memvalidasi NISN dan membuat akun login CBT siswa.
            </p>

            {importStatus && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{importStatus}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="p-4 border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl text-center bg-slate-950/60 transition">
                <input
                  type="file"
                  id="excelFileInput"
                  accept=".xlsx, .xls"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <label htmlFor="excelFileInput" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <span className="text-xs font-bold text-white block">
                    Klik untuk memilih file Excel
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Format file .xlsx atau .xls
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Template Excel
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
