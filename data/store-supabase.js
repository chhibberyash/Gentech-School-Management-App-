// Supabase-first store for the ACTUAL GenTech schema (users/students/faculty/etc.).
// Local JSON is only an offline fallback; when Supabase is connected, reads and writes
// go to Supabase and DB errors are surfaced instead of being silently swallowed.
const config = require('../config/supabase');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Supabase is the ONLY data source. If it is not configured we fail loudly instead of
// silently serving/saving local JSON (which is what made data "not update").
const localData = {};
const db = () => {
  if (!config.supabase) throw new Error(config.initError() || 'Supabase is not configured.');
  return config.supabase;
};
const uid = prefix => `${prefix || 'id'}-${crypto.randomUUID()}`;
const val = (v, d = null) => v === undefined ? d : v;

function normalizeRole(role) { return String(role || '').toLowerCase(); }
function sectionName(section) { return String(section || '').split('-').pop(); }
function statusLabel(s) { return s === true || s === 'Present' ? 'Present' : s === 'Late' ? 'Late' : 'Absent'; }
function gradeFor(ratio) { return ratio >= .90 ? 'A+' : ratio >= .80 ? 'A' : ratio >= .70 ? 'B+' : ratio >= .60 ? 'B' : ratio >= .50 ? 'C' : 'F'; }

function userToPublic(u, student = null, faculty = null, section = null) {
  if (!u) return null;
  return {
    id: u.id,
    identifier: u.identifier,
    email: u.email,
    name: u.name,
    role: normalizeRole(u.role),
    department: u.department || student?.dept_code || faculty?.dept_code || '',
    departmentName: '',
    deptId: student?.dept_id || null,
    sectionId: student?.section_id || null,
    sectionName: student?.section_name || section?.full_name || '',
    phone: u.phone,
    avatar: u.avatar,
    designation: u.designation || faculty?.designation || '',
    studentId: student?.student_id || (u.role === 'student' ? u.identifier : null),
    facultyId: faculty?.faculty_id || (u.role === 'faculty' ? u.identifier : null),
    rollNo: student?.roll_no ?? null,
    year: student?.year ?? null,
    semester: student?.semester ?? null,
    attendance: student?.attendance != null ? Number(student.attendance) : null,
    sgpa: student?.sgpa != null ? Number(student.sgpa) : null,
    cgpa: student?.cgpa != null ? Number(student.cgpa) : null,
    isActive: true
  };
}

const escLike = v => String(v).replace(/[\\%_]/g, m => '\\' + m);

async function userBundle(idOrIdentifier) {
  if (!idOrIdentifier) return null;
  const s = String(idOrIdentifier).trim();
  let u = null;
  // exact id first, then identifier / email (case-insensitive)
  for (const [col, op] of [['id', 'eq'], ['identifier', 'ilike'], ['email', 'ilike']]) {
    const val = op === 'ilike' ? escLike(s) : s;
    const { data, error } = await db().from('users').select('*')[op](col, val).limit(1);
    if (error) throw error;
    if (data && data.length) { u = data[0]; break; }
  }
  if (!u) return null;
  const [st, fac] = await Promise.all([
    db().from('students').select('*').eq('id', u.id).maybeSingle(),
    db().from('faculty').select('*').eq('id', u.id).maybeSingle()
  ]);
  if (st.error) throw st.error;
  if (fac.error) throw fac.error;
  let section = null;
  if (st.data?.section_id) {
    const x = await db().from('sections').select('*').eq('id', st.data.section_id).maybeSingle();
    if (x.error) throw x.error;
    section = x.data;
  }
  return userToPublic(u, st.data, fac.data, section);
}

async function findUserByIdentifier(identifier) {
  if (!db()) {
    const x = String(identifier || '').toLowerCase();
    return (localData.users || []).find(u => [u.identifier, u.email, u.studentId].some(v => String(v || '').toLowerCase() === x)) || null;
  }
  return userBundle(String(identifier || '').trim());
}
async function getUserById(id) { return db() ? userBundle(id) : (localData.users || []).find(u => u.id === id) || null; }

