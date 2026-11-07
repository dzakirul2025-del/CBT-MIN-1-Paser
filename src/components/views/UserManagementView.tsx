/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserCog, Plus, Trash2, Edit, Search, KeyRound, CheckCircle2, XCircle } from 'lucide-react';
import { UserRole } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface UserManagementViewProps {
  users: any[];
  onRefresh: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('guru');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [isActive, setIsActive] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [saving, setSaving] = useState(false);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setUsername('');
    setName('');
    setRole('guru');
    setEmail('');
    setPassword('123456');
    setIsActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setUsername(item.username);
    setName(item.name);
    setRole(item.role);
    setEmail(item.email || '');
    setPassword(item.password || '123456');
    setIsActive(item.isActive !== false);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus akun pengguna ini?')) {
      await api.deleteUser(id);
      onRefresh();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveUser({
        id: editingItem?.id,
        username,
        name,
        role,
        email,
        password,
        isActive
      });
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengguna');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-amber-400" />
            Manajemen Pengguna & Hak Akses
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan 5 role otorisasi CBT: Super Admin, Admin Madrasah, Guru, Pengawas, dan Siswa.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Pengguna</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari akun berdasarkan nama atau username..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="all">Semua Peran Akun ({users.length})</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin_madrasah">Admin Madrasah</option>
          <option value="guru">Guru</option>
          <option value="pengawas">Pengawas</option>
          <option value="siswa">Siswa</option>
        </select>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Nama Pengguna</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Role Akses</th>
              <th className="py-3 px-4">Status Akun</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white text-sm">{user.name}</div>
                  <div className="text-[11px] text-slate-400">{user.email || '-'}</div>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-amber-300">
                  {user.username}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'super_admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : user.role === 'admin_madrasah'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : user.role === 'guru'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : user.role === 'pengawas'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {user.isActive !== false ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                      <XCircle className="w-3.5 h-3.5" /> Non-Aktif
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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
              {editingItem ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap</label>
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
                  <label className="block font-semibold text-slate-300 mb-1">Username Login</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Role / Peran</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin_madrasah">Admin Madrasah</option>
                    <option value="guru">Guru</option>
                    <option value="pengawas">Pengawas</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveUser"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="isActiveUser" className="text-slate-300 font-medium cursor-pointer">
                  Akun Aktif (Dapat Login)
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
                  {saving ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
