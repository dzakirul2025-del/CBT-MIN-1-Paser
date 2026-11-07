-- ==============================================================================
-- MIN 1 PASER CBT - MADRASAH DIGITAL ASSESSMENT SYSTEM
-- Complete Supabase PostgreSQL Schema & Migration (23 Tables + RLS + Functions)
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('super_admin', 'admin_madrasah', 'guru', 'pengawas', 'siswa');
CREATE TYPE question_type_enum AS ENUM ('pilihan_ganda', 'pilihan_ganda_kompleks', 'benar_salah', 'menjodohkan', 'isian_singkat', 'esai');
CREATE TYPE cognitive_level_enum AS ENUM ('C1', 'C2', 'C3', 'C4', 'C5', 'C6');
CREATE TYPE difficulty_enum AS ENUM ('Mudah', 'Sedang', 'Sukar');
CREATE TYPE session_status_enum AS ENUM ('not_started', 'working', 'submitted', 'interrupted', 'blocked');
CREATE TYPE exam_status_enum AS ENUM ('draft', 'published', 'ongoing', 'completed', 'archived');

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'siswa',
    email VARCHAR(255),
    nip_nisn VARCHAR(50),
    phone VARCHAR(30),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_nip_nisn ON profiles(nip_nisn);

-- 4. SCHOOL_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS school_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'MIN 1 Paser',
    subname VARCHAR(255) DEFAULT 'Madrasah Digital Assessment System',
    npsn VARCHAR(20) DEFAULT '60728192',
    nsm VARCHAR(30) DEFAULT '111164020001',
    address TEXT DEFAULT 'Jl. Kusuma Bangsa Km. 5, Tanah Grogot, Kab. Paser, Kalimantan Timur',
    subdistrict VARCHAR(100) DEFAULT 'Tanah Grogot',
    district VARCHAR(100) DEFAULT 'Kabupaten Paser',
    province VARCHAR(100) DEFAULT 'Kalimantan Timur',
    postal_code VARCHAR(10) DEFAULT '76211',
    phone VARCHAR(30) DEFAULT '(0543) 21102',
    email VARCHAR(100) DEFAULT 'min1paser@kemenag.go.id',
    website VARCHAR(100) DEFAULT 'https://min1paser.sch.id',
    headmaster_name VARCHAR(255) DEFAULT 'Drs. H. M. Syahril, M.Pd.I',
    headmaster_nip VARCHAR(50) DEFAULT '197108151998031004',
    logo_url TEXT,
    academic_year VARCHAR(50) DEFAULT '2024/2025',
    semester VARCHAR(20) DEFAULT 'Genap',
    theme_color VARCHAR(30) DEFAULT '#0B192C',
    accent_color VARCHAR(30) DEFAULT '#E6B325',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACADEMIC_YEARS TABLE
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year VARCHAR(20) NOT NULL, -- e.g. "2024/2025"
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('Ganjil', 'Genap')),
    is_active BOOLEAN DEFAULT FALSE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CLASSES TABLE
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL, -- "Kelas 1A", "Kelas 6B"
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 6),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE RESTRICT,
    homeroom_teacher_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    level_min INTEGER DEFAULT 1,
    level_max INTEGER DEFAULT 6,
    kktp_default NUMERIC(5,2) DEFAULT 75.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    nip VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('L', 'P')),
    email VARCHAR(100),
    phone VARCHAR(30),
    employment_status VARCHAR(50) DEFAULT 'PNS',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    nisn VARCHAR(20) UNIQUE NOT NULL,
    nis VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('L', 'P')),
    current_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    birth_place VARCHAR(100),
    birth_date DATE,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Mutasi', 'Lulus')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CLASS_STUDENTS TABLE (Historical enrollment)
CREATE TABLE IF NOT EXISTS class_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id, academic_year_id)
);

-- 11. TEACHER_SUBJECTS TABLE (Assignment)
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    UNIQUE(teacher_id, subject_id, class_id, academic_year_id)
);

