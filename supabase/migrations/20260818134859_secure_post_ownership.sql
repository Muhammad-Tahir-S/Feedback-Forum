-- Make post ownership database-authoritative: the session user owns new posts,
-- and owners can only change content columns, not identity or moderation fields.

alter table public.posts
  alter column user_id set default auth.uid();

revoke insert on table public.posts from authenticated;
grant insert (
  board,
  title,
  description,
  module,
  integrations,
  bug_sources
) on table public.posts to authenticated;

drop policy if exists posts_update_own on public.posts;

create policy posts_update_own
  on public.posts
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant update (
  title,
  description,
  board,
  module,
  integrations,
  bug_sources
) on table public.posts to authenticated;
