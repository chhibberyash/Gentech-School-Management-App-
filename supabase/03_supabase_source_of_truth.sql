-- GenTech: Supabase source-of-truth hardening
-- Run this in Supabase SQL Editor before deploying the patched app.
-- The backend uses the service-role key when available; these policies also
-- make the notices table usable with authenticated/anon API access.

alter table public.notices add column if not exists image_url text;
create index if not exists notices_created_at_idx on public.notices(created_at desc);

drop policy if exists "Public read all notices" on public.notices;
create policy "Public read all notices" on public.notices for select to anon, authenticated using (true);

drop policy if exists "Allow insert notices" on public.notices;

drop policy if exists "Allow update notices" on public.notices;

drop policy if exists "Allow delete notices" on public.notices;

-- Attendance upsert needs one row per student/subject/day.
create unique index if not exists attendance_student_subject_date_uidx
on public.attendance(student_id, subject_id, date);

-- Assignment submissions are one submission per student per assignment.
create unique index if not exists assignment_submissions_assignment_student_uidx
on public.assignment_submissions(assignment_id, student_id);

-- ---------------------------------------------------------------------------
-- File uploads (notes, assignments, submissions, doubts, notice images)
-- The server uploads with the service-role key into this public bucket.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('uploads', 'uploads', true, 26214400)
on conflict (id) do update set public = true, file_size_limit = 26214400;

-- ---------------------------------------------------------------------------
-- Security: the Node server uses the service-role key, which bypasses RLS.
-- So the browser-visible anon key must NOT be able to read password hashes
-- or touch attendance. (Tables with RLS on and no policy are service-role only.)
-- ---------------------------------------------------------------------------
alter table public.attendance enable row level security;
alter table public.dpp_sets enable row level security;

drop policy if exists "Public read all users" on public.users;

-- Writes to these tables go through the server only; remove open anon write access.
drop policy if exists "Allow insert doubts" on public.doubts;
drop policy if exists "Allow insert doubt_replies" on public.doubt_replies;
drop policy if exists "Allow insert leave_requests" on public.leave_requests;
drop policy if exists "Allow update leave_requests" on public.leave_requests;
drop policy if exists "Allow insert notes" on public.notes;
drop policy if exists "Allow insert assignments" on public.assignments;
drop policy if exists "Allow insert submissions" on public.assignment_submissions;
drop policy if exists "Allow insert notices" on public.notices;
drop policy if exists "Allow update notices" on public.notices;
drop policy if exists "Allow delete notices" on public.notices;

-- ---------------------------------------------------------------------------
-- Marks / results (previously only in local JSON)
-- ---------------------------------------------------------------------------
create table if not exists public.marks (
  id uuid primary key default gen_random_uuid(),
  student_id varchar(64) not null references public.users(id) on delete cascade,
  subject_name varchar(255) not null,
  code varchar(32),
  internal numeric default 0,
  mid_sem numeric default 0,
  end_sem numeric default 0,
  total numeric,
  grade varchar(8),
  created_at timestamptz default now(),
  unique (student_id, code)
);
alter table public.marks enable row level security;
create index if not exists marks_student_idx on public.marks(student_id);