async function getDepartments() {
  if (!db()) return localData.departments || [];
  const { data, error } = await db().from('departments').select('*').order('code');
  if (error) throw error;
  return data || [];
}
async function getSections() {
  if (!db()) return localData.sections || [];
  const { data, error } = await db().from('sections').select('*').order('full_name');
  if (error) throw error;
  return (data || []).map(s => ({ id:s.id, deptId:s.dept_id, deptCode:s.dept_code, name:s.name, fullName:s.full_name, year:s.year, semester:s.semester, capacity:s.capacity }));
}

async function getStudents(filters = {}) {
  if (!db()) return { items: localData.students || [], total: (localData.students || []).length };
  let q = db().from('students').select('*', { count:'exact' }).order('roll_no');
  if (filters.dept) q = q.eq('dept_code', filters.dept);
  if (filters.section) q = q.eq('section_name', sectionName(filters.section));
  if (filters.search) {
    const x = String(filters.search).replace(/[%_,]/g, '');
    if (x) q = q.or(`student_id.ilike.%${x}%,section_name.ilike.%${x}%`);
  }
  {
    const lim = Number(filters.limit) || 0, off = Number(filters.offset) || 0;
    if (lim || off) q = q.range(off, off + (lim || 50) - 1);
  }
  const { data, error, count } = await q;
  if (error) throw error;
  const rows = data || [];
  if (!rows.length) return { items: [], data: [], total: count || 0 };
  const ids = rows.map(s => s.id);
  const { data: users, error: ue } = await db().from('users').select('*').in('id', ids);
  if (ue) throw ue;
  const byId = Object.fromEntries((users || []).map(u => [u.id, u]));
  const items = rows.map(s => userToPublic(byId[s.id] || {id:s.id,identifier:s.student_id,name:s.student_id,role:'student'}, s));
  return { items, data: items, total: count ?? items.length };
}

async function getStudentById(id) {
  if (!db()) return (localData.students || []).find(s => s.id === id || s.studentId === id || s.identifier === id) || null;
  const u = await userBundle(id);
  if (!u || u.role !== 'student') return null;
  return u;
}

async function addStudent(x) {
  if (!db()) return null;
  const id = x.id || uid('usr-stu');
  const section = sectionName(x.section);
  const studentId = x.studentId || x.identifier || id;
  const userRow = { id, identifier: studentId, email:x.email, password_hash:x.password || 'password123', name:x.name, role:'student', department:x.department || x.deptCode || null, phone:x.phone || null, avatar:x.avatar || null, designation:'Student' };
  const { error: ue } = await db().from('users').insert(userRow);
  if (ue) throw ue;
  const { data: sec, error: se } = await db().from('sections').select('*').or(`full_name.eq.${x.section},name.eq.${section}`).eq('dept_code', x.department || x.deptCode).maybeSingle();
  if (se) throw se;
  const row = { id, student_id:studentId, roll_no:Number(x.rollNo) || 0, dept_id:sec?.dept_id || x.deptId || null, dept_code:x.department || x.deptCode || '', section_id:sec?.id || x.sectionId || null, section_name:x.section || '', year:Number(x.year) || 2, semester:Number(x.semester) || 3, attendance:Number(x.attendance ?? 85), sgpa:Number(x.sgpa ?? 8), cgpa:Number(x.cgpa ?? 8) };
  const { data, error } = await db().from('students').insert(row).select().single();
  if (error) { await db().from('users').delete().eq('id', id); throw error; }
  return userToPublic(userRow, data, null, sec);
}

