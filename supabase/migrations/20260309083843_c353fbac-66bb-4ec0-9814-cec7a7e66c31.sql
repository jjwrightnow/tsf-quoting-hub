create table spec_options (
  id uuid primary key default gen_random_uuid(),
  profile_type text not null,
  field_name text not null,
  label text not null,
  options jsonb not null default '[]',
  sort_order integer default 0,
  required boolean default false,
  updated_at timestamptz default now(),
  unique(profile_type, field_name)
);

alter table spec_options enable row level security;

create policy "Admin can manage spec_options" on spec_options
  for all
  using ((auth.jwt() ->> 'email') in ('jj@thesignagefactory.co', 'harry@thesignagefactory.co'))
  with check ((auth.jwt() ->> 'email') in ('jj@thesignagefactory.co', 'harry@thesignagefactory.co'));

create policy "Authenticated users can read spec_options" on spec_options
  for select
  using (auth.role() = 'authenticated');