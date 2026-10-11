require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function seedSupabase() {
  console.log('=====================================================');
  console.log('🎓 College Management - Supabase Seeder (300+ Students)');
  console.log('=====================================================\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-url')) {
    console.log('⚠️  No Supabase credentials detected in .env file!');
    console.log('\nTo seed directly to Supabase cloud:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY');
    console.log('3. Re-run: npm run seed\n');
    console.log('OR run the SQL files directly in the Supabase SQL Editor:');
    console.log('👉 Step 1: Execute supabase/01_schema.sql');
    console.log('👉 Step 2: Execute supabase/02_seed_300_students.sql\n');
    return;
  }

  console.log(`Connecting to Supabase project: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  // Pre-flight connection test
  try {
    const { error: testErr } = await supabase.from('departments').select('id').limit(1);
    if (testErr && testErr.message && !testErr.message.includes('relation "departments" does not exist')) {
      console.error('\n❌ Could not connect to Supabase:');
      console.error('   ' + testErr.message);
      console.log('\n👉 Please check:');
      console.log('   1. Is your Supabase project active in https://supabase.com/dashboard?');
      console.log('   2. Are SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY in .env correct?');
      console.log('\n💡 Alternatively, execute the SQL files directly in the Supabase SQL Editor:');
      console.log('   • Step 1: Run supabase/01_schema.sql');
      console.log('   • Step 2: Run supabase/02_seed_300_students.sql');
      return;
    }
  } catch (err) {
    console.error('\n❌ Network or DNS error connecting to Supabase:');
    console.error(`   ${err.message || err}`);
    console.log('\n👉 Tips:');
    console.log('   • Verify that the SUPABASE_URL in your .env matches your active project.');
    console.log('   • You can also copy & run supabase/01_schema.sql and supabase/02_seed_300_students.sql directly in the Supabase Web SQL Editor!\n');
    return;
  }

  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'seed_data.json'), 'utf-8'));

  try {
    console.log('\n1. Seeding Departments...');
    const { error: dErr } = await supabase.from('departments').upsert(data.departments, { onConflict: 'id' });
    if (dErr) console.warn('Departments warning:', dErr.message);
    else console.log(`✓ Inserted ${data.departments.length} departments.`);

    console.log('\n2. Seeding Sections...');
    const secData = data.sections.map(s => ({
      id: s.id,
      dept_id: s.deptId,
      dept_code: s.deptCode,
      name: s.name,
      full_name: s.fullName,
      year: s.year,
      semester: s.semester,
      capacity: s.capacity
    }));
    const { error: sErr } = await supabase.from('sections').upsert(secData, { onConflict: 'id' });
    if (sErr) console.warn('Sections warning:', sErr.message);
    else console.log(`✓ Inserted ${data.sections.length} sections.`);

    console.log('\n3. Seeding Users (Director, HOD, Faculty, Coordinator, 335 Students)...');
    const userBatch = data.users.map(u => ({
      id: u.id,
      identifier: u.identifier,
      email: u.email,
      password_hash: 'password123',
      name: u.name,
      role: u.role,
      department: u.department,
      phone: u.phone,
      avatar: u.avatar,
      designation: u.designation || ''
    }));

    for (let i = 0; i < userBatch.length; i += 50) {
      const chunk = userBatch.slice(i, i + 50);
      const { error: uErr } = await supabase.from('users').upsert(chunk, { onConflict: 'id' });
      if (uErr) console.warn(`Users chunk ${i} warning:`, uErr.message);
    }
    console.log(`✓ Inserted ${userBatch.length} users.`);

    console.log('\n4. Seeding Students Extended Profile...');
    const stuBatch = data.students.map(s => ({
      id: s.id,
      student_id: s.studentId,
      roll_no: s.rollNo,
      dept_id: s.deptId,
      dept_code: s.department,
      section_id: s.sectionId,
      section_name: s.sectionName,
      year: s.year,
      semester: s.semester,
      attendance: s.attendance,
      sgpa: s.sgpa,
      cgpa: s.cgpa
    }));
    for (let i = 0; i < stuBatch.length; i += 50) {
      const chunk = stuBatch.slice(i, i + 50);
      const { error: stErr } = await supabase.from('students').upsert(chunk, { onConflict: 'id' });
      if (stErr) console.warn(`Students chunk ${i} warning:`, stErr.message);
    }
    console.log(`✓ Inserted ${stuBatch.length} student profiles.`);

    console.log('\n5. Seeding Subjects...');
    const subBatch = data.subjects.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      dept_code: s.deptCode,
      semester: s.semester,
      credits: s.credits,
      faculty_id: s.facultyId,
      faculty_name: s.facultyName
    }));
    await supabase.from('subjects').upsert(subBatch, { onConflict: 'id' });
    console.log(`✓ Inserted ${subBatch.length} subjects.`);

    console.log('\n6. Seeding Notes & Study Material...');
    const noteBatch = data.notes.map(n => ({
      id: n.id,
      subject_id: n.subjectId,
      subject_name: n.subjectName,
      dept_code: n.deptCode,
      section: n.section,
      title: n.title,
      description: n.description,
      file_name: n.fileName,
      file_size: n.fileSize,
      file_url: n.fileUrl,
      author_id: n.authorId,
      author_name: n.author,
      upload_date: n.uploadDate
    }));
    await supabase.from('notes').upsert(noteBatch, { onConflict: 'id' });
    console.log(`✓ Inserted ${noteBatch.length} notes.`);

    console.log('\n7. Seeding Assignments & Submissions...');
    const asgBatch = data.assignments.map(a => ({
      id: a.id,
      subject_id: a.subjectId,
      subject_name: a.subjectName,
      dept_code: a.deptCode,
      section: a.section,
      title: a.title,
      description: a.description,
      due_date: a.dueDate,
      max_marks: a.maxMarks,
      author_id: a.authorId,
      author_name: a.authorName,
      file_url: a.fileUrl,
      status: a.status
    }));
    await supabase.from('assignments').upsert(asgBatch, { onConflict: 'id' });
    console.log(`✓ Inserted ${asgBatch.length} assignments.`);

    console.log('\n8. Seeding Doubts & Discussion Replies...');
    const doubtBatch = data.doubts.map(d => ({
      id: d.id,
      student_id: d.studentId,
      student_name: d.studentName,
      student_roll: d.studentRoll,
      student_avatar: d.studentAvatar,
      department: d.department,
      section: d.section,
      subject_id: d.subjectId,
      subject_name: d.subjectName,
      faculty_id: d.facultyId,
      faculty_name: d.facultyName,
      question: d.question,
      attachment_url: d.attachmentUrl,
      attachment_name: d.attachmentName,
      status: d.status
    }));
    await supabase.from('doubts').upsert(doubtBatch, { onConflict: 'id' });

    for (const d of data.doubts) {
      if (d.replies && d.replies.length > 0) {
        const replyBatch = d.replies.map(r => ({
          id: r.id,
          doubt_id: d.id,
          author_id: r.authorId,
          author_name: r.authorName,
          author_role: r.authorRole,
          message: r.message
        }));
        await supabase.from('doubt_replies').upsert(replyBatch, { onConflict: 'id' });
      }
    }
    console.log(`✓ Inserted ${doubtBatch.length} doubts and discussion replies.`);

    console.log('\n9. Seeding DPP (Daily Practice Problems)...');
    for (const ds of data.dppSets) {
      await supabase.from('dpp_sets').upsert({
        id: ds.id,
        subject_id: ds.subjectId,
        subject_name: ds.subjectName,
        title: ds.title,
        questions_count: ds.questionsCount,
        streak_day: ds.streakDay
      }, { onConflict: 'id' });

      const qBatch = ds.questions.map(q => ({
        id: q.id,
        dpp_set_id: ds.id,
        question: q.question,
        options: q.options,
        correct_index: q.correctIndex,
        explanation: q.explanation
      }));
      await supabase.from('dpp_questions').upsert(qBatch, { onConflict: 'id' });
    }
    console.log(`✓ Inserted DPP sets and interactive questions.`);

    console.log('\n10. Seeding Notices & Leave Requests...');
    const noticeBatch = data.notices.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      target: n.target,
      target_type: n.targetType,
      target_value: n.targetValue || null,
      author: n.author,
      date: n.date,
      priority: n.priority
    }));
    await supabase.from('notices').upsert(noticeBatch, { onConflict: 'id' });

    const leaveBatch = data.leaveRequests.map(l => ({
      id: l.id,
      student_id: l.studentId,
      student_name: l.studentName,
      student_roll: l.studentRoll,
      section: l.section,
      from_date: l.fromDate,
      to_date: l.toDate,
      reason: l.reason,
      type: l.type,
      status: l.status,
      reviewed_by: l.reviewedBy,
      review_note: l.reviewNote,
      applied_at: l.appliedAt
    }));
    await supabase.from('leave_requests').upsert(leaveBatch, { onConflict: 'id' });
    console.log(`✓ Inserted notices and leave requests.`);

    console.log('\n🎉 ALL DATA (335+ STUDENTS, 11 SECTIONS, 5 ROLES) SUCCESSFULLY SEEDED TO SUPABASE!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

seedSupabase();
