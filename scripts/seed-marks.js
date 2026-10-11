// Copies results/marks from data/seed_data.json into the Supabase `marks` table
// for every student (the seed has one results template). Run AFTER 03_supabase_source_of_truth.sql.
require('dotenv').config();
const config = require('../config/supabase');
const seed = require('../data/seed_data.json');

(async () => {
  if (!config.supabase) { console.error(config.initError()); process.exit(1); }
  const { data: students, error } = await config.supabase.from('students').select('id');
  if (error) throw error;
  const rows = [];
  for (const s of students) {
    const res = (seed.results && seed.results.studentId === s.id) ? seed.results : seed.results;
    for (const m of (res.marks || [])) {
      rows.push({ student_id: s.id, subject_name: m.subject, code: m.code, internal: m.internal, mid_sem: m.midSem, end_sem: m.endSem, total: m.total, grade: m.grade });
    }
  }
  for (let i = 0; i < rows.length; i += 500) {
    const { error: e } = await config.supabase.from('marks').upsert(rows.slice(i, i + 500), { onConflict: 'student_id,code' });
    if (e) throw e;
  }
  console.log(`Seeded ${rows.length} marks rows for ${students.length} students.`);
})().catch(e => { console.error(e.message); process.exit(1); });
