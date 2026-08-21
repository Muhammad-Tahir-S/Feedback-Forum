-- Allow deleting auth.users by cascading dependent forum rows.
-- Without ON DELETE CASCADE, dashboard user deletion fails when the user has votes/posts/comments.

alter table public.votes
  drop constraint votes_user_id_fkey;

alter table public.votes
  add constraint votes_user_id_fkey
  foreign key (user_id) references auth.users (id)
  on delete cascade;

alter table public.posts
  drop constraint posts_user_id_fkey;

alter table public.posts
  add constraint posts_user_id_fkey
  foreign key (user_id) references auth.users (id)
  on delete cascade;

alter table public.comments
  drop constraint comments_user_id_fkey;

alter table public.comments
  add constraint comments_user_id_fkey
  foreign key (user_id) references auth.users (id)
  on delete cascade;

-- When a user's posts are cascade-deleted, also remove votes/comments on those posts.
alter table public.votes
  drop constraint votes_post_id_fkey1;

alter table public.votes
  add constraint votes_post_id_fkey1
  foreign key (post_id) references public.posts (id)
  on delete cascade;

alter table public.comments
  drop constraint comments_post_id_fkey;

alter table public.comments
  add constraint comments_post_id_fkey
  foreign key (post_id) references public.posts (id)
  on delete cascade;
