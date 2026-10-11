// Builds the role-scoped "dashboard snapshot" that the AI assistant can see.
//
// The AI sees exactly what the logged-in user's dashboard would show:
//   student      -> only their own data
//   faculty      -> their subjects/timetable and the students of the sections they teach
//   coordinator  -> their whole section
//   hod          -> their whole department
//   director     -> the whole college
//
// The user is re-resolved from the database on the server (the client-sent role is never
// trusted on its own), and the scope is applied here, before anything reaches the model.
const store = require('./data/store-supabase');
const config = require('./config/supabase');

const db = () => {
  if (!config.supabase) throw new Error(config.initError() || 'Supabase is not configured.');
  return config.supabase;
};

// ---------- small helpers ----------
const secKey = (dept, section) => `${String(dept || '').toUpperCase()}-${String(section || '').split('-').pop().toUpperCase()}`;
const pct = (a, t) => (t ? Math.round((a * 1000) / t) / 10 : null);
const num = v => (v == null || v === '' ? null : Number(v));
const short = (s, n = 140) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const today = () => new Date().toISOString().slice(0, 10);

async function pageAll(buildQuery, cap = 60000) {
  const out = [];
  const size = 1000;
  for (let from = 0; from < cap; from += size) {
    const { data, error } = await buildQuery().range(from, from + size - 1);
    if (error) throw error;
    out.push(...(data || []));
    if (!data || data.length < size) break;
  }
  return out;
}

// ---------- tiny TTL cache (keeps repeated questions fast and cheap) ----------
const cache = new Map();
async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.val;
  const val = await fn();
  cache.set(key, { val, exp: Date.now() + ttlMs });
  if (cache.size > 200) cache.delete(cache.keys().next().value);
  return val;
}

// ---------- raw data loaders ----------
async function loadAttendance(studentIds) {
  // attendance rows -> { studentId: { subjectId: { total, attended } } }
  const rows = await pageAll(() => {
    let q = db().from('attendance').select('student_id,subject_id,status,date').order('date');
    if (studentIds && studentIds.length <= 200) q = q.in('student_id', studentIds);
    return q;
  });
  const idSet = studentIds ? new Set(studentIds) : null;
  const map = {};
  for (const r of rows) {
    if (idSet && !idSet.has(r.student_id)) continue;
    const s = (map[r.student_id] ??= {});
    const x = (s[r.subject_id] ??= { total: 0, attended: 0, absentDates: [] });
    x.total++;
    if (r.status === 'Present' || r.status === 'Late') x.attended++;
    else x.absentDates.push(r.date);
  }
  return map;
}

async function loadMarks(studentIds) {
  const rows = await pageAll(() => {
    let q = db().from('marks').select('student_id,subject_name,code,internal,mid_sem,end_sem,total,grade').order('student_id');
    if (studentIds && studentIds.length <= 200) q = q.in('student_id', studentIds);
    return q;
  });
  const idSet = studentIds ? new Set(studentIds) : null;
  const map = {};
  for (const m of rows) {
    if (idSet && !idSet.has(m.student_id)) continue;
    (map[m.student_id] ??= []).push(m);
  }
  return map;
}

const loadAllStudents = () => cached('students:all', 60000, async () => (await store.getStudents({ limit: 2000, offset: 0 })).items || []);
const loadSubjects = () => cached('subjects:all', 120000, () => store.getSubjects());
const loadExams = () => cached('exams', 120000, () => store.getExams());
const loadNotices = () => cached('notices', 60000, () => store.getNotices({}));
const loadFaculty = () => cached('faculty', 120000, () => store.getFaculty());
const loadSections = () => cached('sections', 120000, () => store.getSections());
const loadAllAttendance = () => cached('attendance:all', 60000, () => loadAttendance(null));
const loadAllMarks = () => cached('marks:all', 60000, () => loadMarks(null));
const loadAllTimetable = () => cached('timetable:all', 120000, async () => {
  const { data, error } = await db().from('timetable').select('*').order('section_name').order('day').order('time_slot');
  if (error) throw error;
  return data || [];
});

