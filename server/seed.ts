/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getInitialDb() {
  const schoolSettings = {
    id: 'school_min1paser',
    name: 'MIN 1 Paser',
    subname: 'Madrasah Digital Assessment System',
    npsn: '60728192',
    nsm: '111164020001',
    address: 'Jl. Kusuma Bangsa Km. 5, Tepian Batang, Tanah Grogot, Kab. Paser',
    subdistrict: 'Tanah Grogot',
    district: 'Kabupaten Paser',
    province: 'Kalimantan Timur',
    postalCode: '76211',
    phone: '(0543) 21102',
    email: 'min1paser@kemenag.go.id',
    website: 'https://min1paser.sch.id',
    headmasterName: 'Drs. H. M. Syahril, M.Pd.I',
    headmasterNip: '197108151998031004',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=80',
    academicYear: '2024/2025',
    semester: 'Genap',
    themeColor: '#0B192C',
    accentColor: '#E6B325'
  };

  const academicYears = [
    {
      id: 'ay_2024_2025_2',
      year: '2024/2025',
      semester: 'Genap',
      isActive: true,
      startDate: '2025-01-06',
      endDate: '2025-06-21'
    },
    {
      id: 'ay_2024_2025_1',
      year: '2024/2025',
      semester: 'Ganjil',
      isActive: false,
      startDate: '2024-07-15',
      endDate: '2024-12-20'
    }
  ];

  const classes = [
    { id: 'cls_1a', name: 'Kelas 1A', level: 1, academicYearId: 'ay_2024_2025_2', homeroomTeacherName: 'Hj. Fatimah Zahra, S.Pd', studentCount: 28 },
    { id: 'cls_1b', name: 'Kelas 1B', level: 1, academicYearId: 'ay_2024_2025_2', homeroomTeacherName: 'Nur Hasanah, S.Pd.I', studentCount: 27 },
    { id: 'cls_2a', name: 'Kelas 2A', level: 2, academicYearId: 'ay_2024_2025_2', homeroomTeacherName: 'Dewi Lestari, S.Pd', studentCount: 29 },
    { id: 'cls_2b', name: 'Kelas 2B', level: 2, academicYearId: 'ay_2024_2025_2', homeroomTeacherName: 'Rahmat Hidayat, S.Pd', studentCount: 28 },
    { id: 'cls_3a', name: 'Kelas 3A', level: 3, academicYearId: 'ay_2024_2025_2', homeroomTeacherName: 'Siti Aminah, M.Pd', studentCount: 30 },
    { id: 'cls_4a', name: 'Kelas 4A', level: 4, academicYearId: 'ay_2024_2025_2', homeroomTeacherName: 'Agus Salim, S.Pd.I', studentCount: 31 },
    { id: 'cls_5a', name: 'Kelas 5A', level: 5, academicYearId: 'ay_2024_2025_2', homeroomTeacherName: 'Zainab, S.Ag', studentCount: 30 },
    { id: 'cls_6a', name: 'Kelas 6A', level: 6, academicYearId: 'ay_2024_2025_2', homeroomTeacherName: 'Ust. Muhammad Ilham, M.Pd', studentCount: 32 },
    { id: 'cls_6b', name: 'Kelas 6B', level: 6, academicYearId: 'ay_2024_2025_2', homeroomTeacherName: 'Bambang Irawan, S.Pd', studentCount: 31 }
  ];

  const subjects = [
    { id: 'sub_qurdis', code: 'QH-01', name: "Al-Qur'an Hadis", category: 'Pendidikan Agama Islam', levelMin: 1, levelMax: 6, kktpDefault: 75 },
    { id: 'sub_akidah', code: 'AA-02', name: 'Akidah Akhlak', category: 'Pendidikan Agama Islam', levelMin: 1, levelMax: 6, kktpDefault: 75 },
    { id: 'sub_fikih', code: 'FK-03', name: 'Fikih', category: 'Pendidikan Agama Islam', levelMin: 1, levelMax: 6, kktpDefault: 75 },
    { id: 'sub_ski', code: 'SK-04', name: 'Sejarah Kebudayaan Islam (SKI)', category: 'Pendidikan Agama Islam', levelMin: 3, levelMax: 6, kktpDefault: 75 },
    { id: 'sub_arab', code: 'BA-05', name: 'Bahasa Arab', category: 'Pendidikan Agama Islam', levelMin: 1, levelMax: 6, kktpDefault: 70 },
    { id: 'sub_indo', code: 'BI-06', name: 'Bahasa Indonesia', category: 'Umum', levelMin: 1, levelMax: 6, kktpDefault: 75 },
    { id: 'sub_mtk', code: 'MT-07', name: 'Matematika', category: 'Umum', levelMin: 1, levelMax: 6, kktpDefault: 72 },
    { id: 'sub_ipas', code: 'IP-08', name: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', category: 'Umum', levelMin: 3, levelMax: 6, kktpDefault: 74 },
    { id: 'sub_pkn', code: 'PP-09', name: 'Pendidikan Pancasila', category: 'Umum', levelMin: 1, levelMax: 6, kktpDefault: 75 },
    { id: 'sub_sbdp', code: 'SB-10', name: 'Seni Budaya & Prakarya', category: 'Umum', levelMin: 1, levelMax: 6, kktpDefault: 75 }
  ];

  const teachers = [
    {
      id: 't_ilham',
      nip: '198405122009121003',
      name: 'Ust. Muhammad Ilham, M.Pd',
      gender: 'L',
      email: 'ilham@min1paser.sch.id',
      phone: '081254329988',
      subjectIds: ['sub_fikih', 'sub_qurdis'],
      subjectNames: ['Fikih', "Al-Qur'an Hadis"],
      status: 'PNS',
      isHomeroom: true
    },
    {
      id: 't_fatimah',
      nip: '198902142014032002',
      name: 'Hj. Fatimah Zahra, S.Pd',
      gender: 'P',
      email: 'fatimah@min1paser.sch.id',
      phone: '081347651234',
      subjectIds: ['sub_mtk', 'sub_ipas'],
      subjectNames: ['Matematika', 'IPAS'],
      status: 'PNS',
      isHomeroom: true
    },
    {
      id: 't_ruslan',
      nip: '197609202005011005',
      name: 'Bpk. H. Ruslan Effendi, S.Ag',
      gender: 'L',
      email: 'ruslan@min1paser.sch.id',
      phone: '081250987654',
      subjectIds: ['sub_akidah', 'sub_ski'],
      subjectNames: ['Akidah Akhlak', 'SKI'],
      status: 'PNS',
      isHomeroom: false
    }
  ];

  const students = [
    {
      id: 'std_faiz',
      nisn: '0091234567',
      nis: '21220101',
      name: 'Muhammad Faiz Al-Farizi',
      gender: 'L',
      classId: 'cls_6a',
      className: 'Kelas 6A',
      birthPlace: 'Tanah Grogot',
      birthDate: '2013-04-12',
      parentName: 'H. Farhan, S.T',
      parentPhone: '081234567890',
      status: 'Aktif'
    },
    {
      id: 'std_aisyah',
      nisn: '0091234568',
      nis: '21220102',
      name: 'Aisyah Putri Rahmadani',
      gender: 'P',
      classId: 'cls_6a',
      className: 'Kelas 6A',
      birthPlace: 'Batu Sopang',
      birthDate: '2013-08-25',
      parentName: 'Rahmat Hidayat',
      parentPhone: '081234567891',
      status: 'Aktif'
    },
    {
      id: 'std_rizky',
      nisn: '0091234569',
      nis: '21220103',
      name: 'Rizky Pratama Wijaya',
      gender: 'L',
      classId: 'cls_6a',
      className: 'Kelas 6A',
      birthPlace: 'Kuaro',
      birthDate: '2013-02-18',
      parentName: 'Drs. Supriyanto',
      parentPhone: '081234567892',
      status: 'Aktif'
    },
    {
      id: 'std_nabila',
      nisn: '0091234570',
      nis: '21220104',
      name: 'Nabila Khairunnisa',
      gender: 'P',
      classId: 'cls_6a',
      className: 'Kelas 6A',
      birthPlace: 'Tanah Grogot',
      birthDate: '2013-11-05',
      parentName: 'H. Abdullah Halim',
      parentPhone: '081234567893',
      status: 'Aktif'
    },
    {
      id: 'std_danial',
      nisn: '0091234571',
      nis: '21220105',
      name: 'Danial Akbar Ramadhan',
      gender: 'L',
      classId: 'cls_6a',
      className: 'Kelas 6A',
      birthPlace: 'Pasir Belengkong',
      birthDate: '2013-07-19',
      parentName: 'Ir. Rusdianto',
      parentPhone: '081234567894',
      status: 'Aktif'
    }
  ];

  const users = [
    {
      id: 'usr_superadmin',
      username: 'admin',
      name: 'Ahmad Ridwan, S.Kom',
      role: 'super_admin',
      email: 'admin@min1paser.sch.id',
      nip_nisn: '198811202010011008',
      password: '123456',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'usr_adminmadrasah',
      username: 'admin_mi',
      name: 'Siti Nurhaliza, S.Pd.I',
      role: 'admin_madrasah',
      email: 'sitializa@min1paser.sch.id',
      nip_nisn: '199203152015032004',
      password: '123456',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 't_ilham',
      username: 'guru_ilham',
      name: 'Ust. Muhammad Ilham, M.Pd',
      role: 'guru',
      email: 'ilham@min1paser.sch.id',
      nip_nisn: '198405122009121003',
      password: '123456',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 't_fatimah',
      username: 'guru_fatimah',
      name: 'Hj. Fatimah Zahra, S.Pd',
      role: 'guru',
      email: 'fatimah@min1paser.sch.id',
      nip_nisn: '198902142014032002',
      password: '123456',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'usr_pengawas',
      username: 'pengawas1',
      name: 'Bpk. H. Ruslan Effendi, S.Ag',
      role: 'pengawas',
      email: 'ruslan@min1paser.sch.id',
      nip_nisn: '197609202005011005',
      password: '123456',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    // Siswa accounts
    {
      id: 'std_faiz',
      username: 'siswa_faiz',
      name: 'Muhammad Faiz Al-Farizi',
      role: 'siswa',
      email: '0091234567@siswa.min1paser.sch.id',
      nip_nisn: '0091234567',
      class_id: 'cls_6a',
      className: 'Kelas 6A',
      password: '123456',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'std_aisyah',
      username: 'siswa_aisyah',
      name: 'Aisyah Putri Rahmadani',
      role: 'siswa',
      email: '0091234568@siswa.min1paser.sch.id',
      nip_nisn: '0091234568',
      class_id: 'cls_6a',
      className: 'Kelas 6A',
      password: '123456',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'std_rizky',
      username: 'siswa_rizky',
      name: 'Rizky Pratama Wijaya',
      role: 'siswa',
      email: '0091234569@siswa.min1paser.sch.id',
      nip_nisn: '0091234569',
      class_id: 'cls_6a',
      className: 'Kelas 6A',
      password: '123456',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  const questionBanks = [
    {
      id: 'qb_fikih_6',
      title: 'Bank Soal Fikih Kelas 6 MI – Qurban & Aqiqah',
      subjectId: 'sub_fikih',
      subjectName: 'Fikih',
      gradeLevel: 6,
      authorId: 't_ilham',
      authorName: 'Ust. Muhammad Ilham, M.Pd',
      academicYearId: 'ay_2024_2025_2',
      totalQuestions: 6,
      createdAt: '2025-02-10T08:00:00Z',
      description: 'Kumpulan soal asesmen sumatif materi qurban dan aqiqah standar kurikulum madrasah.'
    },
    {
      id: 'qb_mtk_6',
      title: 'Bank Soal Matematika Kelas 6 – Pecahan & Bangun Ruang',
      subjectId: 'sub_mtk',
      subjectName: 'Matematika',
      gradeLevel: 6,
      authorId: 't_fatimah',
      authorName: 'Hj. Fatimah Zahra, S.Pd',
      academicYearId: 'ay_2024_2025_2',
      totalQuestions: 5,
      createdAt: '2025-02-11T09:30:00Z',
      description: 'Soal matematika dengan persamaan LaTeX dan soal HOTS pemecahan masalah.'
    }
  ];

  const questions = [
    {
      id: 'q_fikih_1',
      bankId: 'qb_fikih_6',
      type: 'pilihan_ganda',
      stimulus: 'Keluarga Pak Burhan di Kecamatan Tanah Grogot menyembelih satu ekor kambing jantan berumur 2 tahun pada hari raya Idul Adha setelah shalat ied berjamaah di Masjid Agung Nurul Falah Paser.',
      prompt: 'Berdasarkan ilustrasi di atas, hukum ibadah qurban bagi orang yang mampu menurut mayoritas ulama adalah...',
      cognitiveLevel: 'C2',
      difficulty: 'Mudah',
      weight: 1,
      topic: 'Ketentuan Ibadah Qurban',
      indicator: 'Disajikan deskripsi pelaksanaan qurban, siswa dapat menentukan hukum ibadah qurban.',
      options: [
        { key: 'A', text: 'Fardhu ain bagi seluruh keluarga' },
        { key: 'B', text: 'Sunnah muakkad bagi yang berkemampuan' },
        { key: 'C', text: 'Mubah dan dianjurkan satu kali seumur hidup' },
        { key: 'D', text: 'Wajib kifayah bagi tiap rukun tetangga' }
      ],
      correctAnswer: 'B',
      explanation: 'Hukum qurban menurut jumhur (mayoritas) ulama madzhab Syafi\'i adalah Sunnah Muakkad (sangat dianjurkan) bagi muslim yang telah baligh, berakal, dan mampu.',
      isValidated: true,
      createdAt: '2025-02-10T08:30:00Z'
    },
    {
      id: 'q_fikih_2',
      bankId: 'qb_fikih_6',
      type: 'pilihan_ganda_kompleks',
      stimulus: 'Panitia qurban di MIN 1 Paser sedang memeriksa kelayakan hewan qurban yang diserahkan wali murid.',
      prompt: 'Pilihlah DUA syarat fisik hewan qurban yang sah sesuai syariat Islam! (Pilih 2 jawaban yang benar)',
      cognitiveLevel: 'C3',
      difficulty: 'Sedang',
      weight: 2,
      topic: 'Syarat Hewan Qurban',
      indicator: 'Siswa dapat mengidentifikasi syarat fisik hewan yang sah untuk qurban.',
      options: [
        { key: 'A', text: 'Telah mencapai batas umur minimal (musinnah) dan berganti gigi' },
        { key: 'B', text: 'Boleh buta sebelah asalkan tubuhnya sangat gemuk' },
        { key: 'C', text: 'Sehat dan tidak cacat fisik nyata (tidak pincang, tidak kurus kering)' },
        { key: 'D', text: 'Harus dipelihara di kandang tertutup minimal 1 tahun' }
      ],
      correctAnswer: ['A', 'C'],
      explanation: 'Syarat sah hewan qurban adalah musinnah (cukup umur) dan selamat dari aib/cacat fisik nyata seperti buta, pincang, sakit berat, atau kurus sumsum.',
      isValidated: true,
      createdAt: '2025-02-10T08:45:00Z'
    },
    {
      id: 'q_fikih_3',
      bankId: 'qb_fikih_6',
      type: 'benar_salah',
      stimulus: 'Ketentuan waktu penyembelihan qurban.',
      prompt: 'Penyembelihan hewan qurban boleh dilaksanakan pada tanggal 10 Dzulhijjah setelah shalat Idul Adha sampai terbenamnya matahari pada tanggal 13 Dzulhijjah (Hari Tasyrik).',
      cognitiveLevel: 'C2',
      difficulty: 'Mudah',
      weight: 1,
      topic: 'Waktu Penyembelihan Qurban',
      indicator: 'Siswa dapat mengevaluasi kebenaran rentang waktu penyembelihan qurban.',
      options: [
        { key: 'A', text: 'BENAR' },
        { key: 'B', text: 'SALAH' }
      ],
      correctAnswer: 'A',
      explanation: 'Benar, waktu penyembelihan qurban dimulai usai shalat Idul Adha (10 Dzulhijjah) hingga terbenam matahari akhir hari Tasyrik (13 Dzulhijjah).',
      isValidated: true,
      createdAt: '2025-02-10T09:00:00Z'
    },
    {
      id: 'q_fikih_4',
      bankId: 'qb_fikih_6',
      type: 'menjodohkan',
      stimulus: 'Perbedaan mendasar antara ibadah Qurban dan Aqiqah.',
      prompt: 'Jodohkanlah ketentuan ibadah di kolom sebelah kiri dengan jumlah kambing/waktu yang sesuai di kolom sebelah kanan!',
      cognitiveLevel: 'C4',
      difficulty: 'Sedang',
      weight: 2,
      topic: 'Perbandingan Qurban dan Aqiqah',
      indicator: 'Siswa dapat memasangkan konsep qurban dan aqiqah secara tepat.',
      options: [
        { key: '1', text: 'Aqiqah anak laki-laki', matchTarget: '2 ekor kambing/domba' },
        { key: '2', text: 'Aqiqah anak perempuan', matchTarget: '1 ekor kambing/domba' },
        { key: '3', text: 'Patungan sapi qurban', matchTarget: 'Maksimal 7 orang' },
        { key: '4', text: 'Waktu utama aqiqah', matchTarget: 'Hari ke-7 setelah kelahiran' }
      ],
      correctAnswer: { '1': '2 ekor kambing/domba', '2': '1 ekor kambing/domba', '3': 'Maksimal 7 orang', '4': 'Hari ke-7 setelah kelahiran' },
      explanation: 'Sunnah aqiqah bagi anak laki-laki adalah 2 ekor kambing, perempuan 1 ekor, paling utama hari ke-7. Sedangkan seekor sapi dapat diperuntukkan bagi 7 orang.',
      isValidated: true,
      createdAt: '2025-02-10T09:15:00Z'
    },
    {
      id: 'q_fikih_5',
      bankId: 'qb_fikih_6',
      type: 'isian_singkat',
      stimulus: 'Pembagian daging hasil ibadah.',
      prompt: 'Dalam ibadah aqiqah, daging sunnah dibagikan kepada fakir miskin dan tetangga dalam kondisi sudah...',
      cognitiveLevel: 'C2',
      difficulty: 'Mudah',
      weight: 1,
      topic: 'Distribusi Daging Aqiqah',
      indicator: 'Siswa dapat menyebutkan kondisi daging aqiqah saat dibagikan.',
      options: [],
      correctAnswer: 'matang',
      explanation: 'Daging aqiqah disunnahkan untuk dibagikan dalam keadaan sudah dimasak (matang) manis, berbeda dengan qurban yang dibagikan dalam bentuk daging mentah.',
      isValidated: true,
      createdAt: '2025-02-10T09:30:00Z'
    },
    {
      id: 'q_fikih_6',
      bankId: 'qb_fikih_6',
      type: 'esai',
      stimulus: 'Kisah Nabi Ibrahim AS dan putranya Nabi Ismail AS menjadi dasar pensyariatan ibadah qurban.',
      prompt: 'Jelaskan 3 (tiga) nilai keteladanan yang dapat dipetik oleh siswa madrasah dari peristiwa qurban Nabi Ibrahim dan Nabi Ismail AS!',
      cognitiveLevel: 'C5',
      difficulty: 'Sedang',
      weight: 4,
      topic: 'Hikmah Ibadah Qurban',
      indicator: 'Siswa dapat menganalisis nilai karakter dan keteladanan dari peristiwa qurban.',
      options: [],
      correctAnswer: '1. Ketaatan mutlak kepada perintah Allah SWT. 2. Berbakti dan patuh kepada orang tua (birrul walidain). 3. Keikhlasan berkorban serta menumbuhkan kepedulian sosial bagi sesama.',
      explanation: 'Kriteria penilaian: menyebutkan ketaatan kepada Allah, birrul walidain, dan kepedulian sosial/keikhlasan berkorban.',
      isValidated: true,
      createdAt: '2025-02-10T09:45:00Z'
    },
    // Soal Matematika dengan LaTeX
    {
      id: 'q_mtk_1',
      bankId: 'qb_mtk_6',
      type: 'pilihan_ganda',
      stimulus: 'Di laboratorium sains MIN 1 Paser, terdapat larutan dengan takaran pecahan.',
      prompt: 'Hitunglah hasil dari operasi pecahan campuran berikut: $2\\frac{1}{2} + 1\\frac{3}{4} \\times \\frac{2}{3} = \\dots$',
      cognitiveLevel: 'C3',
      difficulty: 'Sedang',
      weight: 1,
      topic: 'Operasi Hitung Pecahan',
      indicator: 'Siswa dapat menghitung operasi hitung campuran pecahan dengan urutan operasi yang benar.',
      options: [
        { key: 'A', text: '$3\\frac{2}{3}$' },
        { key: 'B', text: '$2\\frac{5}{6}$' },
        { key: 'C', text: '$3\\frac{1}{2}$' },
        { key: 'D', text: '$4\\frac{1}{4}$' }
      ],
      correctAnswer: 'A',
      explanation: 'Langkah pengerjaan: Perkalian didahulukan: 1 3/4 x 2/3 = 7/4 x 2/3 = 14/12 = 7/6 = 1 1/6. Kemudian tambahkan: 2 1/2 + 1 1/6 = 2 3/6 + 1 1/6 = 3 4/6 = 3 2/3.',
      isValidated: true,
      createdAt: '2025-02-11T10:00:00Z'
    },
    {
      id: 'q_mtk_2',
      bankId: 'qb_mtk_6',
      type: 'pilihan_ganda',
      stimulus: 'Sebuah kolam wudhu di MIN 1 Paser berbentuk balok.',
      prompt: 'Sebuah bak penampungan air wudhu berukuran panjang $120\\text{ cm}$, lebar $80\\text{ cm}$, dan tinggi $50\\text{ cm}$. Volume air di dalam bak jika terisi penuh adalah ... liter.',
      cognitiveLevel: 'C3',
      difficulty: 'Sedang',
      weight: 1,
      topic: 'Volume Bangun Ruang',
      indicator: 'Siswa dapat menentukan volume balok dalam satuan liter.',
      options: [
        { key: 'A', text: '480 liter' },
        { key: 'B', text: '4.800 liter' },
        { key: 'C', text: '48 liter' },
        { key: 'D', text: '960 liter' }
      ],
      correctAnswer: 'A',
      explanation: 'Volume = p x l x t = 120 x 80 x 50 = 480.000 cm³. Karena 1 liter = 1.000 cm³, maka 480.000 / 1.000 = 480 liter.',
      isValidated: true,
      createdAt: '2025-02-11T10:15:00Z'
    }
  ];

  const exams = [
    {
      id: 'ex_fikih_sas6',
      title: 'Sumatif Akhir Semester (SAS) Fikih Kelas 6',
      assessmentType: 'Sumatif Akhir Semester',
      subjectId: 'sub_fikih',
      subjectName: 'Fikih',
      gradeLevel: 6,
      targetClassIds: ['cls_6a', 'cls_6b'],
      targetClassNames: ['Kelas 6A', 'Kelas 6B'],
      authorTeacherId: 't_ilham',
      authorName: 'Ust. Muhammad Ilham, M.Pd',
      proctorTeacherId: 'usr_pengawas',
      proctorName: 'Bpk. H. Ruslan Effendi, S.Ag',
      startDate: '2025-06-02',
      endDate: '2025-06-02',
      startTime: '07:30',
      endTime: '09:00',
      durationMinutes: 60,
      token: 'PASER25',
      kktp: 75,
      totalQuestions: 6,
      totalScore: 11,
      shuffleQuestions: true,
      shuffleOptions: true,
      allowReviewAfterExam: true,
      maxAttempts: 1,
      status: 'ongoing',
      questionIds: ['q_fikih_1', 'q_fikih_2', 'q_fikih_3', 'q_fikih_4', 'q_fikih_5', 'q_fikih_6'],
      createdAt: '2025-02-15T08:00:00Z'
    },
    {
      id: 'ex_mtk_simulasi',
      title: 'Simulasi CBT Asesmen Matematika Kelas 6',
      assessmentType: 'Asesmen Harian',
      subjectId: 'sub_mtk',
      subjectName: 'Matematika',
      gradeLevel: 6,
      targetClassIds: ['cls_6a'],
      targetClassNames: ['Kelas 6A'],
      authorTeacherId: 't_fatimah',
      authorName: 'Hj. Fatimah Zahra, S.Pd',
      proctorTeacherId: 'usr_pengawas',
      proctorName: 'Bpk. H. Ruslan Effendi, S.Ag',
      startDate: '2025-06-03',
      endDate: '2025-06-03',
      startTime: '09:30',
      endTime: '11:00',
      durationMinutes: 45,
      token: 'MTK6MI',
      kktp: 72,
      totalQuestions: 2,
      totalScore: 2,
      shuffleQuestions: false,
      shuffleOptions: true,
      allowReviewAfterExam: true,
      maxAttempts: 1,
      status: 'published',
      questionIds: ['q_mtk_1', 'q_mtk_2'],
      createdAt: '2025-02-15T09:00:00Z'
    }
  ];

  const examSessions = [
    {
      id: 'sess_aisyah_sas6',
      examId: 'ex_fikih_sas6',
      examTitle: 'Sumatif Akhir Semester (SAS) Fikih Kelas 6',
      studentId: 'std_aisyah',
      studentName: 'Aisyah Putri Rahmadani',
      studentNisn: '0091234568',
      className: 'Kelas 6A',
      startTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      remainingSeconds: 0,
      status: 'submitted',
      answeredCount: 6,
      flaggedCount: 0,
      lastHeartbeat: new Date().toISOString(),
      tabSwitchCount: 0,
      extraTimeGrantedMinutes: 0,
      answers: {
        q_fikih_1: 'B',
        q_fikih_2: ['A', 'C'],
        q_fikih_3: 'A',
        q_fikih_4: { '1': '2 ekor kambing/domba', '2': '1 ekor kambing/domba', '3': 'Maksimal 7 orang', '4': 'Hari ke-7 setelah kelahiran' },
        q_fikih_5: 'matang',
        q_fikih_6: 'Meneladani kepatuhan kepada Allah, cinta dan hormat pada orang tua, serta berbagi rezeki kepada mereka yang membutuhkan.'
      },
      flaggedQuestionIds: [],
      score: 91,
      passed: true
    },
    {
      id: 'sess_rizky_sas6',
      examId: 'ex_fikih_sas6',
      examTitle: 'Sumatif Akhir Semester (SAS) Fikih Kelas 6',
      studentId: 'std_rizky',
      studentName: 'Rizky Pratama Wijaya',
      studentNisn: '0091234569',
      className: 'Kelas 6A',
      startTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      remainingSeconds: 40 * 60,
      status: 'working',
      answeredCount: 4,
      flaggedCount: 1,
      lastHeartbeat: new Date().toISOString(),
      tabSwitchCount: 1,
      extraTimeGrantedMinutes: 0,
      answers: {
        q_fikih_1: 'B',
        q_fikih_2: ['A', 'C'],
        q_fikih_3: 'A',
        q_fikih_4: { '1': '2 ekor kambing/domba', '2': '1 ekor kambing/domba' }
      },
      flaggedQuestionIds: ['q_fikih_4']
    },
    {
      id: 'sess_faiz_sas6',
      examId: 'ex_fikih_sas6',
      examTitle: 'Sumatif Akhir Semester (SAS) Fikih Kelas 6',
      studentId: 'std_faiz',
      studentName: 'Muhammad Faiz Al-Farizi',
      studentNisn: '0091234567',
      className: 'Kelas 6A',
      startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      remainingSeconds: 45 * 60,
      status: 'working',
      answeredCount: 3,
      flaggedCount: 0,
      lastHeartbeat: new Date().toISOString(),
      tabSwitchCount: 0,
      extraTimeGrantedMinutes: 0,
      answers: {
        q_fikih_1: 'B',
        q_fikih_2: ['A', 'C'],
        q_fikih_3: 'A'
      },
      flaggedQuestionIds: []
    }
  ];

  const examResults = [
    {
      id: 'res_aisyah_sas6',
      examId: 'ex_fikih_sas6',
      examTitle: 'Sumatif Akhir Semester (SAS) Fikih Kelas 6',
      subjectName: 'Fikih',
      studentId: 'std_aisyah',
      studentName: 'Aisyah Putri Rahmadani',
      studentNisn: '0091234568',
      className: 'Kelas 6A',
      totalScore: 10,
      maxScore: 11,
      finalGrade: 91,
      kktp: 75,
      isPassed: true,
      correctAnswersCount: 5,
      wrongAnswersCount: 0,
      unansweredCount: 0,
      essayPendingGrading: false,
      scoreBreakdown: {
        pilihanGandaScore: 1,
        kompleksScore: 2,
        benarSalahScore: 1,
        menjodohkanScore: 2,
        isianScore: 1,
        esaiScore: 3
      },
      teacherNotes: 'Pemahaman konsep qurban dan aqiqah sangat baik. Esai diuraikan dengan argumen yang santun dan tepat.',
      submittedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    }
  ];

  const proctorLogs = [
    {
      id: 'proc_1',
      examId: 'ex_fikih_sas6',
      studentId: 'std_rizky',
      incident_type: 'tab_switch',
      details: 'Peringatan: Peserta Rizky Pratama berpindah tab browser sebanyak 1x',
      logged_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    }
  ];

  const aiGenerations = [
    {
      id: 'gen_seed_1',
      promptParams: {
        subject: 'Fikih',
        gradeLevel: 6,
        topic: 'Tata Cara Shalat Gerhana (Khusuf dan Kusuf)',
        learningObjective: 'Memahami rukun dan tata cara shalat gerhana matahari dan bulan',
        indicator: 'Disajikan narasi fenomena alam, siswa dapat menentukan jumlah ruku dalam tiap rakaat shalat gerhana',
        count: 3,
        questionTypes: ['pilihan_ganda', 'esai'],
        difficulty: 'Sedang',
        cognitiveLevel: 'C4',
        includeStimulus: true
      },
      generatedCount: 3,
      status: 'approved',
      createdAt: '2025-02-12T10:00:00Z',
      generatedQuestions: [
        {
          id: 'ai_q_demo_1',
          bankId: '',
          type: 'pilihan_ganda',
          stimulus: 'Masyarakat Paser menyaksikan fenomena gerhana bulan total di langit Tanah Grogot. Takmir masjid mengumumkan akan melaksanakan shalat gerhana secara berjamaah.',
          prompt: 'Tata cara shalat sunnah gerhana (khusuf/kusuf) memiliki perbedaan dengan shalat fardhu pada umumnya, yaitu setiap rakaat memiliki...',
          cognitiveLevel: 'C4',
          difficulty: 'Sedang',
          weight: 1,
          topic: 'Shalat Gerhana',
          options: [
            { key: 'A', text: 'Dua kali berdiri membaca surat dan dua kali ruku' },
            { key: 'B', text: 'Satu kali ruku dan empat kali sujud' },
            { key: 'C', text: 'Tiga kali ruku dan dua kali tasyahud' },
            { key: 'D', text: 'Dua kali sujud sahwi sebelum salam' }
          ],
          correctAnswer: 'A',
          explanation: 'Shalat gerhana dilakukan sebanyak 2 rakaat, di mana pada setiap rakaat terdapat 2 kali berdiri (membaca Al-Fatihah dan surat) serta 2 kali ruku.',
          isValidated: true,
          createdAt: '2025-02-12T10:02:00Z'
        }
      ]
    }
  ];

  const auditLogs = [
    {
      id: 'log_seed_1',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      userId: 'usr_superadmin',
      userName: 'Ahmad Ridwan, S.Kom',
      userRole: 'super_admin',
      action: 'INIT_SYSTEM',
      module: 'Sistem',
      details: 'Inisialisasi sistem MIN 1 Paser CBT berhasil disiapkan',
      ipAddress: '127.0.0.1'
    },
    {
      id: 'log_seed_2',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      userId: 't_ilham',
      userName: 'Ust. Muhammad Ilham, M.Pd',
      userRole: 'guru',
      action: 'PUBLISH_EXAM',
      module: 'Paket Ujian',
      details: 'Mempublikasikan paket ujian Sumatif Akhir Semester Fikih Kelas 6',
      ipAddress: '127.0.0.1'
    }
  ];

  return {
    schoolSettings,
    academicYears,
    classes,
    subjects,
    teachers,
    students,
    users,
    questionBanks,
    questions,
    exams,
    examSessions,
    examResults,
    proctorLogs,
    aiGenerations,
    auditLogs
  };
}
