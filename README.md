# 🎓 Complete College Management & Learning Portal

A full-stack, enterprise-grade College Management and Learning System built with **Node.js**, **Express**, and **Supabase (PostgreSQL & Storage)**.

---

## 🏛️ 1. College Structure & Section Identification

The college has **5 Departments** and **11 Sections**:

| Department | Sections | Identification Rule |
| :--- | :--- | :--- |
| **CSE** | A, B, C, D, E | **CSE-A, CSE-B, CSE-C, CSE-D, CSE-E** |
| **ECE** | A, B | **ECE-A, ECE-B** |
| **Biotech** | A | **Biotech-A** |
| **Mechanical** | A | **Mechanical-A** |
| **IT** | A, B | **IT-A, IT-B** |
| **Total** | **11 Sections** | *A section is always identified together with its department: CSE-A ≠ ECE-A* |

---

## 👑 2. Five Roles & Distinct UI Theming

Each role has a distinct visual theme and dedicated features:

```
                    👑 DIRECTOR
                         │
                         ↓
                       HOD
                         │
             ┌───────────┴───────────┐
             ↓                       ↓
          FACULTY             CLASS COORDINATOR
             │                       │
             └───────────┬───────────┘
                         ↓
                      STUDENT
```

| Role | Visual Theme & Color Palette | Focus & Dashboard Features |
| :--- | :--- | :--- |
| **👑 Director** | **Imperial Obsidian & Gold** (`#f59e0b`, `slate-950`) | Full institutional governance: 1,250 college students metric (335 in active DB), 85 faculty, 5 depts, 11 sections, 86% college attendance, department comparison charts, faculty workload, add student/faculty modals, college notices. |
| **👨💼 HOD** | **Academic Indigo & Royal Navy** (`#6366f1`, `indigo-950`) | College-wide academic administration: all 5 departments & 11 sections hierarchy tree, faculty subject allocation & teaching hours, timetable viewer across sections, **Attendance Shortage List (< 75%)** with SMS alert triggers. |
| **👨🏫 Faculty** | **Educator Emerald & Forest Slate** (`#10b981`, `emerald-950`) | Focused teaching workspace: "Good Morning, Prof. Sharma", Today's Classes timeline (09:00, 11:00, 02:00), pending action counters, **Interactive Attendance Register** (1-click "Mark All Present", toggle Absent, submit), Study Notes PDF uploader, Assignments creator & submissions tracker, **Student Doubts Queue** with photo diagram previews & reply composer. |
| **📋 Class Coordinator** | **Class Teal & Amber** (`#14b8a6`, `teal-950`) | Section Spotlight (`CSE-B | 2nd Year`): **Student Leave Requests Approval/Rejection panel** (Medical/Personal dates with review notes), 50-student section roster monitoring, low attendance alerts, section timetable. |
| **🎓 Student** | **Cosmic Violet & Neon Cyan** (`#8b5cf6`, `purple-950`, cyan) | Personal Learning Portal: "Welcome Rahul 👋", attendance % (87%) with **< 75% Warning Alert**, SGPA (8.2), CGPA (8.0), **My Subjects Portal** (Data Structures, DBMS, OS, Math, CN) featuring **Notes PDF reader/downloader**, **Assignments submission**, **Interactive DPP (Daily Practice Problems)** with MCQs, instant scoring and daily streak, **Student Doubt System** with photo attachment & automatic teacher routing, Leave applications, and Timetable. |

---

## 🔐 3. Unified Login & Automatic Role Detection

Users do **not** manually choose their role. The system detects their role automatically from their Email, Student ID, or Employee ID:

```
Login → rahul@student.edu (or CSE23B023) → Role: Student → Section CSE-B → Student Dashboard
Login → director@college.edu (or DIR001) → Role: Director → Director Executive Command Center
```

