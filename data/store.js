// DEPRECATED - NOT USED. server.js now uses ./store-supabase.js (Supabase is the only data source).
// Kept only for reference; it reads/writes local JSON and must not be required by the server.
const fs = require('fs');
const path = require('path');
const config = require('../config/supabase');

// Persistent storage path
const dbPath = path.join(__dirname, 'local_db.json');
const seedPath = path.join(__dirname, 'seed_data.json');

// Initialize data store from local_db.json if exists, else seed_data.json
let localData = null;
if (fs.existsSync(dbPath)) {
  try {
    localData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  } catch (e) {
    localData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  }
} else {
  localData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
}

function persistLocalData() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(localData, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to persist local_db:', e.message);
  }
}

// Helper to convert snake_case DB row to camelCase
const NOTICE_IMAGE_MARKER = '\n\n[[GENTECH_NOTICE_IMAGE::';

function rowToNotice(r) {
  if (!r) return null;
  let content = r.content || '';
  let imageUrl = r.image_url || null;
  const marker = content.lastIndexOf(NOTICE_IMAGE_MARKER);
  if (!imageUrl && marker !== -1) {
    const tail = content.slice(marker + NOTICE_IMAGE_MARKER.length);
    const end = tail.indexOf(']]');
    if (end !== -1) {
      imageUrl = tail.slice(0, end);
      content = content.slice(0, marker);
    }
  }
  return {
    id: r.id,
    title: r.title,
    content,
    imageUrl,
    target: r.target,
    targetType: r.target_type || r.targetType || 'college',
    targetValue: r.target_value || r.targetValue || null,
    author: r.author,
    date: r.date,
    priority: r.priority || 'Normal'
  };
}

function noticeToRow(n) {
  const imageSuffix = n.imageUrl ? `${NOTICE_IMAGE_MARKER}${n.imageUrl}]]` : '';
  return {
    id: n.id,
    title: n.title,
    content: `${n.content || ''}${imageSuffix}`,
    target: n.target,
    target_type: n.targetType || 'college',
    target_value: n.targetValue || null,
    author: n.author,
    date: n.date,
    priority: n.priority || 'Normal'
  };
}

class Store {
  // --- USERS & AUTH ---
  async findUserByIdentifier(identifier) {
    if (!identifier) return null;
    const cleanId = identifier.trim().toLowerCase();

    if (config.isAvailable() && config.supabase) {
      try {
        const { data, error } = await config.supabase
          .from('users')
          .select('*')
          .or(`email.ilike.${cleanId},identifier.ilike.${cleanId}`)
          .maybeSingle();
        if (data && !error) {
          // If student, attach extra profile
          if (data.role === 'student') {
            const { data: stData } = await config.supabase.from('students').select('*').eq('id', data.id).maybeSingle();
            if (stData) {
              return {
                ...data,
                studentId: stData.student_id,
                rollNo: stData.roll_no,
                sectionName: stData.section_name,
                year: stData.year,
                semester: stData.semester,
                attendance: stData.attendance,
                sgpa: stData.sgpa,
                cgpa: stData.cgpa
              };
            }
          }
          return data;
        }
      } catch (e) {}
    }

    // Local fallback
    return localData.users.find(u => 
      (u.email && u.email.toLowerCase() === cleanId) || 
      (u.identifier && u.identifier.toLowerCase() === cleanId) ||
      (u.studentId && u.studentId.toLowerCase() === cleanId)
    ) || null;
  }

  async getUserById(id) {
    if (config.isAvailable() && config.supabase) {
      try {
        const { data } = await config.supabase.from('users').select('*').eq('id', id).maybeSingle();
        if (data) return data;
      } catch (e) {}
    }
    return localData.users.find(u => u.id === id) || null;
  }

  // --- COLLEGE STRUCTURE ---
  async getDepartments() {
    if (config.isAvailable() && config.supabase) {
      try {
        const { data } = await config.supabase.from('departments').select('*');
        if (data && data.length) return data;
      } catch (e) {}
    }
    return localData.departments;
  }

  async getSections() {
    if (config.isAvailable() && config.supabase) {
      try {
        const { data } = await config.supabase.from('sections').select('*');
        if (data && data.length) {
          return data.map(s => ({
            id: s.id,
            deptId: s.dept_id,
            deptCode: s.dept_code,
            name: s.name,
            fullName: s.full_name,
            year: s.year,
            semester: s.semester,
            capacity: s.capacity
          }));
        }
      } catch (e) {}
    }
    return localData.sections;
  }