// ---------- compact formatters (plain text is far cheaper for the model than JSON) ----------
function fmtStudentLine(s, att, marks, subjById) {
  const subj = att ? Object.entries(att).map(([sid, x]) => {
    const name = subjById[sid]?.name || sid;
    return `${name} ${x.attended}/${x.total}(${pct(x.attended, x.total)}%)`;
  }) : [];
  let totalA = 0, totalT = 0;
  if (att) for (const x of Object.values(att)) { totalA += x.attended; totalT += x.total; }
  const overall = totalT ? `${pct(totalA, totalT)}%` : (s.attendance != null ? `${s.attendance}%(profile)` : 'n/a');
  const mk = (marks || []).map(m => `${m.subject_name} ${num(m.total ?? (Number(m.internal || 0) + Number(m.mid_sem || 0) + Number(m.end_sem || 0)))}${m.grade ? '/' + m.grade : ''}`);
  return `${s.studentId || s.identifier} | ${s.name} | ${s.department}-${String(s.sectionName || '').split('-').pop()} | Roll ${s.rollNo ?? '-'} | Sem ${s.semester ?? '-'} | overall attendance ${overall} | SGPA ${s.sgpa ?? '-'} CGPA ${s.cgpa ?? '-'}`
    + (subj.length ? ` | attendance by subject (attended/held): ${subj.join('; ')}` : '')
    + (mk.length ? ` | marks (/100): ${mk.join('; ')}` : '');
}

function fmtTimetable(rows) {
  return rows.map(t => `${t.section_name} ${t.day} ${t.time_slot}: ${t.subject}${t.code ? ` (${t.code})` : ''} @${t.room || '-'} by ${t.faculty_name || '-'}`).join('\n');
}
const fmtNotices = list => list.slice(0, 25).map(n => `[${n.date}] (${n.priority}) ${n.title} -> ${n.target}: ${short(n.content, 220)}`).join('\n');
const fmtExams = list => list.map(e => `${e.date} ${e.time || ''} ${e.type}: ${e.subject} (${e.code || '-'}) room ${e.room || '-'} [${e.status || ''}]`).join('\n');

function section(title, body) {
  if (body == null || body === '' || (Array.isArray(body) && !body.length)) return '';
  return `\n=== ${title} ===\n${Array.isArray(body) ? body.join('\n') : body}\n`;
}

// Per-subject summary across a group of students: classes held, avg attendance
function subjectRollup(studentIds, attMap, subjById) {
  const agg = {};
  for (const id of studentIds) {
    for (const [sid, x] of Object.entries(attMap[id] || {})) {
      const a = (agg[sid] ??= { held: 0, attended: 0, students: 0, maxHeld: 0 });
      a.held += x.total; a.attended += x.attended; a.students++; a.maxHeld = Math.max(a.maxHeld, x.total);
    }
  }
  return Object.entries(agg)
    .map(([sid, a]) => `${subjById[sid]?.name || sid}: ~${a.maxHeld} classes held, avg attendance ${pct(a.attended, a.held)}% across ${a.students} students`)
    .sort();
}

function groupSummary(label, students, attMap) {
  if (!students.length) return `${label}: no students`;
  let a = 0, t = 0;
  for (const s of students) for (const x of Object.values(attMap[s.id] || {})) { a += x.attended; t += x.total; }
  const profAtt = students.reduce((p, s) => p + Number(s.attendance || 0), 0) / students.length;
  const avgAtt = t ? pct(a, t) : Math.round(profAtt * 10) / 10;
  const sg = students.reduce((p, s) => p + Number(s.sgpa || 0), 0) / students.length;
  const low = students.filter(s => {
    let x = 0, y = 0; for (const r of Object.values(attMap[s.id] || {})) { x += r.attended; y += r.total; }
    return (y ? (x * 100) / y : Number(s.attendance || 0)) < 75;
  }).length;
  return `${label}: ${students.length} students, avg attendance ${avgAtt}%, avg SGPA ${sg.toFixed(2)}, students below 75% attendance: ${low}`;
}

