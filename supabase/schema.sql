-- ============================================================================
-- Supabase Schema for Посвящение 2026
-- ============================================================================
-- 
-- HOW TO APPLY:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
--
-- WHERE TO GET KEYS:
-- 1. Go to Settings → API in your Supabase dashboard
-- 2. Copy "Project URL" → set as VITE_SUPABASE_URL
-- 3. Copy "Publishable key" (anon public) → set as VITE_SUPABASE_ANON_KEY
-- 4. Add these to your .env.local file or hosting environment variables
--
-- NOTE: RLS is disabled for demo purposes. Enable before production!
-- ============================================================================

-- Create users table
create table if not exists public.users (
  id        text primary key,
  role      text not null check (role in ('participant','curator','admin')),
  full_name text not null,
  grp       text,
  points    integer not null default 0
);

-- Enable realtime for this table
alter publication supabase_realtime add table public.users;

-- Disable RLS for demo (enable before production!)
alter table public.users disable row level security;

-- Seed data: Participants (P001-P008)
insert into public.users (id, role, full_name, grp, points) values
  ('P001', 'participant', 'Иванов Иван Иванович', 'ИВТ-201', 300),
  ('P002', 'participant', 'Петрова Мария Сергеевна', 'ИВТ-201', 300),
  ('P003', 'participant', 'Сидоров Алексей Дмитриевич', 'ИВТ-202', 300),
  ('P004', 'participant', 'Козлова Анна Павловна', 'ИВТ-202', 300),
  ('P005', 'participant', 'Морозов Дмитрий Алексеевич', 'ПИ-301', 300),
  ('P006', 'participant', 'Новикова Елена Владимировна', 'ПИ-301', 300),
  ('P007', 'participant', 'Волков Артём Николаевич', 'ПИ-302', 300),
  ('P008', 'participant', 'Соколова Дарья Игоревна', 'ПИ-302', 300)
on conflict (id) do nothing;

-- Seed data: Curators (C001-C002)
insert into public.users (id, role, full_name, grp, points) values
  ('C001', 'curator', 'Смирнова Ольга Викторовна', null, 0),
  ('C002', 'curator', 'Кузнецов Павел Андреевич', null, 0)
on conflict (id) do nothing;

-- Seed data: Admin (A001)
insert into public.users (id, role, full_name, grp, points) values
  ('A001', 'admin', 'Администратор Системы', null, 0)
on conflict (id) do nothing;
