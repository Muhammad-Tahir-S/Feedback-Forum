-- Replace array-based post voting with votes rows, a unique voter constraint, and a count trigger.

delete from public.votes
where user_id is null;

alter table public.votes
  alter column user_id drop default;

alter table public.votes
  alter column user_id set default auth.uid();

alter table public.votes
  alter column user_id set not null;

alter table public.votes
  alter column post_id drop default;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'votes_post_id_user_id_key'
      and conrelid = 'public.votes'::regclass
  ) then
    alter table public.votes
      add constraint votes_post_id_user_id_key unique (post_id, user_id);
  end if;
end $$;

insert into public.votes (post_id, user_id)
select distinct p.id, voter_id
from public.posts as p
cross join lateral unnest(p.votes) as voter_id
where voter_id is not null
on conflict on constraint votes_post_id_user_id_key do nothing;

alter table public.posts
  alter column votes_count drop expression;

update public.posts as p
set votes_count = (
  select count(*)::integer
  from public.votes as v
  where v.post_id = p.id
);

alter table public.posts
  alter column votes_count set default 0;

alter table public.posts
  alter column votes_count set not null;

create or replace function private.sync_votes_count()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  target_post_id uuid;
begin
  target_post_id := coalesce(new.post_id, old.post_id);

  update public.posts as p
  set votes_count = (
    select count(*)::integer
    from public.votes as v
    where v.post_id = target_post_id
  )
  where p.id = target_post_id;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function private.sync_votes_count() from public, anon, authenticated;

drop trigger if exists votes_sync_votes_count on public.votes;

create trigger votes_sync_votes_count
  after insert or delete on public.votes
  for each row
  execute function private.sync_votes_count();

create index if not exists posts_board_idx on public.posts (board);

drop policy if exists posts_update_authenticated on public.posts;

revoke update on table public.posts from authenticated;

revoke insert on table public.votes from authenticated;
grant insert (post_id) on table public.votes to authenticated;

drop view if exists public.posts_with_users;

create view public.posts_with_users
  with (security_invoker = true)
as
select
  p.id,
  p.created_at,
  p.title,
  p.description,
  p.board,
  p.user_id,
  p.status,
  p.module,
  p.integrations,
  p.bug_sources,
  p.is_pinned,
  p.comments_count,
  p.votes_count,
  exists (
    select 1
    from public.votes as v
    where v.post_id = p.id
      and v.user_id = (select auth.uid())
  ) as has_voted,
  private.user_preview(p.user_id) as "user"
from public.posts as p;

grant select on table public.posts_with_users to authenticated, service_role;

alter table public.posts
  drop column votes;