// ---------- resolve who is asking (never trust the client's role) ----------
async function resolveUser(clientUser) {
  const key = clientUser?.id || clientUser?.identifier || clientUser?.email;
  if (!key) return null;
  return (await store.getUserById(key)) || (await store.findUserByIdentifier(key));
}

// ---------- role builders ----------
async function buildStudent(u) {
  const [att, marks, subjects, exams, notices, tt, assignments, leaves, doubts, notifs] = await Promise.all([
    loadAttendance([u.id]), loadMarks([u.id]), loadSubjects(), loadExams(), loadNotices(),
    store.getTimetable(secKey(u.department, u.sectionName)),
    store.getAssignments(secKey(u.department, u.sectionName)),
    store.getLeaveRequests({ studentId: u.id }),
    store.getDoubts({ studentId: u.id }),
    store.getNotifications(u.id)
  ]);
  const subjById = Object.fromEntries(subjects.map(s => [s.id, s]));
  const mySubs = (await db().from('assignment_submissions').select('assignment_id,status,grade,submitted_at').eq('student_id', u.id)).data || [];
  const subByAsg = Object.fromEntries(mySubs.map(s => [s.assignment_id, s]));

  // the class counts per subject, sorted so "which subject has the most classes" is easy to answer
  const attRows = Object.entries(att[u.id] || {}).map(([sid, x]) => ({ name: subjById[sid]?.name || sid, faculty: subjById[sid]?.facultyName || '', ...x }))
    .sort((a, b) => b.total - a.total);
  const attLines = attRows.map(r => `${r.name}${r.faculty ? ` (${r.faculty})` : ''}: ${r.total} classes held, attended ${r.attended}, missed ${r.total - r.attended}, ${pct(r.attended, r.total)}%${r.absentDates.length ? `, absent on ${r.absentDates.slice(-8).join(', ')}` : ''}`);
  const totalHeld = attRows.reduce((p, r) => p + r.total, 0), totalAtt = attRows.reduce((p, r) => p + r.attended, 0);

  return [
    section('YOUR PROFILE', `${u.name} | ${u.studentId || u.identifier} | ${u.department}-${u.sectionName} | Year ${u.year} Sem ${u.semester} | Roll ${u.rollNo} | SGPA ${u.sgpa} CGPA ${u.cgpa} | profile attendance ${u.attendance}%`),
    section('YOUR ATTENDANCE BY SUBJECT (sorted by most classes held)', attLines.concat(attRows.length ? [`OVERALL: ${totalAtt}/${totalHeld} = ${pct(totalAtt, totalHeld)}%`] : [])),
    section('YOUR MARKS (out of 100)', (marks[u.id] || []).map(m => `${m.subject_name} (${m.code}): internal ${m.internal}, mid-sem ${m.mid_sem}, end-sem ${m.end_sem}, total ${m.total}, grade ${m.grade}`)),
    section('YOUR TIMETABLE', fmtTimetable(tt.map(t => ({ section_name: secKey(u.department, u.sectionName), day: t.day, time_slot: t.time, subject: t.subject, code: t.code, room: t.room, faculty_name: t.faculty })))),
    section('YOUR SUBJECTS', subjects.filter(s => s.deptCode === u.department && (!u.semester || s.semester === u.semester)).map(s => `${s.code} ${s.name} (${s.credits} credits) - ${s.facultyName || '-'}`)),
    section('YOUR ASSIGNMENTS', assignments.slice(0, 30).map(a => `${a.title} [${a.subjectName}] due ${a.dueDate}, max ${a.maxMarks}; your status: ${subByAsg[a.id] ? `${subByAsg[a.id].status}${subByAsg[a.id].grade ? `, grade ${subByAsg[a.id].grade}` : ''}` : 'NOT SUBMITTED'}`)),
    section('YOUR LEAVE REQUESTS', leaves.slice(0, 20).map(l => `${l.fromDate} to ${l.toDate} ${l.type}: ${short(l.reason, 100)} -> ${l.status}${l.reviewNote ? ` (${short(l.reviewNote, 80)})` : ''}`)),
    section('YOUR DOUBTS', doubts.slice(0, 15).map(d => `[${d.status}] ${d.subjectName}: ${short(d.question, 160)}${d.replies?.length ? ` | reply: ${short(d.replies[d.replies.length - 1].message, 160)}` : ''}`)),
    section('UPCOMING EXAMS', fmtExams(exams)),
    section('RECENT NOTICES', fmtNotices(notices)),
    section('YOUR NOTIFICATIONS', notifs.slice(0, 10).map(n => `${n.title}: ${short(n.message, 120)}`))
  ].join('');
}

