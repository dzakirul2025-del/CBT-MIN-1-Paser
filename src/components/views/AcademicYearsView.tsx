/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle, Trash2, Edit } from 'lucide-react';
import { AcademicYear } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface AcademicYearsViewProps {
  academicYears: AcademicYear[];
  onRefresh: () => void;
}

export const AcademicYearsView: React.FC<AcademicYearsViewProps> = ({
  academicYears,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYear | null>(null);
  const [year, setYear] = useState('2024/2025');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Genap');
  const [isActive, setIsActive] = useState(false);
  const [startDate, setStartDate] = useState('2025-01-06');
  const [endDate, setEndDate] = useState('2025-06-20');
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setYear('2025/2026');
    setSemester('Ganjil');
    setIsActive(false);
    setStartDate('2025-07-14');
    setEndDate('2025-12-19');
    setShowModal(true);
  };

  const handleOpenEdit = (ay: AcademicYear) => {
    setEditingItem(ay);
    setYear(ay.year);
    setSemester(ay.semester);
    setIsActive(ay.isActive);
    setStartDate(ay.startDate);
    setEndDate(ay.endDate);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveAcademicYear({
        id: editingItem?.id,
        year,
        semester,
        isActive,
        startDate,
        endDate
      });
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan tahun pelajaran');
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (ay: AcademicYear) => {
    try {
      await api.saveAcademicYear({ ...ay, isActive: true });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status aktif');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Tahun Pelajaran & Semester
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan tahun akademik aktif yang menjadi acuan jadwal asesmen dan rombongan belajar.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tahun Pelajaran</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Tahun Pelajaran</th>
              <th className="py-3 px-4">Semester</th>
              <th className="py-3 px-4">Periode Tanggal</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {academicYears.map((ay) => (
              <tr key={ay.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-bold text-white text-sm">{ay.year}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded font-medium bg-slate-800 text-slate-200">
                    Semester {ay.semester}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">
                  {ay.startDate} s/d {ay.endDate}
                </td>
                <td className="py-3.5 px-4">
                  {ay.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5" /> Aktif Digunakan
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetActive(ay)}
                      className="text-xs text-slate-400 hover:text-amber-400 transition cursor-pointer"
                    >
                      Jadikan Aktif
                    </button>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(ay)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingItem ? 'Edit Tahun Pelajaran' : 'Tambah Tahun Pelajaran Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tahun Pelajaran (e.g. 2024/2025)</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024/2025"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e: any) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700"
                />
                <label htmlFor="isActive" className="text-slate-300 font-medium cursor-pointer">
                  Jadikan sebagai Tahun Pelajaran Aktif
                </label>
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
                  {saving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
