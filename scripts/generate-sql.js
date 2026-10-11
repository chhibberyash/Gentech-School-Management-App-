const fs = require('fs');
const path = require('path');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str;
  if (typeof str === 'boolean') return str ? 'TRUE' : 'FALSE';
  if (typeof str === 'object') return `'${JSON.stringify(str).replace(/'/g, "''")}'`;
  return `'${String(str).replace(/'/g, "''")}'`;
}

function generate() {
  const seedPath = path.join(__dirname, '..', 'data', 'seed_data.json');
  const data = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  let sql = `-- ==============================================================================
-- 🎓 COMPLETE COLLEGE MANAGEMENT APP - SUPABASE SEED DATA (300+ STUDENTS)
-- ==============================================================================
-- Includes:
-- - 1 Director (Dr. Rajeshwar Rao - DIR001)
-- - 1 HOD (Dr. Arvind Swaminathan - HOD001)
-- - 5 Faculty Members (Prof. Sharma, Dr. Verma, Prof. Sen, Dr. Gupta, Prof. Joshi)
-- - 1 Class Coordinator (Prof. Kavita Nair - CSE-B)
-- - 335+ Students across 11 Sections in 5 Departments (50 in CSE-A, CSE-B, CSE-C, etc.)
-- - Featured Student: Rahul Sharma (CSE23B023, CSE-B)
-- - Complete Subjects, Notes, Assignments, Doubts, DPPs, Timetable, Exams, Notices
-- ==============================================================================

BEGIN;

-- 1. DEPARTMENTS
INSERT INTO departments (id, code, name, icon, color) VALUES
`;

  const deptValues = data.departments.map(d =>
    `  (${escapeSql(d.id)}, ${escapeSql(d.code)}, ${escapeSql(d.name)}, ${escapeSql(d.icon)}, ${escapeSql(d.color)})`
  ).join(',\n');
  sql += deptValues + ';\n\n';

  // 2. SECTIONS
  sql += `-- 2. SECTIONS (11 SECTIONS ACROSS 5 DEPARTMENTS)\nINSERT INTO sections (id, dept_id, dept_code, name, full_name, year, semester, capacity) VALUES\n`;
  const secValues = data.sections.map(s =>
    `  (${escapeSql(s.id)}, ${escapeSql(s.deptId)}, ${escapeSql(s.deptCode)}, ${escapeSql(s.name)}, ${escapeSql(s.fullName)}, ${s.year}, ${s.semester}, ${s.capacity})`
  ).join(',\n');
  sql += secValues + ';\n\n';

  // 3. USERS
  sql += `-- 3. USERS (STAFF + 300+ STUDENTS)\nINSERT INTO users (id, identifier, email, password_hash, name, role, department, phone, avatar, designation) VALUES\n`;
  const userValues = data.users.map(u =>
    `  (${escapeSql(u.id)}, ${escapeSql(u.identifier)}, ${escapeSql(u.email)}, 'password123', ${escapeSql(u.name)}, ${escapeSql(u.role)}, ${escapeSql(u.department)}, ${escapeSql(u.phone)}, ${escapeSql(u.avatar)}, ${escapeSql(u.designation || '')})`
  ).join(',\n');
  sql += userValues + ';\n\n';

  // 4. STUDENTS PROFILE
  sql += `-- 4. STUDENTS EXTENDED PROFILE (335 STUDENTS)\nINSERT INTO students (id, student_id, roll_no, dept_id, dept_code, section_id, section_name, year, semester, attendance, sgpa, cgpa) VALUES\n`;
  const stuValues = data.students.map(s =>
    `  (${escapeSql(s.id)}, ${escapeSql(s.studentId)}, ${s.rollNo}, ${escapeSql(s.deptId)}, ${escapeSql(s.department)}, ${escapeSql(s.sectionId)}, ${escapeSql(s.sectionName)}, ${s.year}, ${s.semester}, ${s.attendance}, ${s.sgpa}, ${s.cgpa})`
  ).join(',\n');
  sql += stuValues + ';\n\n';

  // 5. FACULTY PROFILE
  sql += `-- 5. FACULTY EXTENDED PROFILE\nINSERT INTO faculty (id, faculty_id, dept_code, specialization, designation) VALUES\n`;
  const facultyUsers = data.users.filter(u => u.role === 'faculty');
  const facValues = facultyUsers.map(f =>
    `  (${escapeSql(f.id)}, ${escapeSql(f.identifier)}, ${escapeSql(f.department)}, ${escapeSql(f.specialization || 'Engineering')}, ${escapeSql(f.designation || 'Faculty')})`
  ).join(',\n');
  sql += facValues + ';\n\n';

  // 6. SUBJECTS
  sql += `-- 6. SUBJECTS\nINSERT INTO subjects (id, code, name, dept_code, semester, credits, faculty_id, faculty_name) VALUES\n`;
  const subValues = data.subjects.map(s =>
    `  (${escapeSql(s.id)}, ${escapeSql(s.code)}, ${escapeSql(s.name)}, ${escapeSql(s.deptCode)}, ${s.semester}, ${s.credits}, ${escapeSql(s.facultyId)}, ${escapeSql(s.facultyName)})`
  ).join(',\n');
  sql += subValues + ';\n\n';

  // 7. TIMETABLE
  sql += `-- 7. TIMETABLE (CSE-B SCHEDULE)\nINSERT INTO timetable (section_name, day, time_slot, subject, code, room, faculty_name) VALUES\n`;
  const ttEntries = data.timetable['CSE-B'] || [];
  const ttValues = ttEntries.map(t =>
    `  ('CSE-B', ${escapeSql(t.day)}, ${escapeSql(t.time)}, ${escapeSql(t.subject)}, ${escapeSql(t.code)}, ${escapeSql(t.room)}, ${escapeSql(t.faculty)})`
  ).join(',\n');
  sql += ttValues + ';\n\n';

  // 8. NOTES
  sql += `-- 8. NOTES\nINSERT INTO notes (id, subject_id, subject_name, dept_code, section, title, description, file_name, file_size, file_url, author_id, author_name, upload_date) VALUES\n`;
  const noteValues = data.notes.map(n =>
    `  (${escapeSql(n.id)}, ${escapeSql(n.subjectId)}, ${escapeSql(n.subjectName)}, ${escapeSql(n.deptCode)}, ${escapeSql(n.section)}, ${escapeSql(n.title)}, ${escapeSql(n.description)}, ${escapeSql(n.fileName)}, ${escapeSql(n.fileSize)}, ${escapeSql(n.fileUrl)}, ${escapeSql(n.authorId)}, ${escapeSql(n.author)}, ${escapeSql(n.uploadDate)})`
  ).join(',\n');
  sql += noteValues + ';\n\n';

  // 9. ASSIGNMENTS
  sql += `-- 9. ASSIGNMENTS\nINSERT INTO assignments (id, subject_id, subject_name, dept_code, section, title, description, due_date, max_marks, author_id, author_name, file_url, status) VALUES\n`;
  const asgValues = data.assignments.map(a =>
    `  (${escapeSql(a.id)}, ${escapeSql(a.subjectId)}, ${escapeSql(a.subjectName)}, ${escapeSql(a.deptCode)}, ${escapeSql(a.section)}, ${escapeSql(a.title)}, ${escapeSql(a.description)}, ${escapeSql(a.dueDate)}, ${a.maxMarks}, ${escapeSql(a.authorId)}, ${escapeSql(a.authorName)}, ${escapeSql(a.fileUrl)}, ${escapeSql(a.status)})`
  ).join(',\n');
  sql += asgValues + ';\n\n';

  // 10. ASSIGNMENT SUBMISSIONS
  sql += `-- 10. ASSIGNMENT SUBMISSIONS\nINSERT INTO assignment_submissions (id, assignment_id, student_id, student_name, student_roll, submitted_at, file_name, grade, feedback, status) VALUES\n`;
  const submVals = data.submissions.map(s =>
    `  (${escapeSql(s.id)}, ${escapeSql(s.assignmentId)}, ${escapeSql(s.studentId)}, ${escapeSql(s.studentName)}, ${escapeSql(s.studentRoll)}, NOW(), ${escapeSql(s.fileName)}, ${escapeSql(s.grade)}, ${escapeSql(s.feedback)}, ${escapeSql(s.status)})`
  ).join(',\n');
  sql += submVals + ';\n\n';

  // 11. DOUBTS
  sql += `-- 11. DOUBTS (STUDENT DOUBT SYSTEM)\nINSERT INTO doubts (id, student_id, student_name, student_roll, student_avatar, department, section, subject_id, subject_name, faculty_id, faculty_name, question, attachment_url, attachment_name, status) VALUES\n`;
  const doubtVals = data.doubts.map(d =>
    `  (${escapeSql(d.id)}, ${escapeSql(d.studentId)}, ${escapeSql(d.studentName)}, ${escapeSql(d.studentRoll)}, ${escapeSql(d.studentAvatar)}, ${escapeSql(d.department)}, ${escapeSql(d.section)}, ${escapeSql(d.subjectId)}, ${escapeSql(d.subjectName)}, ${escapeSql(d.facultyId)}, ${escapeSql(d.facultyName)}, ${escapeSql(d.question)}, ${escapeSql(d.attachmentUrl)}, ${escapeSql(d.attachmentName)}, ${escapeSql(d.status)})`
  ).join(',\n');
  sql += doubtVals + ';\n\n';

  // 12. DOUBT REPLIES
  sql += `-- 12. DOUBT REPLIES\nINSERT INTO doubt_replies (id, doubt_id, author_id, author_name, author_role, message) VALUES\n`;
  const replies = [];
  data.doubts.forEach(d => {
    (d.replies || []).forEach(r => {
      replies.push(`  (${escapeSql(r.id)}, ${escapeSql(d.id)}, ${escapeSql(r.authorId)}, ${escapeSql(r.authorName)}, ${escapeSql(r.authorRole)}, ${escapeSql(r.message)})`);
    });
  });
  if (replies.length > 0) {
    sql += replies.join(',\n') + ';\n\n';
  }

  // 13. DPP SETS & QUESTIONS
  sql += `-- 13. DPP (DAILY PRACTICE PROBLEMS)\nINSERT INTO dpp_sets (id, subject_id, subject_name, title, questions_count, streak_day) VALUES\n`;
  const dppVals = data.dppSets.map(ds =>
    `  (${escapeSql(ds.id)}, ${escapeSql(ds.subjectId)}, ${escapeSql(ds.subjectName)}, ${escapeSql(ds.title)}, ${ds.questionsCount}, ${ds.streakDay})`
  ).join(',\n');
  sql += dppVals + ';\n\n';

  sql += `INSERT INTO dpp_questions (id, dpp_set_id, question, options, correct_index, explanation) VALUES\n`;
  const dppQues = [];
  data.dppSets.forEach(ds => {
    ds.questions.forEach(q => {
      dppQues.push(`  (${escapeSql(q.id)}, ${escapeSql(ds.id)}, ${escapeSql(q.question)}, ${escapeSql(q.options)}::jsonb, ${q.correctIndex}, ${escapeSql(q.explanation)})`);
    });
  });
  sql += dppQues.join(',\n') + ';\n\n';

  // 14. EXAMS
  sql += `-- 14. EXAMS\nINSERT INTO exams (id, type, subject, code, exam_date, time_slot, room, status) VALUES\n`;
  const examVals = data.exams.map(e =>
    `  (${escapeSql(e.id)}, ${escapeSql(e.type)}, ${escapeSql(e.subject)}, ${escapeSql(e.code)}, ${escapeSql(e.date)}, ${escapeSql(e.time)}, ${escapeSql(e.room)}, ${escapeSql(e.status)})`
  ).join(',\n');
  sql += examVals + ';\n\n';

  // 15. NOTICES
  sql += `-- 15. NOTICES\nINSERT INTO notices (id, title, content, target, target_type, target_value, author, date, priority) VALUES\n`;
  const noticeVals = data.notices.map(n =>
    `  (${escapeSql(n.id)}, ${escapeSql(n.title)}, ${escapeSql(n.content)}, ${escapeSql(n.target)}, ${escapeSql(n.targetType)}, ${escapeSql(n.targetValue || null)}, ${escapeSql(n.author)}, ${escapeSql(n.date)}, ${escapeSql(n.priority)})`
  ).join(',\n');
  sql += noticeVals + ';\n\n';

  // 16. LEAVE REQUESTS
  sql += `-- 16. LEAVE REQUESTS\nINSERT INTO leave_requests (id, student_id, student_name, student_roll, section, from_date, to_date, reason, type, status, reviewed_by, review_note, applied_at) VALUES\n`;
  const leaveVals = data.leaveRequests.map(l =>
    `  (${escapeSql(l.id)}, ${escapeSql(l.studentId)}, ${escapeSql(l.studentName)}, ${escapeSql(l.studentRoll)}, ${escapeSql(l.section)}, ${escapeSql(l.fromDate)}, ${escapeSql(l.toDate)}, ${escapeSql(l.reason)}, ${escapeSql(l.type)}, ${escapeSql(l.status)}, ${escapeSql(l.reviewedBy)}, ${escapeSql(l.reviewNote)}, ${escapeSql(l.appliedAt)})`
  ).join(',\n');
  sql += leaveVals + ';\n\n';

  // 17. NOTIFICATIONS
  sql += `-- 17. NOTIFICATIONS\nINSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES\n`;
  const notifVals = data.notifications.map(nf =>
    `  (${escapeSql(nf.id)}, ${escapeSql(nf.userId)}, ${escapeSql(nf.title)}, ${escapeSql(nf.message)}, ${escapeSql(nf.type)}, ${nf.read ? 'TRUE' : 'FALSE'})`
  ).join(',\n');
  sql += notifVals + ';\n\n';

  sql += `COMMIT;\n`;

  const outputPath = path.join(__dirname, '..', 'supabase', '02_seed_300_students.sql');
  fs.writeFileSync(outputPath, sql, 'utf-8');
  console.log(`Generated ${outputPath} successfully (${(sql.length / 1024).toFixed(1)} KB)`);
}

generate();