async function buildStaffScope(u) {
  // returns { students, label, extra }
  const [all, subjects, sections] = await Promise.all([loadAllStudents(), loadSubjects(), loadSections()]);
  const role = u.role;
  let students = all, label = 'Whole college', extra = '';
  if (role === 'hod') {
    students = all.filter(s => s.department === u.department);
    label = `${u.department} department`;
  } else if (role === 'coordinator') {
    const m = /\(([A-Za-z]+-[A-Za-z0-9]+)\)/.exec(u.designation || '') || /\(([A-Za-z]+-[A-Za-z0-9]+)\)/.exec(u.name || '');
    const key = (m ? m[1] : secKey(u.department, u.sectionName)).toUpperCase();
    students = all.filter(s => secKey(s.department, s.sectionName) === key);
    label = `Section ${key}`;
  } else if (role === 'faculty') {
    const tt = await store.getFacultyTimetable(u.name);
    const keys = new Set(tt.length ? (await loadAllTimetable()).filter(r => String(r.faculty_name || '').toLowerCase().includes(u.name.toLowerCase())).map(r => r.section_name.toUpperCase()) : []);
    students = keys.size ? all.filter(s => keys.has(secKey(s.department, s.sectionName))) : all.filter(s => s.department === u.department);
    label = keys.size ? `Sections you teach: ${[...keys].join(', ')}` : `${u.department} department`;
    const mine = subjects.filter(s => s.facultyId === u.id || String(s.facultyName || '').toLowerCase() === u.name.toLowerCase());
    extra = section('SUBJECTS YOU TEACH', mine.map(s => `${s.code} ${s.name} (${s.deptCode}, sem ${s.semester})`));
  }
  return { students, label, extra, subjects, sections };
}

