# Supabase Source of Truth

This build changes the data layer to Supabase-first. The frontend/API contract is kept intact. When Supabase is reachable, CRUD/read operations use the normalized Supabase tables; the old local JSON is only an offline/dev fallback.

## Before deployment
1. Run `supabase/03_supabase_source_of_truth.sql` in the Supabase SQL Editor.
2. Keep your existing `.env` locally with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or the publishable/anon key where appropriate). Do not commit or share the real `.env`.
3. The normalized schema uses `profiles`/`auth.users`, not the legacy `users` table.
4. Existing UI files were not redesigned.

## Important
The SQL migration is included but is intentionally not auto-executed from this ZIP. This prevents an accidental production schema change.

## Data coverage
- Authentication/profile lookup
- Departments/sections/students/faculty
- Subjects/timetable
- Notes/assignments/submissions
- Doubts/replies
- DPP sets/questions
- Attendance
- Exams/marks/results
- Notices (including image URL column)
- Leaves
- Notifications
- Dashboard statistics
- Global search
