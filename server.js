require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const store = require('./data/store-supabase');
const config = require('./config/supabase');
const { checkConnection } = config;
const { generateGemini, buildSystemInstruction, safeJson } = require('./ai-service');

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------------------------------------------
// FILE UPLOADS -> Supabase Storage (Vercel's filesystem is read-only/ephemeral)
// Files are kept in memory by multer and pushed to the public "uploads" bucket.
// Create the bucket by running supabase/03_supabase_source_of_truth.sql.
// -------------------------------------------------------------
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

async function uploadToSupabase(file, folder) {
  if (!config.supabase) throw new Error(config.initError() || 'Supabase is not configured.');
  const ext = path.extname(file.originalname || '').toLowerCase().replace(/[^.a-z0-9]/g, '');
  const key = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const { error } = await config.supabase.storage.from(STORAGE_BUCKET).upload(key, file.buffer, {
    contentType: file.mimetype || 'application/octet-stream',
    upsert: false
  });
  if (error) throw new Error(`File upload failed: ${error.message}`);
  const { data } = config.supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 0. SUPABASE HEALTH CHECK  ->  GET /api/health/supabase
app.get('/api/health/supabase', async (req, res) => {
  const configured = config.isConfigured();
  if (!configured) {
    return res.status(503).json({ success: false, supabaseConfigured: false, database: 'not configured', error: config.initError() });
  }
  const ok = await checkConnection();
  let storageStatus = 'unknown';
  if (ok) {
    const bucket = await config.supabase.storage.getBucket(STORAGE_BUCKET);
    storageStatus = bucket.error ? `missing (${bucket.error.message}) - run supabase/03_supabase_source_of_truth.sql` : 'ready';
  }
  res.status(ok ? 200 : 503).json({
    success: ok,
    supabaseConfigured: true,
    database: ok ? 'connected' : 'error',
    storageBucket: storageStatus
  });
});

// 1. AUTHENTICATION & AUTOMATIC ROLE DETECTION
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Please enter Email, Employee ID, or Student ID.' });
    }

    const user = await store.findUserByIdentifier(identifier);
    if (!user) {
      if (config.usingAnonKey()) {
        return res.status(500).json({ error: 'Server is using the Supabase anon key, which cannot read the users table (RLS). Set SUPABASE_SERVICE_ROLE_KEY in Vercel/.env and redeploy.' });
      }
      return res.status(404).json({ error: `Account "${identifier}" not found. Try DIR001, HOD001, FAC001, COORD001, or CSE23B023.` });
    }

    // Role detected automatically
    res.json({
      success: true,
      message: `Welcome ${user.name}! Role detected: ${user.role.toUpperCase()}`,
      user: {
        id: user.id,
        identifier: user.identifier,
        email: user.email,
        name: user.name,
        role: user.role, // 'director', 'hod', 'faculty', 'coordinator', 'student'
        department: user.department,
        sectionId: user.sectionId,
        sectionName: user.sectionName,
        phone: user.phone,
        avatar: user.avatar,
        designation: user.designation,
        sgpa: user.sgpa,
        cgpa: user.cgpa,
        attendance: user.attendance,
        year: user.year,
        semester: user.semester,
        rollNo: user.rollNo
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    let msg = err.message || 'Login failed';
    if (/fetch failed|ENOTFOUND|abort/i.test(msg)) msg = 'Cannot reach Supabase. Check SUPABASE_URL (must be https://<project-ref>.supabase.co) and that the project is not paused.';
    else if (/invalid api key|JWT/i.test(msg)) msg = 'Supabase rejected the API key. Re-copy the service_role key into SUPABASE_SERVICE_ROLE_KEY.';
    else if (/relation .* does not exist|schema cache/i.test(msg)) msg = 'Supabase tables are missing. Run supabase/01_schema.sql, 02_seed_300_students.sql and 03_supabase_source_of_truth.sql in the SQL Editor.';
    res.status(500).json({ error: msg });
  }
});

// Demo accounts quick-list
app.get('/api/auth/demo-accounts', (req, res) => {
  res.json({
    director: { identifier: 'DIR001', email: 'director@college.edu', role: 'director', name: 'Dr. Rajeshwar Rao' },
    hod: { identifier: 'HOD001', email: 'hod@college.edu', role: 'hod', name: 'Dr. Arvind Swaminathan' },
    faculty: { identifier: 'FAC001', email: 'sharma@faculty.edu', role: 'faculty', name: 'Prof. R.K. Sharma' },
    coordinator: { identifier: 'COORD001', email: 'coordinator.cseb@college.edu', role: 'coordinator', name: 'Prof. Kavita Nair (CSE-B)' },
    student: { identifier: 'CSE23B023', email: 'rahul@student.edu', role: 'student', name: 'Rahul Sharma (CSE-B)' }
  });
});

