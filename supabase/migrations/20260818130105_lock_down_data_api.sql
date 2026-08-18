-- Lock down the Data API: RLS, least-privilege grants, invoker views, and a private user preview.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create or replace function private.user_preview (p_user_id uuid)
  returns jsonb
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select jsonb_build_object(
    'id', u.id,
    'username', coalesce(
      u.raw_user_meta_data ->> 'username',
      split_part(u.email, '@', 1)
    ),
    'avatar_url', u.raw_user_meta_data ->> 'avatar_url'
  )
  from auth.users as u
  where u.id = p_user_id
    and (select auth.uid()) is not null
$$;

revoke all on function private.user_preview(uuid) from public;
grant execute on function private.user_preview(uuid) to authenticated, service_role;

drop function if exists public.get_post_user(uuid);

create function public.get_post_user (post_id uuid)
  returns jsonb
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  select private.user_preview(p.user_id)
  from public.posts as p
  where p.id = get_post_user.post_id
$$;

revoke all on function public.get_post_user(uuid) from public, anon;
grant execute on function public.get_post_user(uuid) to authenticated, service_role;

create or replace view public.posts_with_users
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
  p.votes,
  p.votes_count,
  private.user_preview(p.user_id) as "user"
from public.posts as p;

create or replace view public.comments_with_users
  with (security_invoker = true)
as
select
  c.id,
  c.created_at,
  c.post_id,
  c.content,
  c.user_id,
  c.parent_comment_id,
  private.user_preview(c.user_id) as "user"
from public.comments as c;

drop policy if exists "public can read boards" on public.boards;

alter table public.boards enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;

create policy boards_select_authenticated
  on public.boards
  for select
  to authenticated
  using (true);

create policy posts_select_authenticated
  on public.posts
  for select
  to authenticated
  using (true);

create policy posts_insert_own
  on public.posts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Column grants (below) limit this to the votes array until voting is redesigned.
create policy posts_update_authenticated
  on public.posts
  for update
  to authenticated
  using (true)
  with check (true);

create policy comments_select_authenticated
  on public.comments
  for select
  to authenticated
  using (true);

create policy comments_insert_own
  on public.comments
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy comments_update_own
  on public.comments
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy comments_delete_own
  on public.comments
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy votes_select_authenticated
  on public.votes
  for select
  to authenticated
  using (true);

create policy votes_insert_own
  on public.votes
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy votes_delete_own
  on public.votes
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists posts_user_id_idx on public.posts (user_id);
create index if not exists comments_user_id_idx on public.comments (user_id);
create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists votes_user_id_idx on public.votes (user_id);
create index if not exists votes_post_id_idx on public.votes (post_id);

revoke all on table public.boards from anon, authenticated, public;
revoke all on table public.posts from anon, authenticated, public;
revoke all on table public.comments from anon, authenticated, public;
revoke all on table public.votes from anon, authenticated, public;
revoke all on table public.posts_with_users from anon, authenticated, public;
revoke all on table public.comments_with_users from anon, authenticated, public;

grant select on table public.boards to authenticated;
grant select on table public.posts_with_users to authenticated;
grant select on table public.comments_with_users to authenticated;

grant select on table public.posts to authenticated;
grant insert (
  board,
  title,
  description,
  user_id,
  module,
  integrations,
  bug_sources
) on table public.posts to authenticated;
grant update (votes) on table public.posts to authenticated;

grant select, insert, update, delete on table public.comments to authenticated;
grant select, insert, delete on table public.votes to authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke all on functions from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated, service_role;