### Pre-Configured Test Credentials:
- **Director**: `DIR001` or `director@college.edu` (Password: `password123`)
- **HOD**: `HOD001` or `hod@college.edu` (Password: `password123`)
- **Faculty (Prof. Sharma)**: `FAC001` or `sharma@faculty.edu` (Password: `password123`)
- **Coordinator (CSE-B)**: `COORD001` or `coordinator.cseb@college.edu` (Password: `password123`)
- **Student (Rahul Sharma)**: `CSE23B023` or `rahul@student.edu` (Password: `password123`)

*(A 1-Click Role Switcher bar is also present at the top of the interface for instantaneous testing across all 5 roles).*

---

## ⚡ 4. Command to Add 300+ Test Students in DB (50 per Section)

### Option A: Using the Node.js Seeder Command
Run this command in your terminal:

```bash
npm run seed
```

This runs `node scripts/seed-supabase.js`, which:
1. Connects to your Supabase project using the credentials in `.env`.
2. Inserts all 5 departments and 11 sections.
3. Inserts the Director (`DIR001`), HOD (`HOD001`), Faculty members, and Class Coordinators.
4. Inserts **335 test students** distributed across the 11 sections (50 students each in `CSE-A`, `CSE-B`, `CSE-C`, plus `CSE-D`, `CSE-E`, `ECE-A`, `ECE-B`, `Biotech-A`, `Mechanical-A`, `IT-A`, `IT-B`).
5. Inserts sample study notes, assignments, DPP practice question sets, student doubt discussion threads, exams, results, and notices.

---

## 🗄️ 5. Supabase Commands & SQL Scripts

All SQL migration scripts are located in the `supabase/` folder:

### Step 1: Run Database Schema in Supabase
Open your **Supabase Dashboard → SQL Editor** and execute:
```sql
-- File: supabase/01_schema.sql
```
*(Creates all tables: `users`, `departments`, `sections`, `students`, `faculty`, `subjects`, `timetable`, `attendance`, `notes`, `assignments`, `assignment_submissions`, `doubts`, `doubt_replies`, `dpp_sets`, `dpp_questions`, `exams`, `notices`, `leave_requests`, `notifications`, indexes, and RLS policies).*

### Step 2: Seed 300+ Students in Supabase SQL Editor
In the **Supabase Dashboard → SQL Editor**, execute:
```sql
-- File: supabase/02_seed_300_students.sql
```
*(Contains batch `INSERT` statements for 335+ students, 11 sections, 5 roles, and sample data).*

---

### Supabase CLI Commands:

If you are using the Supabase CLI locally:

```bash
# 1. Initialize Supabase in your project directory
npx supabase init

# 2. Start local Supabase Docker containers
npx supabase start

# 3. Apply schema migration to Supabase
npx supabase db push

# 4. Run the 300+ students seed file
npx supabase db execute --file supabase/02_seed_300_students.sql

# 5. Check database status and URLs
npx supabase status
```

---

### Supabase REST API Curl Commands:

You can also interact directly with Supabase via REST:

#### 1. Query Students in CSE-B Section:
```bash
curl -X GET "https://<your-project-id>.supabase.co/rest/v1/students?section_name=eq.CSE-B&select=student_id,roll_no,attendance,sgpa" \
  -H "apikey: <YOUR_ANON_KEY>" \
  -H "Authorization: Bearer <YOUR_ANON_KEY>"
```

#### 2. Query Student Doubts for Faculty:
```bash
curl -X GET "https://<your-project-id>.supabase.co/rest/v1/doubts?faculty_id=eq.usr-fac-01&select=*" \
  -H "apikey: <YOUR_ANON_KEY>" \
  -H "Authorization: Bearer <YOUR_ANON_KEY>"
```

#### 3. Post a Teacher Reply to a Doubt:
```bash
curl -X POST "https://<your-project-id>.supabase.co/rest/v1/doubt_replies" \
  -H "apikey: <YOUR_ANON_KEY>" \
  -H "Authorization: Bearer <YOUR_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "rep-manual-01",
    "doubt_id": "dbt-01",
    "author_id": "usr-fac-01",
    "author_name": "Prof. R.K. Sharma",
    "author_role": "faculty",
    "message": "Refer to step 2 of AVL rotation diagram on slide 34."
  }'
```

