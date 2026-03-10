
create or replace function archive_stale_projects()
returns void language sql
security invoker
set search_path = public
as $$
  update projects
  set status = 'archived', updated_at = now()
  where status in ('draft', 'quoted')
  and updated_at < now() - interval '30 days';
$$;
