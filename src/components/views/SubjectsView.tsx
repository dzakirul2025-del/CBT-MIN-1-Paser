/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Edit, Search } from 'lucide-react';
import { Subject } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface SubjectsViewProps {
  subjects: Subject[];
  onRefresh: () => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Subject | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Pendidikan Agama Islam' | 'Umum' | 'Muatan Lokal'>('Pendidikan Agama Islam');
  const [levelMin, setLevelMin] = useState(1);
  const [levelMax, setLevelMax] = useState(6);
  const [kktpDefault, setKktpDefault] = useState(75);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCode('PP-11');
    setName('');
    setCategory('Umum');
    setLevelMin(1);
    setLevelMax(6);
    setKktpDefault(75);
    setShowModal(true);
  };

  const handleOpenEdit = (item: Subject) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setCategory(item.category);
    setLevelMin(item.levelMin);
    setLevelMax(item.levelMax);
    setKktpDefault(item.kktpDefault);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus mata pelajaran ini?')) {
      await api.deleteSubject(id);
      onRefresh();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveSubject({
        id: editingItem?.id,
        code,
        name,
        category,
        levelMin,
        levelMax,
        kktpDefault
      });
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan mata pelajaran');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Mata Pelajaran Kurikulum Madrasah
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Daftar mapel PAI (Kemenag), Umum, dan Muatan Lokal beserta KKTP acuan kelulusan.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Pelajaran</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kode atau nama mata pelajaran..."
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Kode</th>
              <th className="py-3 px-4">Mata Pelajaran</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Jenjang Kelas</th>
              <th className="py-3 px-4">Batas KKTP</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{item.code}</td>
                <td className="py-3.5 px-4 font-semibold text-white">{item.name}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.category === 'Pendidikan Agama Islam'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.category === 'Umum'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">
                  Kelas {item.levelMin} - {item.levelMax}
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {item.kktpDefault}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingItem ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kode Mapel</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: FK-03"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Pendidikan Agama Islam">Pendidikan Agama Islam (PAI)</option>
                    <option value="Umum">Mata Pelajaran Umum</option>
                    <option value="Muatan Lokal">Muatan Lokal (Mulok)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Akidah Akhlak"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kelas Min</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={levelMin}
                    onChange={(e) => setLevelMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kelas Max</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={levelMax}
                    onChange={(e) => setLevelMax(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Batas KKTP</label>
                  <input
                    type="number"
                    value={kktpDefault}
                    onChange={(e) => setKktpDefault(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none font-bold text-amber-400"
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
                  {saving ? 'Menyimpan...' : 'Simpan Mapel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