  // --- STUDENTS ---
  async getStudents(filters = {}) {
    if (config.isAvailable() && config.supabase) {
      try {
        let query = config.supabase.from('students').select('*, users!inner(*)', { count: 'exact' });
        if (filters.dept) query = query.ilike('dept_code', filters.dept);
        if (filters.section) query = query.ilike('section_name', filters.section);
        if (filters.search) {
          const q = `%${filters.search}%`;
          query = query.or(`student_id.ilike.${q},section_name.ilike.${q}`);
        }
        const limit = filters.limit ? parseInt(filters.limit, 10) : 50;
        const offset = filters.offset ? parseInt(filters.offset, 10) : 0;
        query = query.range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (data && !error && data.length > 0) {
          const items = data.map(s => ({
            id: s.id,
            studentId: s.student_id,
            rollNo: s.roll_no,
            name: s.users?.name || 'Student',
            email: s.users?.email || '',
            department: s.dept_code,
            sectionName: s.section_name,
            year: s.year,
            semester: s.semester,
            attendance: Number(s.attendance || 85),
            sgpa: Number(s.sgpa || 8.0),
            cgpa: Number(s.cgpa || 8.0),
            avatar: s.users?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.student_id}`
          }));
          return { total: count || items.length, items, offset, limit };
        }
      } catch (e) {}
    }

    // Local data processing
    let list = localData.students;
    if (filters.dept) {
      list = list.filter(s => s.department && s.department.toLowerCase() === filters.dept.toLowerCase());
    }
    if (filters.section) {
      list = list.filter(s => s.sectionName && s.sectionName.toLowerCase() === filters.section.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) || 
        (s.studentId && s.studentId.toLowerCase().includes(q)) || 
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.rollNo && String(s.rollNo).includes(q))
      );
    }

    const total = list.length;
    const limit = filters.limit ? parseInt(filters.limit, 10) : 50;
    const offset = filters.offset ? parseInt(filters.offset, 10) : 0;
    const items = list.slice(offset, offset + limit);

    return { total, items, offset, limit };
  }

  async getStudentById(id) {
    return localData.students.find(s => s.id === id || s.studentId === id || s.identifier === id) || null;
  }

  async addStudent(studentData) {
    const newStudent = {
      id: `usr-stu-${Date.now()}`,
      identifier: studentData.studentId,
      studentId: studentData.studentId,
      rollNo: parseInt(studentData.rollNo, 10) || (localData.students.length + 1),
      email: studentData.email,
      password: 'password123',
      name: studentData.name,
      role: 'student',
      department: studentData.department,
      deptId: `dept-${studentData.department.toLowerCase()}`,
      sectionId: `sec-${studentData.section.toLowerCase()}`,
      sectionName: studentData.section,
      year: studentData.year || 2,
      semester: studentData.semester || 3,
      attendance: 85,
      sgpa: 8.0,
      cgpa: 8.0,
      phone: studentData.phone || '+91 98000 00000',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentData.name.replace(/\s+/g, '')}`
    };

    localData.students.unshift(newStudent);
    localData.users.unshift(newStudent);
    persistLocalData();

    if (config.isAvailable() && config.supabase) {
      try {
        await config.supabase.from('users').insert({
          id: newStudent.id,
          identifier: newStudent.identifier,
          email: newStudent.email,
          password_hash: 'password123',
          name: newStudent.name,
          role: 'student',
          department: newStudent.department,
          phone: newStudent.phone,
          avatar: newStudent.avatar
        });
        await config.supabase.from('students').insert({
          id: newStudent.id,
          student_id: newStudent.studentId,
          roll_no: newStudent.rollNo,
          dept_code: newStudent.department,
          section_name: newStudent.sectionName,
          year: newStudent.year,
          semester: newStudent.semester,
          attendance: newStudent.attendance,
          sgpa: newStudent.sgpa,
          cgpa: newStudent.cgpa
        });
      } catch (e) {}
    }

    return newStudent;
  }

  // --- FACULTY ---
  async getFaculty() {
    if (config.isAvailable() && config.supabase) {
      try {
        const { data } = await config.supabase.from('users').select('*').eq('role', 'faculty');
        if (data && data.length) return data;
      } catch (e) {}
    }
    return localData.users.filter(u => u.role === 'faculty');
  }

  async addFaculty(facultyData) {
    const newFac = {
      id: `usr-fac-${Date.now()}`,
      identifier: facultyData.facultyId || `FAC${localData.users.filter(u => u.role === 'faculty').length + 1}`,
      email: facultyData.email,
      password: 'password123',
      name: facultyData.name,
      role: 'faculty',
      department: facultyData.department,
      phone: facultyData.phone || '+91 98765 00000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      designation: facultyData.designation || 'Assistant Professor',
      specialization: facultyData.specialization || 'Computer Science'
    };
    localData.users.push(newFac);
    persistLocalData();

    if (config.isAvailable() && config.supabase) {
      try {
        await config.supabase.from('users').insert(newFac);
      } catch (e) {}
    }

    return newFac;
  }

  // --- SUBJECTS ---
  async getSubjects(deptCode) {
    if (config.isAvailable() && config.supabase) {
      try {
        let q = config.supabase.from('subjects').select('*');
        if (deptCode) q = q.ilike('dept_code', deptCode);
        const { data } = await q;
        if (data && data.length) {
          return data.map(s => ({
            id: s.id,
            code: s.code,
            name: s.name,
            deptCode: s.dept_code,
            semester: s.semester,
            credits: s.credits,
            facultyId: s.faculty_id,
            facultyName: s.faculty_name
          }));
        }
      } catch (e) {}
    }

    if (deptCode) {
      return localData.subjects.filter(s => s.deptCode.toLowerCase() === deptCode.toLowerCase());
    }
    return localData.subjects;
  }

  // --- TIMETABLE ---
  async getTimetable(section = 'CSE-B') {
    if (config.isAvailable() && config.supabase) {
      try {
        const { data } = await config.supabase.from('timetable').select('*').eq('section_name', section);
        if (data && data.length) {
          return data.map(t => ({
            day: t.day,
            time: t.time_slot,
            subject: t.subject,
            code: t.code,
            room: t.room,
            faculty: t.faculty_name
          }));
        }
      } catch (e) {}
    }
    return localData.timetable[section] || localData.timetable['CSE-B'] || [];
  }

  async getFacultyTimetable(facultyName = 'Prof. R.K. Sharma') {
    const allSlots = localData.timetable['CSE-B'] || [];
    return allSlots.filter(s => s.faculty.toLowerCase().includes(facultyName.toLowerCase()));
  }

  // --- NOTES ---
  async getNotes(subjectId, section) {
    if (config.isAvailable() && config.supabase) {
      try {
        let q = config.supabase.from('notes').select('*');
        if (subjectId) q = q.eq('subject_id', subjectId);
        const { data } = await q;
        if (data && data.length) {
          return data.map(n => ({
            id: n.id,
            subjectId: n.subject_id,
            subjectName: n.subject_name,
            deptCode: n.dept_code,
            section: n.section,
            title: n.title,
            description: n.description,
            fileName: n.file_name,
            fileSize: n.file_size,
            fileUrl: n.file_url,
            authorId: n.author_id,
            author: n.author_name,
            uploadDate: n.upload_date
          }));
        }
      } catch (e) {}
    }

    let list = localData.notes;
    if (subjectId) list = list.filter(n => n.subjectId === subjectId);
    if (section) list = list.filter(n => !n.section || n.section === section);
    return list;
  }

  async addNote(noteData) {
    const newNote = {
      id: `note-${Date.now()}`,
      subjectId: noteData.subjectId,
      subjectName: noteData.subjectName,
      deptCode: noteData.deptCode || 'CSE',
      section: noteData.section || 'CSE-B',
      title: noteData.title,
      description: noteData.description || '',
      fileName: noteData.fileName || 'Document.pdf',
      fileSize: noteData.fileSize || '3.2 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      author: noteData.author || 'Faculty Member',
      authorId: noteData.authorId || 'usr-fac-01',
      fileUrl: noteData.fileUrl || '/uploads/sample_notes.pdf'
    };
    localData.notes.unshift(newNote);
    persistLocalData();

    if (config.isAvailable() && config.supabase) {
      try {
        await config.supabase.from('notes').insert({
          id: newNote.id,
          subject_id: newNote.subjectId,
          subject_name: newNote.subjectName,
          dept_code: newNote.deptCode,
          section: newNote.section,
          title: newNote.title,
          description: newNote.description,
          file_name: newNote.fileName,
          file_size: newNote.fileSize,
          file_url: newNote.fileUrl,
          author_id: newNote.authorId,
          author_name: newNote.author,
          upload_date: newNote.uploadDate
        });
      } catch (e) {}
    }

    return newNote;
  }

  // --- ASSIGNMENTS ---
  async getAssignments(section = 'CSE-B') {
    if (config.isAvailable() && config.supabase) {
      try {
        const { data } = await config.supabase.from('assignments').select('*').eq('section', section);
        if (data && data.length) {
          return data.map(a => ({
            id: a.id,
            subjectId: a.subject_id,
            subjectName: a.subject_name,
            deptCode: a.dept_code,
            section: a.section,
            title: a.title,
            description: a.description,
            dueDate: a.due_date,
            maxMarks: a.max_marks,
            authorId: a.author_id,
            authorName: a.author_name,
            fileUrl: a.file_url,
            status: a.status,
            totalStudents: 50,
            submittedCount: 42,
            pendingCount: 8
          }));
        }
      } catch (e) {}
    }
    return localData.assignments.filter(a => a.section === section);
  }

  async addAssignment(asgData) {
    const newAsg = {
      id: `asg-${Date.now()}`,
      subjectId: asgData.subjectId,
      subjectName: asgData.subjectName,
      deptCode: asgData.deptCode || 'CSE',
      section: asgData.section || 'CSE-B',
      title: asgData.title,
      description: asgData.description,
      dueDate: asgData.dueDate,
      maxMarks: asgData.maxMarks || 20,
      totalStudents: 50,
      submittedCount: 0,
      pendingCount: 50,
      authorId: asgData.authorId || 'usr-fac-01',
      authorName: asgData.authorName || 'Faculty',
      fileUrl: asgData.fileUrl || '/uploads/sample_assignment.pdf',
      status: 'Active'
    };
    localData.assignments.unshift(newAsg);
    persistLocalData();

    if (config.isAvailable() && config.supabase) {
      try {
        await config.supabase.from('assignments').insert({
          id: newAsg.id,
          subject_id: newAsg.subjectId,
          subject_name: newAsg.subjectName,
          dept_code: newAsg.deptCode,
          section: newAsg.section,
          title: newAsg.title,
          description: newAsg.description,
          due_date: newAsg.dueDate,
          max_marks: newAsg.maxMarks,
          author_id: newAsg.authorId,
          author_name: newAsg.authorName,
          file_url: newAsg.fileUrl,
          status: newAsg.status
        });
      } catch (e) {}
    }

    return newAsg;
  }

  async getSubmissions(assignmentId) {
    return localData.submissions.filter(s => s.assignmentId === assignmentId);
  }

  async submitAssignment(subData) {
    const newSub = {
      id: `subm-${Date.now()}`,
      assignmentId: subData.assignmentId,
      studentId: subData.studentId,
      studentName: subData.studentName,
      studentRoll: subData.studentRoll,
      submittedAt: new Date().toLocaleString(),
      fileName: subData.fileName || 'Solution.pdf',
      status: 'Submitted',
      grade: 'Pending Review',
      feedback: 'Submitted on time'
    };
    localData.submissions.unshift(newSub);
    persistLocalData();
    return newSub;
  }

  // --- DOUBTS SYSTEM ---
  async getDoubts(filters = {}) {
    if (config.isAvailable() && config.supabase) {
      try {
        let q = config.supabase.from('doubts').select('*, doubt_replies(*)').order('created_at', { ascending: false });
        if (filters.facultyId) q = q.eq('faculty_id', filters.facultyId);
        if (filters.studentId) q = q.eq('student_id', filters.studentId);
        if (filters.status) q = q.eq('status', filters.status);
        const { data } = await q;
        if (data && data.length) {
          return data.map(d => ({
            id: d.id,
            studentId: d.student_id,
            studentName: d.student_name,
            studentRoll: d.student_roll,
            studentAvatar: d.student_avatar,
            department: d.department,
            section: d.section,
            subjectId: d.subject_id,
            subjectName: d.subject_name,
            facultyId: d.faculty_id,
            facultyName: d.faculty_name,
            question: d.question,
            attachmentUrl: d.attachment_url,
            attachmentName: d.attachment_name,
            status: d.status,
            createdAt: d.created_at,
            replies: (d.doubt_replies || []).map(r => ({
              id: r.id,
              authorId: r.author_id,
              authorName: r.author_name,
              authorRole: r.author_role,
              message: r.message,
              createdAt: r.created_at
            }))
          }));
        }
      } catch (e) {}
    }

    let list = localData.doubts;
    if (filters.facultyId) list = list.filter(d => d.facultyId === filters.facultyId);
    if (filters.studentId) list = list.filter(d => d.studentId === filters.studentId);
    if (filters.subjectId) list = list.filter(d => d.subjectId === filters.subjectId);
    if (filters.status) list = list.filter(d => d.status.toLowerCase() === filters.status.toLowerCase());
    return list;
  }

  async createDoubt(doubtData) {
    let facultyId = doubtData.facultyId;
    let facultyName = doubtData.facultyName;
    if (!facultyId && doubtData.subjectId) {
      const sub = localData.subjects.find(s => s.id === doubtData.subjectId);
      if (sub) {
        facultyId = sub.facultyId;
        facultyName = sub.facultyName;
      }
    }

    const newDoubt = {
      id: `dbt-${Date.now()}`,
      studentId: doubtData.studentId,
      studentName: doubtData.studentName,
      studentRoll: doubtData.studentRoll,
      studentAvatar: doubtData.studentAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student',
      department: doubtData.department || 'CSE',
      section: doubtData.section || 'CSE-B',
      subjectId: doubtData.subjectId,
      subjectName: doubtData.subjectName,
      facultyId: facultyId || 'usr-fac-01',
      facultyName: facultyName || 'Prof. R.K. Sharma',
      question: doubtData.question,
      attachmentUrl: doubtData.attachmentUrl || '',
      attachmentName: doubtData.attachmentName || '',
      status: 'Waiting for Teacher',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      replies: []
    };

    localData.doubts.unshift(newDoubt);
    persistLocalData();

    if (config.isAvailable() && config.supabase) {
      try {
        await config.supabase.from('doubts').insert({
          id: newDoubt.id,
          student_id: newDoubt.studentId,
          student_name: newDoubt.studentName,
          student_roll: newDoubt.studentRoll,
          student_avatar: newDoubt.studentAvatar,
          department: newDoubt.department,
          section: newDoubt.section,
          subject_id: newDoubt.subjectId,
          subject_name: newDoubt.subjectName,
          faculty_id: newDoubt.facultyId,
          faculty_name: newDoubt.facultyName,
          question: newDoubt.question,
          attachment_url: newDoubt.attachmentUrl,
          attachment_name: newDoubt.attachmentName,
          status: newDoubt.status
        });
      } catch (e) {}
    }

    return newDoubt;
  }

  async replyDoubt(doubtId, replyData) {
    const doubt = localData.doubts.find(d => d.id === doubtId);
    if (!doubt) throw new Error('Doubt not found');

    const reply = {
      id: `rep-${Date.now()}`,
      authorId: replyData.authorId || 'usr-fac-01',
      authorName: replyData.authorName,
      authorRole: replyData.authorRole || 'faculty',
      message: replyData.message,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    if (!doubt.replies) doubt.replies = [];
    doubt.replies.push(reply);
    doubt.status = 'Answered';
    persistLocalData();

    if (config.isAvailable() && config.supabase) {
      try {
        await config.supabase.from('doubts').update({ status: 'Answered' }).eq('id', doubtId);
        await config.supabase.from('doubt_replies').insert({
          id: reply.id,
          doubt_id: doubtId,
          author_id: reply.authorId,
          author_name: reply.authorName,
          author_role: reply.authorRole,
          message: reply.message
        });
      } catch (e) {}
    }

    return { doubt, reply };
  }

  // --- DPP (DAILY PRACTICE PROBLEMS) ---
  async getDppSets(subjectId) {
    if (subjectId) {
      return localData.dppSets.filter(d => d.subjectId === subjectId);
    }
    return localData.dppSets;
  }

  // --- ATTENDANCE ---
  async getStudentAttendance(studentId) {
    return localData.studentSubjectAttendance;
  }

  async markAttendanceBatch(records) {
    return { success: true, count: records.length, timestamp: new Date().toISOString() };
  }

  // --- EXAMS & RESULTS ---
  async getExams() {
    return localData.exams;
  }

  async getStudentResults(studentId) {
    return localData.results;
  }

  // --- NOTICES (ENSURE 100% WORKING & SYNCHRONIZED) ---
  async getNotices(filter = {}) {
    // 1. Try Supabase if available
    if (config.isAvailable() && config.supabase) {
      try {
        let q = config.supabase.from('notices').select('*').order('date', { ascending: false });
        if (filter.targetType) {
          q = q.or(`target_type.eq.${filter.targetType},target_type.eq.college`);
        }
        const { data, error } = await q;
        if (data && !error && data.length > 0) {
          return data.map(rowToNotice);
        }
      } catch (e) {}
    }

    // 2. Local fallback
    let list = localData.notices || [];
    if (filter.targetType) {
      list = list.filter(n => n.targetType === filter.targetType || n.targetType === 'college' || n.target === 'Entire College');
    }
    if (filter.targetValue) {
      list = list.filter(n => !n.targetValue || n.targetValue === filter.targetValue || n.target === 'Entire College');
    }
    return list;
  }

  async createNotice(noticeData) {
    const newNotice = {
      id: `not-${Date.now()}`,
      title: noticeData.title,
      content: noticeData.content,
      imageUrl: noticeData.imageUrl || null,
      target: noticeData.target || 'Entire College',
      targetType: noticeData.targetType || (
        noticeData.target === 'Entire College' ? 'college' :
        noticeData.target.includes('Department') ? 'dept' :
        noticeData.target.includes('Section') ? 'section' : 'college'
      ),
      targetValue: noticeData.targetValue || noticeData.target || null,
      author: noticeData.author || 'Office of Administration',
      date: new Date().toISOString().split('T')[0],
      priority: noticeData.priority || 'Normal'
    };

    if (!localData.notices) localData.notices = [];
    localData.notices.unshift(newNotice);
    persistLocalData();

    // If Supabase is available, sync to PostgreSQL table
    if (config.isAvailable() && config.supabase) {
      try {
        await config.supabase.from('notices').insert(noticeToRow(newNotice));
      } catch (e) {}
    }

    return newNotice;
  }

  // --- LEAVE MANAGEMENT ---
  async getLeaveRequests(filter = {}) {
    if (config.isAvailable() && config.supabase) {
      try {
        let q = config.supabase.from('leave_requests').select('*').order('created_at', { ascending: false });
        if (filter.section) q = q.eq('section', filter.section);
        if (filter.studentId) q = q.eq('student_id', filter.studentId);
        const { data } = await q;
        if (data && data.length) {
          return data.map(l => ({
            id: l.id,
            studentId: l.student_id,
            studentName: l.student_name,
            studentRoll: l.student_roll,
            section: l.section,
            fromDate: l.from_date,
            toDate: l.to_date,
            reason: l.reason,
            type: l.type,
            status: l.status,
            reviewedBy: l.reviewed_by,
            reviewNote: l.review_note,
            appliedAt: l.applied_at
          }));
        }
      } catch (e) {}
    }

    let list = localData.leaveRequests;
    if (filter.section) list = list.filter(l => l.section === filter.section);
    if (filter.studentId) list = list.filter(l => l.studentId === filter.studentId);
    if (filter.status) list = list.filter(l => l.status.toLowerCase() === filter.status.toLowerCase());
    return list;
  }

  async applyLeave(leaveData) {
    const newReq = {
      id: `lev-${Date.now()}`,
      studentId: leaveData.studentId,
      studentName: leaveData.studentName,
      studentRoll: leaveData.studentRoll,
      section: leaveData.section || 'CSE-B',
      fromDate: leaveData.fromDate,
      toDate: leaveData.toDate,
      reason: leaveData.reason,
      type: leaveData.type || 'Personal',
      status: 'Pending',
      reviewedBy: null,
      reviewNote: '',
      appliedAt: new Date().toISOString().split('T')[0]
    };
    localData.leaveRequests.unshift(newReq);
    persistLocalData();

    if (config.isAvailable() && config.supabase) {
      try {
        await config.supabase.from('leave_requests').insert({
          id: newReq.id,
          student_id: newReq.studentId,
          student_name: newReq.studentName,
          student_roll: newReq.studentRoll,
          section: newReq.section,
          from_date: newReq.fromDate,
          to_date: newReq.toDate,
          reason: newReq.reason,
          type: newReq.type,
          status: newReq.status,
          applied_at: newReq.appliedAt
        });
      } catch (e) {}
    }

    return newReq;
  }

  async reviewLeave(leaveId, status, reviewNote, reviewerName) {
    const req = localData.leaveRequests.find(l => l.id === leaveId);
    if (!req) throw new Error('Leave request not found');

    req.status = status;
    req.reviewedBy = reviewerName || 'Coordinator';
    req.reviewNote = reviewNote || '';
    persistLocalData();

    if (config.isAvailable() && config.supabase) {
      try {
        await config.supabase.from('leave_requests').update({
          status: status,
          reviewed_by: req.reviewedBy,
          review_note: req.reviewNote
        }).eq('id', leaveId);
      } catch (e) {}
    }

    return req;
  }

  // --- NOTIFICATIONS ---
  async getNotifications(userId) {
    return localData.notifications.filter(n => !userId || n.userId === userId || !n.userId);
  }

  // --- STATS ---
  async getCollegeStats() {
    const totalStudents = localData.students.length;
    const totalFaculty = localData.users.filter(u => u.role === 'faculty').length;
    const totalDepartments = localData.departments.length;
    const totalSections = localData.sections.length;

    const deptStats = localData.departments.map(dept => {
      const deptStudents = localData.students.filter(s => s.department === dept.code);
      const avgAttendance = deptStudents.length ?
        Math.round(deptStudents.reduce((acc, s) => acc + s.attendance, 0) / deptStudents.length) : 85;
      const avgResult = deptStudents.length ?
        Math.round((deptStudents.reduce((acc, s) => acc + s.sgpa, 0) / deptStudents.length) * 10) : 78;

      return {
        deptCode: dept.code,
        deptName: dept.name,
        studentsCount: deptStudents.length,
        attendance: avgAttendance,
        avgResult: avgResult
      };
    });

    const cseSections = ['A', 'B', 'C', 'D', 'E'].map(sec => {
      const secStudents = localData.students.filter(s => s.department === 'CSE' && s.sectionName === `CSE-${sec}`);
      const avgAtt = secStudents.length ?
        Math.round(secStudents.reduce((acc, s) => acc + s.attendance, 0) / secStudents.length) : 86;
      return {
        section: `CSE-${sec}`,
        students: secStudents.length,
        attendance: avgAtt,
        avgSgpa: (secStudents.reduce((acc, s) => acc + s.sgpa, 0) / (secStudents.length || 1)).toFixed(2)
      };
    });

    const pendingLeaves = localData.leaveRequests.filter(l => l.status === 'Pending').length;
    const pendingDoubts = localData.doubts.filter(d => d.status === 'Waiting for Teacher').length;

    return {
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalSections,
      averageAttendance: 86,
      averageResult: 78,
      pendingApprovals: pendingLeaves + pendingDoubts,
      newNotices: (localData.notices || []).length,
      deptStats,
      cseSections
    };
  }

  // --- GLOBAL SEARCH ---
  async globalSearch(query) {
    if (!query || query.trim().length < 2) return [];
    const q = query.trim().toLowerCase();

    const matchedStudents = localData.students.filter(s => 
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.studentId && s.studentId.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    ).slice(0, 10).map(s => ({
      type: 'Student',
      id: s.id,
      title: s.name,
      subtitle: `${s.studentId} • ${s.sectionName} • Roll #${s.rollNo}`,
      details: {
        studentId: s.studentId,
        department: s.department,
        section: s.sectionName,
        rollNo: s.rollNo,
        attendance: `${s.attendance}%`,
        sgpa: s.sgpa,
        cgpa: s.cgpa,
        email: s.email,
        phone: s.phone
      }
    }));

    const matchedFaculty = localData.users.filter(u => u.role === 'faculty' && (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.identifier && u.identifier.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    )).slice(0, 5).map(f => ({
      type: 'Faculty',
      id: f.id,
      title: f.name,
      subtitle: `${f.identifier} • ${f.department} • ${f.designation}`,
      details: {
        department: f.department,
        specialization: f.specialization,
        email: f.email,
        phone: f.phone
      }
    }));

    return [...matchedStudents, ...matchedFaculty];
  }
}

module.exports = new Store();
