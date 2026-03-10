
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  name text not null,
  quote_number text,
  status text not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;

create policy "Users manage own projects" on projects
  for all to authenticated
  using (auth.jwt() ->> 'email' = user_email)
  with check (auth.jwt() ->> 'email' = user_email);

create table signs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null default 'New Sign',
  profile_type text,
  spec_data jsonb default '{}',
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table signs enable row level security;

create policy "Users manage own signs" on signs
  for all to authenticated
  using (
    exists (
      select 1 from projects p
      where p.id = signs.project_id
      and p.user_email = auth.jwt() ->> 'email'
    )
  )
  with check (
    exists (
      select 1 from projects p
      where p.id = signs.project_id
      and p.user_email = auth.jwt() ->> 'email'
    )
  );

create or replace function archive_stale_projects()
returns void language sql as $$
  update projects
  set status = 'archived', updated_at = now()
  where status in ('draft', 'quoted')
  and updated_at < now() - interval '30 days';
$$;