async function getFaculty() {
  if (!db()) return (localData.users || []).filter(u => u.role === 'faculty');
  const { data, error } = await db().from('faculty').select('*').order('faculty_id');
  if (error) throw error;
  const ids = (data || []).map(f => f.id);
  if (!ids.length) return [];
  const { data: users, error: ue } = await db().from('users').select('*').in('id', ids);
  if (ue) throw ue;
  const byId = Object.fromEntries((users || []).map(u => [u.id, u]));
  return (data || []).map(f => userToPublic(byId[f.id] || {id:f.id,identifier:f.faculty_id,name:f.faculty_id,role:'faculty'}, null, f));
}
async function addFaculty(x) {
  if (!db()) return null;
  const id = x.id || uid('usr-fac');
  const identifier = x.facultyId || x.identifier || id;
  const userRow = { id, identifier, email:x.email, password_hash:x.password || 'password123', name:x.name, role:'faculty', department:x.department || x.deptCode || null, phone:x.phone || null, avatar:x.avatar || null, designation:x.designation || 'Faculty' };
  const { error: ue } = await db().from('users').insert(userRow); if (ue) throw ue;
  const { data, error } = await db().from('faculty').insert({ id, faculty_id:identifier, dept_code:x.department || x.deptCode || '', specialization:x.specialization || null, designation:x.designation || 'Faculty' }).select().single();
  if (error) { await db().from('users').delete().eq('id',id); throw error; }
  return userToPublic(userRow, null, data);
}

async function getSubjects(dept) {
  if (!db()) return localData.subjects || [];
  let q = db().from('subjects').select('*').order('code');
  if (dept) q = q.eq('dept_code', dept);
  const { data, error } = await q; if (error) throw error;
  return (data || []).map(s => ({ id:s.id, code:s.code, name:s.name, deptCode:s.dept_code, semester:s.semester, credits:s.credits, facultyId:s.faculty_id, facultyName:s.faculty_name }));
}
async function getTimetable(section='CSE-B') {
  if (!db()) return localData.timetable?.[section] || [];
  const { data, error } = await db().from('timetable').select('*').eq('section_name', section).order('day').order('time_slot');
  if (error) throw error;
  return (data || []).map(t => ({ id:t.id, day:t.day, time:t.time_slot, subject:t.subject, code:t.code, room:t.room, faculty:t.faculty_name }));
}
async function getFacultyTimetable(name) {
  if (!db()) return Object.values(localData.timetable || {}).flat();
  const { data, error } = await db().from('timetable').select('*').ilike('faculty_name', `%${String(name || '').trim()}%`).order('day').order('time_slot');
  if (error) throw error;
  return (data || []).map(t => ({ id:t.id, day:t.day, time:t.time_slot, subject:t.subject, code:t.code, room:t.room, faculty:t.faculty_name }));
}

async function getNotes(subjectId, section) {
  if (!db()) return localData.notes || [];
  let q = db().from('notes').select('*').order('created_at',{ascending:false});
  if (subjectId) q=q.eq('subject_id',subjectId);
  if (section) q=q.eq('section',section);
  const { data,error }=await q; if(error) throw error;
  return (data||[]).map(n=>({id:n.id,subjectId:n.subject_id,subjectName:n.subject_name,deptCode:n.dept_code,section:n.section,title:n.title,description:n.description||'',fileName:n.file_name,fileSize:n.file_size,fileUrl:n.file_url,uploadDate:n.upload_date||n.created_at,author:n.author_name||'Faculty Member',authorId:n.author_id}));
}
async function addNote(x) {
  if (!db()) return null;
  const row={id:x.id||uid('note'),subject_id:x.subjectId,subject_name:x.subjectName||'',dept_code:x.deptCode||x.department||'',section:x.section||null,title:x.title,description:x.description||'',file_name:x.fileName||'Document.pdf',file_size:x.fileSize||null,file_url:x.fileUrl||'',author_id:x.authorId||null,author_name:x.author||x.authorName||'',upload_date:new Date().toISOString().slice(0,10)};
  const {data,error}=await db().from('notes').insert(row).select().single(); if(error) throw error; return {...x,id:data.id};
}

