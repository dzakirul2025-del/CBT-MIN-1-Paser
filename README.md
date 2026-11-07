# MIN 1 PASER CBT – MADRASAH DIGITAL ASSESSMENT SYSTEM

Aplikasi CBT (Computer Based Test) resmi untuk **Madrasah Ibtidaiyah Negeri 1 Paser** (Tanah Grogot, Kabupaten Paser, Kalimantan Timur).

---

## 🌟 Fitur Utama Sistem

### 1. 5 Hak Akses Peran Pengguna (Role-Based Access Control)
- **Super Admin**: Konfigurasi menyeluruh, hak akses pengguna, backup, database, dan audit log.
- **Admin Madrasah**: Data guru, siswa, kelas, mata pelajaran, tahun pelajaran, dan jadwal ujian.
- **Guru Pengampu**: Bank soal terstruktur, Generator Soal AI Gemini, perakitan paket ujian, penilaian manual esai berbasis rubrik, dan analisis butir soal.
- **Pengawas CBT**: Live monitoring ujian realtime, pantau sisa waktu, deteksi tab switch, tambah waktu darurat (+5/+10/+15 m), dan reset akses login siswa.
- **Siswa Peserta**: Ruang ujian CBT responsif, navigasi soal 1..N, timer hitung mundur server, ragu-ragu, autosave lokal & server, anti-curang, dan kartu rapor nilai.

### 2. 18 Modul Lengkap
1. **Dashboard Eksekutif**: Statistik real-time, grafik rata-rata per mapel (Recharts), ketuntasan KKTP, dan log terkini.
2. **Identitas Madrasah**: Nama madrasah, NPSN (60728192), NSM (111164020001), alamat Tanah Grogot, data Kepala Madrasah, dan upload logo.
3. **Tahun Pelajaran**: Manajemen tahun ajaran aktif & semester (Ganjil / Genap).
4. **Data Guru**: NIP, nama lengkap, penugasan mapel, kontak, dan status kepegawaian (PNS, PPPK, Non-PNS).
5. **Data Siswa**: Validasi unik NISN & NIS, filter rombel/kelas, impor file Excel (.xlsx), dan ekspor data siswa.
6. **Data Kelas**: Rombongan belajar tingkat 1 s/d 6 dan penetapan guru wali kelas.
7. **Mata Pelajaran**: Mapel PAI (Al-Qur'an Hadis, Akidah Akhlak, Fikih, SKI, Bahasa Arab), Umum (Matematika, IPAS, B. Indonesia, dsb), dan batas KKTP acuan.
8. **Manajemen Pengguna**: Manajemen akun login seluruh peran, reset password, dan status aktif.
9. **Bank Soal**: Mendukung 10 jenis soal (Pilihan Ganda, Kompleks, Benar/Salah, Menjodohkan, Isian Singkat, Esai), stimulus wacana kontekstual, dan notasi rumus matematika KaTeX ($\frac{a}{b}$, $\sqrt{x}$, $x^2$).
10. **Generator Soal AI Gemini**: Model `gemini-3.8-flash` terintegrasi server-side. Workflow 6 tahap: Form Input → Generate → Preview → Validasi Guru → Persetujuan → Simpan ke Bank Soal.
11. **Paket Ujian**: Konfigurasi token, durasi ujian, acak soal & opsi, KKTP, dan preview sebelum publikasi.
12. **Jadwal Ujian**: Kalender jadwal sesi asesmen dan pemantauan token aktif.
13. **Monitoring Ujian (Live Proctor)**: Realtime status peserta (Mengerjakan, Selesai, Terputus), progres bar, log pelanggaran tab switch, tombol tambah waktu, reset login, dan hentikan sesi.
14. **Hasil Asesmen**: Nilai akhir otomatis, skor per jenis soal, status ketuntasan KKTP, dan modal penilaian manual esai berbasis rubrik guru.
15. **Analisis Butir Soal (Psikometrik)**: Indeks Tingkat Kesukaran ($P$), Daya Pembeda ($D$), efektivitas opsi pengecoh, serta rekomendasi butir (Diterima, Revisi, Ditolak).
16. **Laporan & Ekspor**: Cetak Rapor Asesmen Individu Siswa, Rekap Nilai Kolektif Kelas, Ekspor PDF ber-kop madrasah resmi, dan Ekspor Excel (.xlsx).
17. **Pengaturan & Database Supabase**: Skrip migration SQL lengkap untuk 23 tabel PostgreSQL Supabase dengan RLS dan indeks.
18. **Audit Log**: Jejak audit sistem untuk keamanan dan kepatuhan.

---

## 🗄️ Skema Database PostgreSQL Supabase (23 Tabel)

Migration file tersedia di `supabase/migrations/20250101000000_min1paser_cbt_init.sql` dengan 23 tabel:
1. `profiles`
2. `school_settings`
3. `academic_years`
4. `classes`
5. `subjects`
6. `students`
7. `teachers`
8. `class_students`
9. `teacher_subjects`
10. `question_banks`
11. `questions`
12. `question_options`
13. `exams`
14. `exam_questions`
15. `exam_participants`
16. `exam_sessions`
17. `student_answers`
18. `exam_results`
19. `essay_rubrics`
20. `proctor_logs`
21. `exam_tokens`
22. `ai_generations`
23. `audit_logs`

Lengkap dengan Foreign Keys, Check Constraints, Indexes, Triggers, and Row Level Security (RLS) policies.

---

## 🚀 Akun Demo 1-Klik Siap Uji

- **Super Admin**: Username `admin` | Password `123456`
- **Admin Madrasah**: Username `admin_mi` | Password `123456`
- **Guru Pengampu**: Username `guru_ilham` | Password `123456`
- **Pengawas CBT**: Username `pengawas1` | Password `123456`
- **Siswa Peserta**: Username `siswa_faiz` | Password `123456`
