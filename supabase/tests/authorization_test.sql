begin;
create extension if not exists pgtap with schema extensions;

select no_plan();

create temporary table ids (
  alice uuid primary key,
  bob uuid not null,
  board_id uuid not null,
  alice_post uuid,
  bob_post uuid,
  alice_comment uuid
);

insert into ids (alice, bob, board_id)
values (gen_random_uuid(), gen_random_uuid(), gen_random_uuid());

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  alice,
  'authenticated',
  'authenticated',
  'alice-' || alice::text || '@test.local',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"username":"alice","avatar_url":"https://example.test/alice.png"}'::jsonb,
  now(),
  now()
from ids
union all
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  bob,
  'authenticated',
  'authenticated',
  'bob-' || bob::text || '@test.local',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"username":"bob","avatar_url":"https://example.test/bob.png"}'::jsonb,
  now(),
  now()
from ids;

insert into public.boards (id, name, value)
select board_id, 'General', 'general'
from ids;

grant select, update on table ids to anon, authenticated;

-- Anonymous clients have no table, view, or privileged-function access.
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '', true);

select throws_ok(
  $sql$ select * from public.boards $sql$,
  '42501',
  null,
  'anon cannot read boards'
);
select throws_ok(
  $sql$ select * from public.posts $sql$,
  '42501',
  null,
  'anon cannot read posts'
);
select throws_ok(
  $sql$ select * from public.comments $sql$,
  '42501',
  null,
  'anon cannot read comments'
);
select throws_ok(
  $sql$ select * from public.votes $sql$,
  '42501',
  null,
  'anon cannot read votes'
);
select throws_ok(
  $sql$ select * from public.posts_with_users $sql$,
  '42501',
  null,
  'anon cannot read posts_with_users'
);
select throws_ok(
  $sql$ select * from public.comments_with_users $sql$,
  '42501',
  null,
  'anon cannot read comments_with_users'
);
select throws_ok(
  $sql$ select public.get_post_user(gen_random_uuid()) $sql$,
  '42501',
  null,
  'anon cannot execute get_post_user'
);
select throws_ok(
  $sql$ select private.user_preview(gen_random_uuid()) $sql$,
  '42501',
  null,
  'anon cannot execute private.user_preview'
);
select throws_ok(
  $sql$ select private.sync_votes_count() $sql$,
  '42501',
  null,
  'anon cannot execute private.sync_votes_count'
);

reset role;

-- Alice: JWT identity before assuming the authenticated role.
select set_config('request.jwt.claim.sub', (select alice::text from ids), true);
select set_config(
  'request.jwt.claims',
  (select json_build_object('sub', alice, 'role', 'authenticated')::text from ids),
  true
);
set local role authenticated;

select lives_ok(
  $sql$
    insert into public.posts (board, title, description)
    select board_id, 'Alice post', 'from alice'
    from ids
  $sql$,
  'alice can create a post without sending user_id'
);

update ids
set alice_post = (
  select p.id
  from public.posts as p
  join ids on p.user_id = ids.alice
  order by p.created_at desc
  limit 1
);

select results_eq(
  $sql$ select user_id from public.posts where id = (select alice_post from ids) $sql$,
  $sql$ select alice from ids $sql$,
  'new posts are owned by the session user'
);

select throws_ok(
  $sql$
    insert into public.posts (board, title, user_id)
    select board_id, 'Stolen post', bob
    from ids
  $sql$,
  '42501',
  null,
  'alice cannot create a post as bob'
);

select throws_ok(
  $sql$
    update public.posts
    set status = 'closed'
    where id = (select alice_post from ids)
  $sql$,
  '42501',
  null,
  'alice cannot change protected post columns'
);

select throws_ok(
  $sql$
    update public.posts
    set user_id = (select bob from ids)
    where id = (select alice_post from ids)
  $sql$,
  '42501',
  null,
  'alice cannot reassign post ownership'
);

select lives_ok(
  $sql$
    insert into public.comments (post_id, content, user_id)
    select alice_post, 'alice comment', alice
    from ids
  $sql$,
  'alice can comment as herself'
);

update ids
set alice_comment = (
  select c.id
  from public.comments as c
  join ids on c.user_id = ids.alice
  order by c.created_at desc
  limit 1
);