async function getAssignments(section) {
  if (!db()) return localData.assignments || [];
  let q=db().from('assignments').select('*').order('created_at',{ascending:false}); if(section) q=q.eq('section',section);
  const {data,error}=await q; if(error) throw error;
  return (data||[]).map(a=>({id:a.id,subjectId:a.subject_id,subjectName:a.subject_name,deptCode:a.dept_code,section:a.section,title:a.title,description:a.description,dueDate:a.due_date,maxMarks:a.max_marks,fileUrl:a.file_url,status:a.status,authorId:a.author_id,authorName:a.author_name,createdAt:a.created_at}));
}
async function addAssignment(x) {
  if (!db()) return null;
  const row={id:x.id||uid('asg'),subject_id:x.subjectId,subject_name:x.subjectName||'',dept_code:x.deptCode||x.department||'',section:x.section||'CSE-B',title:x.title,description:x.description||'',due_date:x.dueDate,max_marks:Number(x.maxMarks)||20,author_id:x.authorId||null,author_name:x.author||x.authorName||'',file_url:x.fileUrl||null,status:x.status||'Active'};
  const {data,error}=await db().from('assignments').insert(row).select().single(); if(error) throw error; return {...x,id:data.id};
}
async function getSubmissions(assignmentId) {
  if (!db()) return localData.submissions || [];
  const {data,error}=await db().from('assignment_submissions').select('*').eq('assignment_id',assignmentId).order('submitted_at',{ascending:false}); if(error) throw error;
  return (data||[]).map(s=>({id:s.id,assignmentId:s.assignment_id,studentId:s.student_id,studentName:s.student_name,studentRoll:s.student_roll,submittedAt:s.submitted_at,fileUrl:s.file_url,fileName:s.file_name,grade:s.grade||'Pending Review',feedback:s.feedback||'',status:s.status||'Submitted'}));
}
async function submitAssignment(x) {
  if (!db()) return null;
  const row={id:x.id||uid('sub'),assignment_id:x.assignmentId,student_id:x.studentId,student_name:x.studentName||'',student_roll:String(x.studentRoll||''),submitted_at:new Date().toISOString(),file_name:x.fileName||'Assignment_Submission.pdf',file_url:x.fileUrl||null,grade:x.grade||null,feedback:x.feedback||null,status:'Submitted'};
  const {data,error}=await db().from('assignment_submissions').upsert(row,{onConflict:'assignment_id,student_id'}).select().single(); if(error) throw error; return {...x,id:data.id,submittedAt:data.submitted_at,status:data.status,grade:data.grade||'Pending Review'};
}

async function getDoubts(filters={}) {
  if (!db()) return localData.doubts || [];
  let q=db().from('doubts').select('*').order('created_at',{ascending:false});
  if(filters.studentId) q=q.eq('student_id',filters.studentId); if(filters.facultyId) q=q.eq('faculty_id',filters.facultyId); if(filters.subjectId) q=q.eq('subject_id',filters.subjectId); if(filters.status) q=q.eq('status',filters.status==='Waiting for Teacher'?'Waiting for Teacher':filters.status);
  const {data,error}=await q; if(error) throw error;
  const rows=data||[]; const ids=rows.map(d=>d.id); let replies=[];
  if(ids.length){const r=await db().from('doubt_replies').select('*').in('doubt_id',ids).order('created_at'); if(r.error) throw r.error; replies=r.data||[];}
  const by={}; for(const r of replies)(by[r.doubt_id]??=[]).push({id:r.id,authorId:r.author_id,authorName:r.author_name,authorRole:r.author_role,message:r.message,createdAt:r.created_at});
  return rows.map(d=>({id:d.id,studentId:d.student_id,studentName:d.student_name,studentRoll:d.student_roll,studentAvatar:d.student_avatar,department:d.department,section:d.section,subjectId:d.subject_id,subjectName:d.subject_name,facultyId:d.faculty_id,facultyName:d.faculty_name,question:d.question,attachmentUrl:d.attachment_url,attachmentName:d.attachment_name,status:d.status,createdAt:d.created_at,replies:by[d.id]||[]}));
}
async function createDoubt(x) {
  if (!db()) return null;
  const row={id:x.id||uid('doubt'),student_id:x.studentId,student_name:x.studentName||'',student_roll:String(x.studentRoll||''),student_avatar:x.studentAvatar||null,department:x.department||'',section:x.section||'',subject_id:x.subjectId,subject_name:x.subjectName||'',faculty_id:x.facultyId||null,faculty_name:x.facultyName||'',question:x.question,attachment_url:x.attachmentUrl||null,attachment_name:x.attachmentName||null,status:'Waiting for Teacher'};
  const {data,error}=await db().from('doubts').insert(row).select().single(); if(error) throw error; return {...x,id:data.id,status:data.status,createdAt:data.created_at,replies:[]};
}
async function replyDoubt(id,x) {
  if (!db()) return null;
  const row={id:x.id||uid('reply'),doubt_id:id,author_id:x.authorId,author_name:x.authorName||'',author_role:x.authorRole||'faculty',message:x.message};
  const {data,error}=await db().from('doubt_replies').insert(row).select().single(); if(error) throw error;
  const {error:ue}=await db().from('doubts').update({status:'Answered',updated_at:new Date().toISOString()}).eq('id',id); if(ue) throw ue;
  return {...x,id:data.id,createdAt:data.created_at};
}

