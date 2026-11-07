/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit, Search, Phone, Mail, Award } from 'lucide-react';
import { Teacher, Subject } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface TeachersViewProps {
  teachers: Teacher[];
  subjects: Subject[];
  onRefresh: () => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  teachers,
  subjects,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Teacher | null>(null);
  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'PNS' | 'PPPK' | 'Non-PNS'>('PNS');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.nip.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNip('19870101' + Math.floor(100000 + Math.random() * 900000));
    setName('');
    setGender('L');
    setEmail('');
    setPhone('0812' + Math.floor(10000000 + Math.random() * 90000000));
    setStatus('PNS');
    setSelectedSubjectIds([subjects[0]?.id || '']);
    setShowModal(true);
  };

  const handleOpenEdit = (item: Teacher) => {
    setEditingItem(item);
    setNip(item.nip);
    setName(item.name);
    setGender(item.gender);
    setEmail(item.email);
    setPhone(item.phone);
    setStatus(item.status);
    setSelectedSubjectIds(item.subjectIds || []);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus guru ini? Akun login terkait juga akan dinonaktifkan.')) {
      await api.deleteTeacher(id);
      onRefresh();
    }
  };

  const toggleSubject = (subId: string) => {
    if (selectedSubjectIds.includes(subId)) {
      setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== subId));
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, subId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const subjectNames = subjects
        .filter((s) => selectedSubjectIds.includes(s.id))
        .map((s) => s.name);

      await api.saveTeacher({
        id: editingItem?.id,
        nip,
        name,
        gender,
        email: email || `${nip}@min1paser.sch.id`,
        phone,
        status,
        subjectIds: selectedSubjectIds,
        subjectNames
      });
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data guru');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Data Guru & Tenaga Pendidik
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data dewan guru MIN 1 Paser, penugasan mata pelajaran pengampu, dan akses pembuat soal CBT.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Guru Baru</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari guru berdasarkan nama, NIP, atau kontak..."
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Nama Lengkap & NIP</th>
              <th className="py-3 px-4">Status & L/P</th>
              <th className="py-3 px-4">Mapel Pengampu</th>
              <th className="py-3 px-4">Kontak</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filtered.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white text-sm">{teacher.name}</div>
                  <div className="text-slate-400 font-mono text-[11px]">NIP: {teacher.nip}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                      {teacher.status}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {teacher.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {(teacher.subjectNames || []).map((sub, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-300 border border-blue-500/20">
                        {sub}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-400">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] mt-0.5">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{teacher.phone}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id)}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingItem ? 'Edit Data Guru' : 'Tambah Guru Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19840512..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status Kepegawaian</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="PNS">PNS Kemenag</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Non-PNS">Guru Tetap Yayasan / Non-PNS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap beserta Gelar</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd.I"
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
                  <label className="block font-semibold text-slate-300 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@min1paser.sch.id"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Pilih Mata Pelajaran yang Diampu</label>
                <div className="max-h-32 overflow-y-auto bg-slate-950 border border-slate-700 rounded-xl p-2.5 space-y-1.5 custom-scrollbar">
                  {subjects.map((sub) => (
                    <label key={sub.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-900 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedSubjectIds.includes(sub.id)}
                        onChange={() => toggleSubject(sub.id)}
                        className="rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span className="text-slate-300">{sub.name} ({sub.code})</span>
                    </label>
                  ))}
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
                  {saving ? 'Menyimpan...' : 'Simpan Data Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