async function buildStaff(u) {
  const { students, label, extra, subjects, sections } = await buildStaffScope(u);
  const ids = students.map(s => s.id);
  const [attMap, marksMap, exams, notices] = await Promise.all([
    role3(u) ? loadAllAttendance() : loadAttendance(ids),
    role3(u) ? loadAllMarks() : loadMarks(ids),
    loadExams(), loadNotices()
  ]);
  const subjById = Object.fromEntries(subjects.map(s => [s.id, s]));

  // department / section rollups
  const byDept = {}, bySec = {};
  for (const s of students) {
    (byDept[s.department] ??= []).push(s);
    (bySec[secKey(s.department, s.sectionName)] ??= []).push(s);
  }
  const deptLines = Object.entries(byDept).map(([d, list]) => groupSummary(`Dept ${d}`, list, attMap));
  const secLines = Object.entries(bySec).sort().map(([k, list]) => groupSummary(`Section ${k}`, list, attMap));

  const lowAtt = students.map(s => {
    let a = 0, t = 0; for (const x of Object.values(attMap[s.id] || {})) { a += x.attended; t += x.total; }
    return { s, p: t ? (a * 100) / t : Number(s.attendance || 0) };
  }).filter(x => x.p < 75).sort((a, b) => a.p - b.p).map(x => `${x.s.studentId || x.s.identifier} ${x.s.name} (${x.s.department}-${x.s.sectionName}) ${Math.round(x.p * 10) / 10}%`);

  // leaves / doubts / assignments scoped
  let leaves = [], doubts = [], assignments = [];
  const secNames = [...new Set(students.map(s => secKey(s.department, s.sectionName)))];
  try {
    const rows = await store.getLeaveRequests({});
    const idSet = new Set(ids);
    leaves = rows.filter(l => idSet.has(l.studentId));
    const dRows = await store.getDoubts({});
    doubts = dRows.filter(d => idSet.has(d.studentId) && (u.role !== 'faculty' || d.facultyId === u.id || String(d.facultyName).toLowerCase() === u.name.toLowerCase()));
    assignments = (await store.getAssignments()).filter(a => secNames.includes(String(a.section || '').toUpperCase()));
  } catch (_) { /* optional sections */ }

  const parts = [
    section('YOUR PROFILE', `${u.name} | ${u.role.toUpperCase()} | ${u.designation || ''} | dept ${u.department || '-'}`),
    section(`SCOPE: ${label}`, `${students.length} students visible to you`),
    section('SUMMARY BY DEPARTMENT', u.role === 'director' ? deptLines : ''),
    section('SUMMARY BY SECTION', secLines),
    section('SUBJECT-WISE ATTENDANCE ROLLUP', subjectRollup(ids, attMap, subjById)),
    extra,
    section('STUDENTS BELOW 75% ATTENDANCE (lowest first)', lowAtt),
    section('ALL STUDENTS IN YOUR SCOPE (attendance by subject as attended/held, marks)', students.map(s => fmtStudentLine(s, attMap[s.id], marksMap[s.id], subjById))),
    section('SUBJECTS', subjects.filter(s => u.role === 'director' || s.deptCode === u.department).map(s => `${s.code} ${s.name} (${s.deptCode}, sem ${s.semester}) - ${s.facultyName || '-'}`)),
    section('PENDING / RECENT LEAVE REQUESTS', leaves.slice(0, 40).map(l => `${l.studentName} (${l.studentId}) ${l.fromDate}..${l.toDate} ${l.type}: ${short(l.reason, 90)} -> ${l.status}`)),
    section('STUDENT DOUBTS', doubts.slice(0, 40).map(d => `[${d.status}] ${d.studentName} / ${d.subjectName}: ${short(d.question, 140)}`)),
    section('ASSIGNMENTS', assignments.slice(0, 40).map(a => `${a.title} [${a.subjectName}, ${a.section}] due ${a.dueDate} by ${a.authorName}`)),
    section('EXAMS', fmtExams(exams)),
    section('NOTICES', fmtNotices(notices))
  ];

  if (u.role === 'hod' || u.role === 'director') {
    const fac = (await loadFaculty()).filter(f => u.role === 'director' || f.department === u.department);
    parts.push(section('FACULTY', fac.map(f => `${f.facultyId || f.identifier} ${f.name} | ${f.department} | ${f.designation}`)));
    try { parts.push(section('COLLEGE STATS', JSON.stringify(await store.getCollegeStats()))); } catch (_) {}
  }
  if (u.role === 'faculty' || u.role === 'coordinator' || u.role === 'hod' || u.role === 'director') {
    const all = await loadAllTimetable();
    let rows = all;
    if (u.role === 'faculty') rows = all.filter(r => String(r.faculty_name || '').toLowerCase().includes(u.name.toLowerCase()));
    else if (u.role !== 'director') rows = all.filter(r => secNames.includes(String(r.section_name).toUpperCase()));
    parts.push(section(u.role === 'faculty' ? 'YOUR TEACHING TIMETABLE' : 'TIMETABLE', fmtTimetable(rows)));
  }
  return parts.join('');
}
const role3 = u => u.role === 'director' || u.role === 'hod'; // wide scopes: load everything once, filter in memory

// Public entry: returns { user, text } where text is the dashboard snapshot for the model.
async function buildDashboardContext(clientUser) {
  const u = await resolveUser(clientUser);
  if (!u) {
    const e = new Error('Could not verify your account. Please sign in again.');
    e.status = 401;
    throw e;
  }
  const cacheKey = `ctx:${u.id}`;
  const text = await cached(cacheKey, 45000, async () => (u.role === 'student' ? buildStudent(u) : buildStaff(u)));
  return { user: u, text: `Snapshot time: ${today()}\n${text}` };
}

module.exports = { buildDashboardContext };
