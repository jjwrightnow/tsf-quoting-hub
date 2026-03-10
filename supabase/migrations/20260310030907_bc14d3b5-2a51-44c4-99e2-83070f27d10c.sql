create table draft_quotes (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  title text not null default 'New Quote',
  profile_type text,
  spec_data jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table draft_quotes enable row level security;

create policy "Users manage own draft_quotes" on draft_quotes
  for all
  to authenticated
  using (auth.jwt() ->> 'email' = user_email)
  with check (auth.jwt() ->> 'email' = user_email);