async function getDppSets(subjectId) {
  if (!db()) return localData.dppSets || [];
  let q=db().from('dpp_sets').select('*').order('created_at',{ascending:false}); if(subjectId) q=q.eq('subject_id',subjectId);
  const {data,error}=await q; if(error) throw error;
  const ids=(data||[]).map(x=>x.id); let qs=[]; if(ids.length){const r=await db().from('dpp_questions').select('*').in('dpp_set_id',ids); if(r.error) throw r.error; qs=r.data||[];}
  const by={}; for(const q of qs)(by[q.dpp_set_id]??=[]).push(q);
  return (data||[]).map(d=>({id:d.id,subjectId:d.subject_id,subjectName:d.subject_name,title:d.title,questionsCount:d.questions_count||by[d.id]?.length||0,streakDay:d.streak_day,questions:(by[d.id]||[]).map(q=>({id:q.id,question:q.question,options:q.options,correctIndex:q.correct_index,explanation:q.explanation}))}));
}

async function getStudentAttendance(studentId) {
  if (!db()) return localData.studentSubjectAttendance || [];
  const {data,error}=await db().from('attendance').select('*').eq('student_id',studentId).order('date'); if(error) throw error;
  const subjectIds=[...new Set((data||[]).map(a=>a.subject_id).filter(Boolean))]; let subjects=[]; if(subjectIds.length){const r=await db().from('subjects').select('id,name,faculty_name').in('id',subjectIds); if(r.error) throw r.error; subjects=r.data||[];}
  const sm=Object.fromEntries(subjects.map(s=>[s.id,s])); const map={};
  for(const a of data||[]){const k=a.subject_id; if(!map[k])map[k]={subjectId:k,name:sm[k]?.name||'',faculty:sm[k]?.faculty_name||'',total:0,attended:0}; map[k].total++; if(a.status==='Present'||a.status==='Late')map[k].attended++;}
  return Object.values(map).map(x=>({...x,percentage:x.total?Math.round(x.attended*100/x.total):0,status:x.total&&x.attended*100/x.total<75?'Warning':'Good'}));
}
async function markAttendanceBatch(records) {
  if (!db()) return {success:true,count:(records||[]).length};
  const rows=(records||[]).map(r=>({student_id:r.studentId,subject_id:r.subjectId,date:r.date||r.attendanceDate||new Date().toISOString().slice(0,10),status:statusLabel(r.status||r.present),marked_by:r.markedBy||r.facultyId||null}));
  if(!rows.length)return {success:true,count:0};
  const {error}=await db().from('attendance').upsert(rows,{onConflict:'student_id,subject_id,date'}); if(error) throw error;
  return {success:true,count:rows.length,timestamp:new Date().toISOString()};
}

