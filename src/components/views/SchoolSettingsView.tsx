/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { School, Save, Upload, Check, AlertCircle } from 'lucide-react';
import { SchoolSettings } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface SchoolSettingsViewProps {
  settings: SchoolSettings;
  onUpdate: (updated: SchoolSettings) => void;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  settings,
  onUpdate
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof SchoolSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleChange('logoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const updated = await api.updateSchoolSettings(formData);
      onUpdate(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <School className="w-5 h-5 text-amber-400" />
            Identitas Madrasah
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi profil resmi MIN 1 Paser yang dicantumkan pada kop laporan, kartu ujian, dan kop CBT.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Pengaturan identitas madrasah berhasil diperbarui.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Logo and school header preview */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row items-center gap-6">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-amber-400/40 flex items-center justify-center p-1">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Logo Madrasah"
                  className="w-full h-full object-contain"
                />
              ) : (
                <School className="w-12 h-12 text-slate-600" />
              )}
            </div>
            <label className="mt-2 block text-center cursor-pointer">
              <span className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center justify-center gap-1">
                <Upload className="w-3 h-3" /> Upload Logo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className="text-base font-bold text-white">{formData.name}</h3>
            <p className="text-xs text-amber-400 font-semibold">{formData.subname}</p>
            <p className="text-xs text-slate-400 mt-1">{formData.address}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-300">
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
                NPSN: {formData.npsn}
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
                NSM: {formData.nsm}
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Kepala: {formData.headmasterName}
              </span>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nama Madrasah</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Subjudul / Semboyan</label>
            <input
              type="text"
              value={formData.subname}
              onChange={(e) => handleChange('subname', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">NPSN (Nomor Pokok Sekolah Nasional)</label>
            <input
              type="text"
              value={formData.npsn}
              onChange={(e) => handleChange('npsn', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">NSM (Nomor Statistik Madrasah)</label>
            <input
              type="text"
              value={formData.nsm}
              onChange={(e) => handleChange('nsm', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-300 mb-1">Alamat Lengkap</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Kecamatan</label>
            <input
              type="text"
              value={formData.subdistrict}
              onChange={(e) => handleChange('subdistrict', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Kabupaten</label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nama Kepala Madrasah</label>
            <input
              type="text"
              value={formData.headmasterName}
              onChange={(e) => handleChange('headmasterName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">NIP Kepala Madrasah</label>
            <input
              type="text"
              value={formData.headmasterNip}
              onChange={(e) => handleChange('headmasterNip', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Email Resmi</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nomor Telepon</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Identitas'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
