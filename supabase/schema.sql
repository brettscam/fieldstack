-- FieldStack Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================
-- 1. TABLES
-- ============================================

create table if not exists companies (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid default auth.uid(),
  name text not null,
  industry text,
  address text,
  phone text,
  website text,
  created_at timestamptz default now()
);

create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid default auth.uid(),
  name text not null,
  email text,
  phone text,
  company text,
  role text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists opportunities (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid default auth.uid(),
  name text not null,
  company text,
  contact text,
  value numeric default 0,
  stage text default 'Lead' check (stage in ('Lead', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost')),
  created_date date default current_date,
  expected_close date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists jobs (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid default auth.uid(),
  job_id text not null,
  name text not null,
  site text,
  crew text,
  phase text,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  status text default 'On Track' check (status in ('On Track', 'Delayed', 'At Risk', 'Completed', 'On Hold')),
  value numeric default 0,
  company text,
  contact text,
  start_date date,
  end_date date,
  opportunity_id uuid references opportunities(id),
  created_at timestamptz default now()
);

create table if not exists schedule_phases (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid default auth.uid(),
  job_id uuid references jobs(id) on delete cascade,
  phase_name text not null,
  start_date date,
  end_date date,
  duration integer default 0,
  sort_order integer default 0,
  status text default 'Not Started' check (status in ('Not Started', 'In Progress', 'Completed')),
  created_at timestamptz default now()
);

-- ============================================
-- 2. ROW LEVEL SECURITY (RLS)
-- Each user only sees their own data
-- ============================================

alter table companies enable row level security;
alter table contacts enable row level security;
alter table opportunities enable row level security;
alter table jobs enable row level security;
alter table schedule_phases enable row level security;

-- Companies
create policy "Users see own companies" on companies
  for select using (workspace_id = auth.uid());
create policy "Users insert own companies" on companies
  for insert with check (workspace_id = auth.uid());
create policy "Users update own companies" on companies
  for update using (workspace_id = auth.uid());
create policy "Users delete own companies" on companies
  for delete using (workspace_id = auth.uid());

-- Contacts
create policy "Users see own contacts" on contacts
  for select using (workspace_id = auth.uid());
create policy "Users insert own contacts" on contacts
  for insert with check (workspace_id = auth.uid());
create policy "Users update own contacts" on contacts
  for update using (workspace_id = auth.uid());
create policy "Users delete own contacts" on contacts
  for delete using (workspace_id = auth.uid());

-- Opportunities
create policy "Users see own opportunities" on opportunities
  for select using (workspace_id = auth.uid());
create policy "Users insert own opportunities" on opportunities
  for insert with check (workspace_id = auth.uid());
create policy "Users update own opportunities" on opportunities
  for update using (workspace_id = auth.uid());
create policy "Users delete own opportunities" on opportunities
  for delete using (workspace_id = auth.uid());

-- Jobs
create policy "Users see own jobs" on jobs
  for select using (workspace_id = auth.uid());
create policy "Users insert own jobs" on jobs
  for insert with check (workspace_id = auth.uid());
create policy "Users update own jobs" on jobs
  for update using (workspace_id = auth.uid());
create policy "Users delete own jobs" on jobs
  for delete using (workspace_id = auth.uid());

-- Schedule Phases
create policy "Users see own schedule_phases" on schedule_phases
  for select using (workspace_id = auth.uid());
create policy "Users insert own schedule_phases" on schedule_phases
  for insert with check (workspace_id = auth.uid());
create policy "Users update own schedule_phases" on schedule_phases
  for update using (workspace_id = auth.uid());
create policy "Users delete own schedule_phases" on schedule_phases
  for delete using (workspace_id = auth.uid());

-- ============================================
-- 3. INDEXES for performance
-- ============================================

create index if not exists idx_contacts_workspace on contacts(workspace_id);
create index if not exists idx_companies_workspace on companies(workspace_id);
create index if not exists idx_opportunities_workspace on opportunities(workspace_id);
create index if not exists idx_opportunities_stage on opportunities(workspace_id, stage);
create index if not exists idx_jobs_workspace on jobs(workspace_id);
create index if not exists idx_jobs_status on jobs(workspace_id, status);
create index if not exists idx_schedule_phases_job on schedule_phases(job_id);
create index if not exists idx_schedule_phases_workspace on schedule_phases(workspace_id);