---

## 🚀 6. How to Run the App Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
Make sure `.env` contains your Supabase credentials:
```env
PORT=3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```
*(Note: If Supabase credentials are not provided, the app will automatically use the built-in local store with all 335+ students, meaning it works 100% out of the box with zero external dependencies!)*

### 3. Start the Server
```bash
npm start
```

### 4. Open in Browser
Visit **`http://localhost:3000`**

---

## 🧪 7. Features Verification Checklist

- [x] **College Structure**: 5 Departments, 11 Sections (`CSE-A..E`, `ECE-A..B`, `Biotech-A`, `Mechanical-A`, `IT-A..B`).
- [x] **5 Roles**: Director, HOD, Faculty, Class Coordinator, Student.
- [x] **Distinct UI for Each Role**: Unique color schemes, navigation menus, and specialized workflows.
- [x] **Automatic Role Detection Login**: Works with Email or Student/Employee ID (`DIR001`, `HOD001`, `FAC001`, `COORD001`, `CSE23B023`).
- [x] **Director Dashboard**: 1,250 student metric, college-wide stats, departments, faculty workload, reports, and notices.
- [x] **HOD Dashboard**: College-wide academic view, 11 sections tree, faculty allocation, attendance shortage list (< 75%).
- [x] **Faculty App**: Today's classes timeline, interactive attendance register (Present/Absent toggle & submit), notes upload, assignments manager, doubts replies with diagram preview.
- [x] **Class Coordinator App**: Section CSE-B monitoring, leave requests review with `[Approve]` and `[Reject]`, low attendance alerts.
- [x] **Student Learning Portal**:
  - [x] SGPA 8.2, attendance 87%, attendance warning (< 75% for Mathematics).
  - [x] My Subjects: Notes (PDF preview & download), Assignments (due dates & submission), DPP (interactive quiz with score & streak), Ask Doubt (photo attachment with auto-routing to assigned teacher).
  - [x] Doubts history with status tags (🟢 Answered / 🟡 Waiting for Teacher).
  - [x] Day-wise Timetable, Mid-Sem Exams schedule, Semester Results scorecard.
  - [x] Apply Leave with date range, reason, and coordinator review tracker.
- [x] **Global Search**: Search student by roll number or name with complete profile modal.
- [x] **Database & Seeding**: 300+ students command (`npm run seed`), `supabase/01_schema.sql`, and `supabase/02_seed_300_students.sql`.


## Gemini AI features

The existing UI and ERP features are preserved. A shared Gemini AI assistant is available from every role/panel and provides:

- Role-aware academic/campus Q&A for students and staff.
- AI-powered academic-support analysis using attendance, SGPA/CGPA assessment indicators, and available engagement signals.
- Actionable intervention recommendations for authorized academic roles.
- A persistent AI entry point in the top bar and a floating assistant button.

### Configure Gemini locally

1. Copy `.env.example` to `.env`.
2. Set `GEMINI_API_KEY` to your Gemini API key.
3. Optionally change `GEMINI_MODEL` (default: `gemini-3.6-flash`).
4. Run `npm install` and `npm start`.

**Security:** the Gemini key is read only by the Express server. It is never placed in `public/js` or sent to the browser as an API credential. Do not commit or upload `.env`.

### Vercel

Add `GEMINI_API_KEY` and `GEMINI_MODEL` under the project's Environment Variables, then redeploy.

## Local AI testing

Run the Express backend from this project folder:

```powershell
npm install
npm start
```

Open `http://localhost:3000`.

If you use Live Server or another frontend server, the frontend API client automatically sends `/api/*` requests to `http://localhost:3000/api` while on localhost. Keep the Express backend running and set `GEMINI_API_KEY` in `.env`.
