-- ==============================================================================
-- 🎓 COMPLETE COLLEGE MANAGEMENT APP - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to create all tables, indexes,
-- relationships, and Row-Level Security (RLS) policies.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP TABLES IF THEY EXIST (for fresh setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS marks CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS dpp_questions CASCADE;
DROP TABLE IF EXISTS dpp_sets CASCADE;
DROP TABLE IF EXISTS doubt_replies CASCADE;
DROP TABLE IF EXISTS doubts CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS faculty_assignments CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS coordinators CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. CORE USERS TABLE
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    identifier VARCHAR(64) UNIQUE NOT NULL, -- Email, Employee ID, or Student ID (e.g. DIR001, HOD001, FAC001, CSE23B023)
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'password123',
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('director', 'hod', 'faculty', 'coordinator', 'student')),
    department VARCHAR(64),
    phone VARCHAR(32),
    avatar VARCHAR(500),
    designation VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DEPARTMENTS TABLE (5 Departments)
CREATE TABLE departments (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL, -- CSE, ECE, Biotech, Mechanical, IT
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(64) DEFAULT 'cpu',
    color VARCHAR(32) DEFAULT 'indigo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SECTIONS TABLE (11 Sections: CSE-A..E, ECE-A..B, Biotech-A, Mech-A, IT-A..B)
CREATE TABLE sections (
    id VARCHAR(64) PRIMARY KEY,
    dept_id VARCHAR(64) REFERENCES departments(id) ON DELETE CASCADE,
    dept_code VARCHAR(32) NOT NULL,
    name VARCHAR(16) NOT NULL, -- 'A', 'B', 'C', etc.
    full_name VARCHAR(64) UNIQUE NOT NULL, -- 'CSE-A', 'CSE-B', 'ECE-A'
    year INT NOT NULL DEFAULT 2,
    semester INT NOT NULL DEFAULT 3,
    capacity INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STUDENTS PROFILE TABLE
CREATE TABLE students (
    id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(64) UNIQUE NOT NULL,
    roll_no INT NOT NULL,
    dept_id VARCHAR(64) REFERENCES departments(id),
    dept_code VARCHAR(32) NOT NULL,
    section_id VARCHAR(64) REFERENCES sections(id),
    section_name VARCHAR(64) NOT NULL,
    year INT NOT NULL DEFAULT 2,
    semester INT NOT NULL DEFAULT 3,
    attendance NUMERIC(5,2) DEFAULT 85.00,
    sgpa NUMERIC(4,2) DEFAULT 8.00,
    cgpa NUMERIC(4,2) DEFAULT 8.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FACULTY PROFILE TABLE
CREATE TABLE faculty (
    id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    faculty_id VARCHAR(64) UNIQUE NOT NULL,
    dept_code VARCHAR(32) NOT NULL,
    specialization VARCHAR(255),
    designation VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUBJECTS TABLE
CREATE TABLE subjects (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) NOT NULL,
    semester INT NOT NULL DEFAULT 3,
    credits INT DEFAULT 4,
    faculty_id VARCHAR(64) REFERENCES users(id),
    faculty_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TIMETABLE
CREATE TABLE timetable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_name VARCHAR(64) NOT NULL,
    day VARCHAR(16) NOT NULL,
    time_slot VARCHAR(32) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    code VARCHAR(32),
    room VARCHAR(64),
    faculty_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ATTENDANCE TABLE
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(16) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
    marked_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. NOTES TABLE
CREATE TABLE notes (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) NOT NULL,
    section VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(64),
    file_url TEXT NOT NULL,
    author_id VARCHAR(64) REFERENCES users(id),
    author_name VARCHAR(255),
    upload_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ASSIGNMENTS TABLE
CREATE TABLE assignments (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    dept_code VARCHAR(32) NOT NULL,
    section VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    max_marks INT DEFAULT 20,
    author_id VARCHAR(64) REFERENCES users(id),
    author_name VARCHAR(255),
    file_url TEXT,
    status VARCHAR(32) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ASSIGNMENT SUBMISSIONS TABLE
CREATE TABLE assignment_submissions (
    id VARCHAR(64) PRIMARY KEY,
    assignment_id VARCHAR(64) REFERENCES assignments(id) ON DELETE CASCADE,
    student_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    student_roll VARCHAR(64) NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    file_name VARCHAR(255),
    file_url TEXT,
    grade VARCHAR(32),
    feedback TEXT,
    status VARCHAR(32) DEFAULT 'Submitted'
);

-- 14. DOUBTS TABLE (Student Doubt System with Photo Attachment)
CREATE TABLE doubts (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    student_roll VARCHAR(64) NOT NULL,
    student_avatar TEXT,
    department VARCHAR(32) NOT NULL,
    section VARCHAR(32) NOT NULL,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    faculty_id VARCHAR(64) REFERENCES users(id),
    faculty_name VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    attachment_url TEXT,
    attachment_name VARCHAR(255),
    status VARCHAR(32) DEFAULT 'Waiting for Teacher' CHECK (status IN ('Waiting for Teacher', 'Answered')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. DOUBT REPLIES TABLE
CREATE TABLE doubt_replies (
    id VARCHAR(64) PRIMARY KEY,
    doubt_id VARCHAR(64) REFERENCES doubts(id) ON DELETE CASCADE,
    author_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(32) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. DPP (DAILY PRACTICE PROBLEMS) TABLES
CREATE TABLE dpp_sets (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    questions_count INT DEFAULT 5,
    streak_day INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dpp_questions (
    id VARCHAR(64) PRIMARY KEY,
    dpp_set_id VARCHAR(64) REFERENCES dpp_sets(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of string options
    correct_index INT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. EXAMS TABLE
CREATE TABLE exams (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(64) NOT NULL, -- Mid-Semester, End-Semester, Internal
    subject VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL,
    exam_date DATE NOT NULL,
    time_slot VARCHAR(64) NOT NULL,
    room VARCHAR(64),
    status VARCHAR(32) DEFAULT 'Upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. NOTICES TABLE
CREATE TABLE notices (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target VARCHAR(64) NOT NULL, -- Entire College, CSE Department, CSE-B Section
    target_type VARCHAR(32) NOT NULL, -- college, dept, section, student
    target_value VARCHAR(64),
    author VARCHAR(255) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    priority VARCHAR(32) DEFAULT 'Normal',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. LEAVE REQUESTS TABLE
CREATE TABLE leave_requests (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    student_roll VARCHAR(64) NOT NULL,
    section VARCHAR(64) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    type VARCHAR(32) DEFAULT 'Personal',
    status VARCHAR(32) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    reviewed_by VARCHAR(255),
    review_note TEXT,
    applied_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR FAST PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_users_identifier ON users(identifier);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_dept_sec ON students(dept_code, section_name);
CREATE INDEX idx_doubts_faculty ON doubts(faculty_id, status);
CREATE INDEX idx_doubts_student ON doubts(student_id);
CREATE INDEX idx_notes_subject ON notes(subject_id);
CREATE INDEX idx_assignments_section ON assignments(section);
CREATE INDEX idx_leave_requests_section ON leave_requests(section, status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubt_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE dpp_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dpp_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read & insert for anon / authenticated service role in college system
CREATE POLICY "Public read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Public read all departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public read all sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Public read all students" ON students FOR SELECT USING (true);
CREATE POLICY "Public read all faculty" ON faculty FOR SELECT USING (true);
CREATE POLICY "Public read all subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read all timetable" ON timetable FOR SELECT USING (true);
CREATE POLICY "Public read all notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Public read all assignments" ON assignments FOR SELECT USING (true);
CREATE POLICY "Public read all submissions" ON assignment_submissions FOR SELECT USING (true);
CREATE POLICY "Public read all doubts" ON doubts FOR SELECT USING (true);
CREATE POLICY "Public read all doubt_replies" ON doubt_replies FOR SELECT USING (true);
CREATE POLICY "Public read all dpp_sets" ON dpp_sets FOR SELECT USING (true);
CREATE POLICY "Public read all dpp_questions" ON dpp_questions FOR SELECT USING (true);
CREATE POLICY "Public read all exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Public read all notices" ON notices FOR SELECT USING (true);
CREATE POLICY "Public read all leave_requests" ON leave_requests FOR SELECT USING (true);
CREATE POLICY "Public read all notifications" ON notifications FOR SELECT USING (true);

-- Allow insertions and updates
CREATE POLICY "Allow insert doubts" ON doubts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow insert doubt_replies" ON doubt_replies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow insert leave_requests" ON leave_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow update leave_requests" ON leave_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow insert notes" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow insert assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow insert submissions" ON assignment_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow insert notices" ON notices FOR ALL USING (true) WITH CHECK (true);