select throws_ok(
  $sql$
    insert into public.comments (post_id, content, user_id)
    select alice_post, 'spoofed comment', bob
    from ids
  $sql$,
  '42501',
  null,
  'alice cannot create a comment as bob'
);

select lives_ok(
  $sql$
    insert into public.votes (post_id)
    select alice_post from ids
  $sql$,
  'alice can vote on her post'
);

select throws_ok(
  $sql$
    insert into public.votes (post_id)
    select alice_post from ids
  $sql$,
  '23505',
  null,
  'duplicate votes fail'
);

select throws_ok(
  $sql$
    insert into public.votes (post_id, user_id)
    select alice_post, bob from ids
  $sql$,
  '42501',
  null,
  'alice cannot insert a vote row for bob'
);

select ok(
  (
    select not (("user") ? 'email')
      and "user" ->> 'username' = 'alice'
    from public.posts_with_users
    where id = (select alice_post from ids)
  ),
  'posts_with_users preview has username and no email'
);

select throws_ok(
  $sql$ select * from auth.users $sql$,
  '42501',
  null,
  'authenticated cannot read auth.users'
);

-- Switch to Bob in the same session.
select set_config('request.jwt.claim.sub', (select bob::text from ids), true);
select set_config(
  'request.jwt.claims',
  (select json_build_object('sub', bob, 'role', 'authenticated')::text from ids),
  true
);

select lives_ok(
  $sql$
    insert into public.posts (board, title, description)
    select board_id, 'Bob post', 'from bob'
    from ids
  $sql$,
  'bob can create his own post'
);

update ids
set bob_post = (
  select p.id
  from public.posts as p
  join ids on p.user_id = ids.bob
  order by p.created_at desc
  limit 1
);

select results_eq(
  $sql$
    with changed as (
      update public.posts
      set title = 'Hacked'
      where id = (select alice_post from ids)
      returning 1
    )
    select count(*)::integer from changed
  $sql$,
  $sql$ select 0 $sql$,
  'bob cannot update alice post content'
);

select results_eq(
  $sql$
    with changed as (
      delete from public.comments
      where id = (select alice_comment from ids)
      returning 1
    )
    select count(*)::integer from changed
  $sql$,
  $sql$ select 0 $sql$,
  'bob cannot delete alice comment'
);

select results_eq(
  $sql$
    with changed as (
      delete from public.votes
      where post_id = (select alice_post from ids)
        and user_id = (select alice from ids)
      returning 1
    )
    select count(*)::integer from changed
  $sql$,
  $sql$ select 0 $sql$,
  'bob cannot remove alice vote'
);

select lives_ok(
  $sql$
    insert into public.votes (post_id)
    select alice_post from ids
  $sql$,
  'bob can add his own vote'
);

select results_eq(
  $sql$
    with changed as (
      delete from public.votes
      where post_id = (select alice_post from ids)
        and user_id = (select bob from ids)
      returning 1
    )
    select count(*)::integer from changed
  $sql$,
  $sql$ select 1 $sql$,
  'bob can remove only his own vote'
);

select ok(
  exists (
    select 1
    from public.votes
    where post_id = (select alice_post from ids)
      and user_id = (select alice from ids)
  ),
  'alice vote remains after bob removes his vote'
);

select ok(
  (
    select "user" ->> 'username' = 'alice'
      and not (("user") ? 'email')
    from public.posts_with_users
    where id = (select alice_post from ids)
  ),
  'bob can see alice public preview without email'
);

select throws_ok(
  $sql$ select private.sync_votes_count() $sql$,
  '42501',
  null,
  'authenticated cannot execute the votes trigger function'
);

reset role;

select results_eq(
  $sql$
    select title
    from public.posts
    where id = (select alice_post from ids)
  $sql$,
  $sql$ values ('Alice post') $sql$,
  'alice post title is unchanged after bob update attempt'
);

select results_eq(
  $sql$
    select votes_count
    from public.posts
    where id = (select alice_post from ids)
  $sql$,
  $sql$ values (1) $sql$,
  'votes_count matches remaining vote rows'
);

select * from finish();
rollback;