-- 12. QUESTION_BANKS TABLE
CREATE TABLE IF NOT EXISTS question_banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 1 AND 6),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_id UUID REFERENCES question_banks(id) ON DELETE CASCADE,
    question_type question_type_enum NOT NULL,
    prompt TEXT NOT NULL,
    stimulus TEXT,
    image_url TEXT,
    audio_url TEXT,
    table_data JSONB,
    correct_answer JSONB NOT NULL,
    explanation TEXT,
    cognitive_level cognitive_level_enum DEFAULT 'C3',
    difficulty difficulty_enum DEFAULT 'Sedang',
    weight NUMERIC(5,2) DEFAULT 1.00,
    topic VARCHAR(255),
    indicator TEXT,
    learning_objective TEXT,
    is_validated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_questions_bank_id ON questions(bank_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);

-- 14. QUESTION_OPTIONS TABLE
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    option_key VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', 'D'
    option_text TEXT NOT NULL,
    image_url TEXT,
    match_target TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_question_options_qid ON question_options(question_id);

-- 15. EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(100) NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    grade_level INTEGER NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    proctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    token VARCHAR(10) NOT NULL,
    kktp NUMERIC(5,2) DEFAULT 75.00,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    shuffle_options BOOLEAN DEFAULT TRUE,
    allow_review_after_exam BOOLEAN DEFAULT FALSE,
    max_attempts INTEGER DEFAULT 1,
    status exam_status_enum DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. EXAM_QUESTIONS TABLE (Question to Exam mapping)
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(exam_id, question_id)
);

-- 17. EXAM_PARTICIPANTS TABLE (Eligible classes/students)
CREATE TABLE IF NOT EXISTS exam_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(exam_id, student_id)
);

-- 18. EXAM_SESSIONS TABLE (Live CBT state for student)
CREATE TABLE IF NOT EXISTS exam_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    status session_status_enum DEFAULT 'not_started',
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    remaining_seconds INTEGER NOT NULL,
    ip_address VARCHAR(50),
    device_info TEXT,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    tab_switch_count INTEGER DEFAULT 0,
    extra_time_minutes INTEGER DEFAULT 0,
    proctor_notes TEXT,
    UNIQUE(exam_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON exam_sessions(status);

-- 19. STUDENT_ANSWERS TABLE
CREATE TABLE IF NOT EXISTS student_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_value JSONB,
    is_doubt BOOLEAN DEFAULT FALSE,
    is_correct BOOLEAN,
    score_earned NUMERIC(5,2) DEFAULT 0,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, question_id)
);

-- 20. EXAM_RESULTS TABLE
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    total_score NUMERIC(6,2) NOT NULL,
    max_score NUMERIC(6,2) NOT NULL,
    final_grade NUMERIC(5,2) NOT NULL,
    kktp NUMERIC(5,2) NOT NULL,
    is_passed BOOLEAN NOT NULL,
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    unanswered_count INTEGER DEFAULT 0,
    essay_pending BOOLEAN DEFAULT FALSE,
    score_breakdown JSONB,
    teacher_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- 21. ESSAY_RUBRICS TABLE
CREATE TABLE IF NOT EXISTS essay_rubrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    criteria TEXT NOT NULL,
    max_points NUMERIC(5,2) NOT NULL,
    description TEXT
);

-- 22. PROCTOR_LOGS TABLE
CREATE TABLE IF NOT EXISTS proctor_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    proctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    incident_type VARCHAR(100) NOT NULL, -- e.g., 'tab_switch', 'disconnect', 'time_extended', 'forced_submit'
    details TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. EXAM_TOKENS TABLE
CREATE TABLE IF NOT EXISTS exam_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    token VARCHAR(10) NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 24. AI_GENERATIONS TABLE
CREATE TABLE IF NOT EXISTS ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    prompt_params JSONB NOT NULL,
    generated_questions JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can read all profiles; only super_admin & user themselves can update
CREATE POLICY "Public profiles are viewable by authenticated users"
ON profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- School Settings: Read by all authenticated; write by super_admin & admin_madrasah
CREATE POLICY "School settings readable by authenticated"
ON school_settings FOR SELECT USING (auth.role() = 'authenticated');

-- Exams: Published exams readable by students; teachers/admins manage their own
CREATE POLICY "Students can see published exams"
ON exams FOR SELECT USING (status = 'published' OR status = 'ongoing');

-- Student Answers: Students can only insert and update their own session answers
CREATE POLICY "Students manage own answers"
ON student_answers FOR ALL USING (
    session_id IN (
        SELECT id FROM exam_sessions WHERE student_id = auth.uid()
    )
);

-- Realtime publication for exam monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE exam_sessions, proctor_logs;
