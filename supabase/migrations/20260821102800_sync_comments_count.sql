-- Keep posts.comments_count in sync when comments are inserted or deleted.

update public.posts as p
set comments_count = (
  select count(*)::numeric
  from public.comments as c
  where c.post_id = p.id
);

create or replace function private.sync_comments_count()
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
  set comments_count = (
    select count(*)::numeric
    from public.comments as c
    where c.post_id = target_post_id
  )
  where p.id = target_post_id;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function private.sync_comments_count() from public, anon, authenticated;

drop trigger if exists comments_sync_comments_count on public.comments;

create trigger comments_sync_comments_count
  after insert or delete on public.comments
  for each row
  execute function private.sync_comments_count();