async function getExams() {
  if (!db()) return localData.exams || [];
  const {data,error}=await db().from('exams').select('*').order('exam_date'); if(error) throw error;
  return (data||[]).map(e=>({id:e.id,type:e.type,subject:e.subject,code:e.code,date:e.exam_date,time:e.time_slot,room:e.room,status:e.status}));
}
async function getStudentResults(studentId) {
  if (!db()) return localData.results || {};
  const {data:student,error:se}=await db().from('students').select('*').eq('id',studentId).maybeSingle(); if(se) throw se; if(!student) return {studentId,marks:[]};
  let marks=[];
  const r=await db().from('marks').select('*').eq('student_id',studentId).order('subject_name');
  if(r.error) throw r.error;
  marks=(r.data||[]).map(m=>{const total=Number(m.total ?? (Number(m.internal||0)+Number(m.mid_sem||0)+Number(m.end_sem||0))); return {id:m.id,subject:m.subject_name,code:m.code,internal:Number(m.internal||0),midSem:Number(m.mid_sem||0),endSem:Number(m.end_sem||0),total,grade:m.grade||gradeFor(total/100)};});
  return {studentId,semester:student.semester,sgpa:Number(student.sgpa),cgpa:Number(student.cgpa),marks};
}

async function getNotices(filter={}) {
  if (!db()) return localData.notices || [];
  let q=db().from('notices').select('*').order('created_at',{ascending:false});
  if(filter.targetType){const map={dept:'dept',department:'dept',section:'section',student:'student',college:'college'}; q=q.eq('target_type',map[filter.targetType]||filter.targetType);}
  const {data,error}=await q; if(error) throw error;
  return (data||[]).map(n=>({id:n.id,title:n.title,content:n.content,imageUrl:n.image_url||null,target:n.target,targetType:n.target_type,targetValue:n.target_value,author:n.author,date:n.date||n.created_at?.slice(0,10),priority:n.priority||'Normal'}));
}
async function createNotice(x) {
  if (!db()) return null;
  const row={id:x.id||uid('notice'),title:x.title,content:x.content||'',target:x.target||'Entire College',target_type:x.targetType||'college',target_value:x.targetValue||null,author:x.author||'Office of Administration',date:x.date||new Date().toISOString().slice(0,10),priority:x.priority||'Normal',image_url:x.imageUrl||null};
  const {data,error}=await db().from('notices').insert(row).select().single(); if(error) throw error;
  return {...x,id:data.id,imageUrl:data.image_url,date:data.date};
}

