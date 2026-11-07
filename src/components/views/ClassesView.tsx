/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit, Search } from 'lucide-react';
import { ClassRoom, Teacher } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface ClassesViewProps {
  classes: ClassRoom[];
  teachers: Teacher[];
  onRefresh: () => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  teachers,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassRoom | null>(null);
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [homeroomTeacherName, setHomeroomTeacherName] = useState('');
  const [studentCount, setStudentCount] = useState(28);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [saving, setSaving] = useState(false);

  const filteredClasses = classes.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.homeroomTeacherName || '').toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('Kelas 6C');
    setLevel(6);
    setHomeroomTeacherName(teachers[0]?.name || '');
    setStudentCount(30);
    setShowModal(true);
  };

  const handleOpenEdit = (item: ClassRoom) => {
    setEditingItem(item);
    setName(item.name);
    setLevel(item.level);
    setHomeroomTeacherName(item.homeroomTeacherName || '');
    setStudentCount(item.studentCount || 28);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus kelas ini? Siswa di dalamnya perlu dipindahkan.')) {
      await api.deleteClass(id);
      onRefresh();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveClass({
        id: editingItem?.id,
        name,
        level,
        homeroomTeacherName,
        studentCount
      });
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data kelas');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            Data Kelas & Rombongan Belajar
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Daftar kelas 1 s/d 6 MIN 1 Paser beserta penetapan guru wali kelas.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kelas atau wali kelas..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">Semua Tingkat (1-6)</option>
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <option key={l} value={l}>Tingkat Kelas {l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-sm transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  Tingkat {cls.level} MI
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {cls.studentCount || 0} Siswa
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{cls.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Wali Kelas: <span className="text-slate-200 font-medium">{cls.homeroomTeacherName || 'Belum Ditentukan'}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => handleOpenEdit(cls)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                title="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cls.id)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                title="Hapus"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingItem ? 'Edit Rombongan Belajar' : 'Tambah Rombongan Belajar Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Rombel / Kelas (Contoh: Kelas 6A)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tingkat Kelas</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((l) => (
                      <option key={l} value={l}>Kelas {l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kapasitas / Estimasi Siswa</label>
                  <input
                    type="number"
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Wali Kelas</label>
                <select
                  value={homeroomTeacherName}
                  onChange={(e) => setHomeroomTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="">-- Pilih Guru Wali Kelas --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>{t.name} ({t.nip})</option>
                  ))}
                </select>
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
                  {saving ? 'Menyimpan...' : 'Simpan Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