// 2. COLLEGE STRUCTURE & STATS
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await store.getCollegeStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const depts = await store.getDepartments();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sections', async (req, res) => {
  try {
    const sections = await store.getSections();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. STUDENTS
app.get('/api/students', async (req, res) => {
  try {
    const { dept, section, search, limit, offset } = req.query;
    const result = await store.getStudents({ dept, section, search, limit, offset });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await store.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const newStudent = await store.addStudent(req.body);
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. FACULTY
app.get('/api/faculty', async (req, res) => {
  try {
    const faculty = await store.getFaculty();
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/faculty', async (req, res) => {
  try {
    const newFac = await store.addFaculty(req.body);
    res.status(201).json(newFac);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. SUBJECTS
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await store.getSubjects(req.query.dept);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. TIMETABLE
app.get('/api/timetable', async (req, res) => {
  try {
    const section = req.query.section || 'CSE-B';
    const timetable = await store.getTimetable(section);
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/timetable/faculty', async (req, res) => {
  try {
    const faculty = req.query.name || 'Prof. R.K. Sharma';
    const timetable = await store.getFacultyTimetable(faculty);
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. NOTES (Faculty uploads, Students view/download)
app.get('/api/notes', async (req, res) => {
  try {
    const { subjectId, section } = req.query;
    const notes = await store.getNotes(subjectId, section);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notes', upload.single('file'), async (req, res) => {
  try {
    const noteData = req.body;
    if (req.file) {
      noteData.fileName = req.file.originalname;
      noteData.fileSize = (req.file.size / (1024 * 1024)).toFixed(1) + ' MB';
      noteData.fileUrl = await uploadToSupabase(req.file, 'notes');
    }
    const newNote = await store.addNote(noteData);
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. ASSIGNMENTS & SUBMISSIONS
app.get('/api/assignments', async (req, res) => {
  try {
    const section = req.query.section || 'CSE-B';
    const list = await store.getAssignments(section);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assignments', upload.single('file'), async (req, res) => {
  try {
    const asgData = req.body;
    if (req.file) {
      asgData.fileUrl = await uploadToSupabase(req.file, 'assignments');
    }
    const newAsg = await store.addAssignment(asgData);
    res.status(201).json(newAsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/assignments/:id/submissions', async (req, res) => {
  try {
    const subs = await store.getSubmissions(req.params.id);
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assignments/:id/submit', upload.single('file'), async (req, res) => {
  try {
    const submissionUrl = req.file ? await uploadToSupabase(req.file, 'submissions') : null;
    const subData = {
      fileUrl: submissionUrl,
      assignmentId: req.params.id,
      studentId: req.body.studentId,
      studentName: req.body.studentName,
      studentRoll: req.body.studentRoll,
      fileName: req.file ? req.file.originalname : (req.body.fileName || 'Assignment_Submission.pdf')
    };
    const subm = await store.submitAssignment(subData);
    res.status(201).json(subm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. STUDENT DOUBT SYSTEM
app.get('/api/doubts', async (req, res) => {
  try {
    const { facultyId, studentId, subjectId, status } = req.query;
    const doubts = await store.getDoubts({ facultyId, studentId, subjectId, status });
    res.json(doubts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doubts', upload.single('photo'), async (req, res) => {
  try {
    const doubtData = req.body;
    if (req.file) {
      doubtData.attachmentUrl = await uploadToSupabase(req.file, 'doubts');
      doubtData.attachmentName = req.file.originalname;
    }
    const newDoubt = await store.createDoubt(doubtData);
    res.status(201).json(newDoubt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doubts/:id/reply', async (req, res) => {
  try {
    const result = await store.replyDoubt(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. DPP (DAILY PRACTICE PROBLEMS)
app.get('/api/dpp', async (req, res) => {
  try {
    const dppSets = await store.getDppSets(req.query.subjectId);
    res.json(dppSets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. ATTENDANCE
app.get('/api/attendance/student/:id', async (req, res) => {
  try {
    const att = await store.getStudentAttendance(req.params.id);
    res.json(att);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance/mark', async (req, res) => {
  try {
    const result = await store.markAttendanceBatch(req.body.records || []);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. EXAMS & RESULTS
app.get('/api/exams', async (req, res) => {
  try {
    const exams = await store.getExams();
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/results/:studentId', async (req, res) => {
  try {
    const results = await store.getStudentResults(req.params.studentId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. NOTICES
app.get('/api/notices', async (req, res) => {
  try {
    const notices = await store.getNotices(req.query);
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notices/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please select an image.' });
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed.' });
    }
    const imageUrl = await uploadToSupabase(req.file, 'notices');
    res.status(201).json({ success: true, imageUrl, fileName: req.file.originalname });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notices', async (req, res) => {
  try {
    const notice = await store.createNotice(req.body);
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. LEAVE MANAGEMENT
app.get('/api/leaves', async (req, res) => {
  try {
    const { section, studentId, status } = req.query;
    const leaves = await store.getLeaveRequests({ section, studentId, status });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leaves/apply', async (req, res) => {
  try {
    const leave = await store.applyLeave(req.body);
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leaves/:id/review', async (req, res) => {
  try {
    const { status, note, reviewer } = req.body;
    const reviewed = await store.reviewLeave(req.params.id, status, note, reviewer);
    res.json(reviewed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 15. NOTIFICATIONS
app.get('/api/notifications', async (req, res) => {
  try {
    const list = await store.getNotifications(req.query.userId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 16. GLOBAL SEARCH
app.get('/api/search', async (req, res) => {
  try {
    const results = await store.globalSearch(req.query.q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 17. GEMINI AI ASSISTANT & ACADEMIC SUPPORT ANALYTICS
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, user, panel, context } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Please enter a question.' });
    }

    const mergedContext = {
      ...(context || {}),
      currentUser: user || {},
      currentPanel: panel || 'dashboard'
    };
    const answer = await generateGemini({
      message: String(message).trim(),
      history,
      context: mergedContext,
      systemInstruction: buildSystemInstruction(user || {}, panel || 'dashboard')
    });
    res.json({ success: true, answer, model: process.env.GEMINI_MODEL || 'gemini-3.6-flash' });
  } catch (err) {
    const status = err.code === 'AI_NOT_CONFIGURED' ? 503 : (err.status >= 400 && err.status < 600 ? err.status : 500);
    res.status(status).json({ error: err.message });
  }
});

app.post('/api/ai/insights', async (req, res) => {
  try {
    const { user, panel } = req.body || {};
    const role = user?.role || 'unknown';

    let students = [];
    if (role === 'student') {
      const student = await store.getStudentById(user.id || user.identifier);
      if (student) students = [student];
    } else {
      const filters = {};
      if (role === 'hod' || role === 'faculty') filters.dept = user?.department;
      if (role === 'coordinator') filters.section = user?.sectionName;
      const result = await store.getStudents({ ...filters, limit: 200, offset: 0 });
      students = result.items || [];
    }

    const doubts = await store.getDoubts({});
    const doubtCounts = {};
    for (const d of doubts || []) {
      const id = d.studentId || d.student_id;
      if (id) doubtCounts[id] = (doubtCounts[id] || 0) + 1;
    }

    const dataset = students.map(s => ({
      id: s.studentId || s.identifier || s.id,
      name: s.name,
      department: s.department,
      section: s.sectionName,
      attendance: Number(s.attendance ?? 0),
      sgpa: Number(s.sgpa ?? 0),
      cgpa: Number(s.cgpa ?? 0),
      engagementProxy: Number(doubtCounts[s.id] || doubtCounts[s.studentId] || 0)
    }));

    const flagged = dataset.map(s => {
      let score = 0;
      if (s.attendance < 75) score += 40;
      else if (s.attendance < 80) score += 25;
      if (s.sgpa < 6) score += 35;
      else if (s.sgpa < 7) score += 20;
      if (s.engagementProxy === 0) score += 10;
      return { ...s, riskScore: Math.min(100, score) };
    }).filter(s => s.riskScore >= 35).sort((a,b) => b.riskScore - a.riskScore).slice(0, 20);

    const prompt = `Analyze this academic-support dataset for a college ERP. Identify students who may need additional academic support and give actionable recommendations. Consider attendance, SGPA/CGPA as assessment-performance indicators, and engagementProxy as a limited engagement signal based on doubt activity. Do not claim the proxy is a complete measure of engagement. Return: 1) key findings, 2) priority students, 3) specific interventions for faculty/coordinator/HOD/director, 4) a short positive message for students. Keep it practical. Dataset: ${safeJson({ role, panel, students: dataset, flagged })}`;

    const answer = await generateGemini({
      message: prompt,
      history: [],
      context: { role, panel, datasetSize: dataset.length, flagged },
      systemInstruction: `You are the academic early-support AI for GenTech College. You help authorized staff identify students who may need additional academic support. Recommendations are advisory; never label a student as definitively failing or incapable. Explain evidence and prioritize supportive interventions.`
    });

    res.json({ success: true, answer, flagged, analyzedStudents: dataset.length });
  } catch (err) {
    const status = err.code === 'AI_NOT_CONFIGURED' ? 503 : (err.status >= 400 && err.status < 600 ? err.status : 500);
    res.status(status).json({ error: err.message });
  }
});

// Fallback HTML routing for SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server Start (local development only). Vercel imports the Express app directly.
if (require.main === module) {
app.listen(PORT, async () => {
  console.log(`================================================================`);
  console.log(`🚀 College Management Web Server running at: http://localhost:${PORT}`);
  console.log(`================================================================`);
  const connected = await checkConnection();
  if (connected) {
    console.log(`✓ Supabase connection established successfully!`);
  } else {
    console.log(`❌ Supabase is NOT reachable. Check SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env`);
  }
});
}

module.exports = app;