async function getLeaveRequests(filter={}) {
  if (!db()) return localData.leaveRequests || [];
  let q=db().from('leave_requests').select('*').order('created_at',{ascending:false});
  if(filter.studentId)q=q.eq('student_id',filter.studentId); if(filter.section)q=q.eq('section',filter.section); if(filter.status)q=q.eq('status',filter.status);
  const {data,error}=await q; if(error) throw error;
  return (data||[]).map(l=>({id:l.id,studentId:l.student_id,studentName:l.student_name,studentRoll:l.student_roll,section:l.section,fromDate:l.from_date,toDate:l.to_date,reason:l.reason,type:l.type,status:l.status,reviewedBy:l.reviewed_by,reviewNote:l.review_note||'',appliedAt:l.applied_at||l.created_at?.slice(0,10)}));
}
async function applyLeave(x) {
  if (!db()) return null;
  const row={id:x.id||uid('leave'),student_id:x.studentId,student_name:x.studentName||'',student_roll:String(x.studentRoll||''),section:x.section||'',from_date:x.fromDate,to_date:x.toDate,reason:x.reason,type:x.type||'Personal',status:'Pending',applied_at:new Date().toISOString().slice(0,10)};
  const {data,error}=await db().from('leave_requests').insert(row).select().single(); if(error) throw error; return {...x,id:data.id,status:data.status,appliedAt:data.applied_at};
}
async function reviewLeave(id,status,reviewNote,reviewer) {
  if (!db()) return null;
  const {data,error}=await db().from('leave_requests').update({status,reviewed_by:reviewer||null,review_note:reviewNote||null}).eq('id',id).select().single(); if(error) throw error; return data;
}
async function getNotifications(userId) {
  if (!db()) return localData.notifications || [];
  let q=db().from('notifications').select('*').order('created_at',{ascending:false}); if(userId)q=q.eq('user_id',userId);
  const {data,error}=await q; if(error)throw error; return (data||[]).map(n=>({id:n.id,userId:n.user_id,title:n.title,message:n.message,type:n.type,time:n.created_at,read:n.is_read}));
}
async function getCollegeStats() {
  if (!db()) return {};
  const counts=await Promise.all([
    db().from('students').select('*',{count:'exact',head:true}),
    db().from('faculty').select('*',{count:'exact',head:true}),
    db().from('departments').select('*',{count:'exact',head:true}),
    db().from('sections').select('*',{count:'exact',head:true})
  ]); for(const r of counts)if(r.error)throw r.error;
  const {data:students,error:se}=await db().from('students').select('attendance,sgpa,cgpa'); if(se)throw se;
  const {data:att,error:ae}=await db().from('attendance').select('status'); if(ae)throw ae;
  return {totalStudents:counts[0].count||0,totalFaculty:counts[1].count||0,totalDepartments:counts[2].count||0,totalSections:counts[3].count||0,averageAttendance:att?.length?Math.round(att.filter(a=>a.status==='Present'||a.status==='Late').length*100/att.length):Math.round((students||[]).reduce((a,s)=>a+Number(s.attendance||0),0)/Math.max(1,(students||[]).length)),averageResult:(students||[]).length?Math.round((students||[]).reduce((a,s)=>a+Number(s.sgpa||0)*10,0)/(students||[]).length):0};
}
async function globalSearch(query) {
  if(!db()||!query||String(query).trim().length<2)return [];
  const q=String(query).trim();
  const [s,f]=await Promise.all([
    db().from('students').select('*').or(`student_id.ilike.%${q}%,section_name.ilike.%${q}%`).limit(10),
    db().from('faculty').select('*').or(`faculty_id.ilike.%${q}%,dept_code.ilike.%${q}%`).limit(5)
  ]); if(s.error)throw s.error; if(f.error)throw f.error;
  const ids=[...(s.data||[]).map(x=>x.id),...(f.data||[]).map(x=>x.id)]; let users=[]; if(ids.length){const u=await db().from('users').select('*').in('id',ids); if(u.error)throw u.error; users=u.data||[];}
  const byId=Object.fromEntries(users.map(u=>[u.id,u]));
  return [...(s.data||[]).map(st=>{const u=byId[st.id]||{}; return {type:'Student',id:st.id,title:u.name||st.student_id,subtitle:`${st.student_id} • ${st.dept_code}-${st.section_name} • Roll #${st.roll_no}`,details:userToPublic(u,st)};}),...(f.data||[]).map(fc=>{const u=byId[fc.id]||{}; return {type:'Faculty',id:fc.id,title:u.name||fc.faculty_id,subtitle:`${fc.faculty_id} • ${fc.dept_code}`,details:userToPublic(u,null,fc)};})];
}

module.exports={findUserByIdentifier,getUserById,getDepartments,getSections,getStudents,getStudentById,addStudent,getFaculty,addFaculty,getSubjects,getTimetable,getFacultyTimetable,getNotes,addNote,getAssignments,addAssignment,getSubmissions,submitAssignment,getDoubts,createDoubt,replyDoubt,getDppSets,getStudentAttendance,markAttendanceBatch,getExams,getStudentResults,getNotices,createNotice,getLeaveRequests,applyLeave,reviewLeave,getNotifications,getCollegeStats,globalSearch};
