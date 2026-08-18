set local check_function_bodies = off;

alter default privileges for role "postgres" in schema "public" revoke all on sequences from "anon";

alter default privileges for role "postgres" in schema "public" revoke all on sequences from "authenticated";

alter default privileges for role "postgres" in schema "public" revoke all on sequences from "service_role";

alter default privileges for role "postgres" in schema "public" revoke all on tables from "anon";

alter default privileges for role "postgres" in schema "public" revoke all on tables from "authenticated";

alter default privileges for role "postgres" in schema "public" revoke all on tables from "service_role";

create extension "pgjwt" schema "extensions";

create table "public"."boards" (
  "id"    uuid not null default gen_random_uuid(),
  "name"  text default ''::text,
  "value" text not null default ''::text,
  constraint "board_id_key" unique (id),
  constraint "board_pkey" primary key (id)
);

create table "public"."comments" (
  "id"                uuid                     not null default gen_random_uuid(),
  "created_at"        timestamp with time zone not null default now(),
  "post_id"           uuid                     not null default gen_random_uuid(),
  "content"           text                     default ''::text,
  "user_id"           uuid                     not null,
  "parent_comment_id" uuid,
  constraint "comment_id_key" unique (id),
  constraint "comment_pkey" primary key (id)
);

create table "public"."posts" (
  "id"             uuid                     not null default gen_random_uuid(),
  "created_at"     timestamp with time zone not null default now(),
  "title"          text                     default ''::text,
  "description"    text,
  "board"          uuid                     not null,
  "user_id"        uuid                     not null,
  "module"         text,
  "integrations"   text[],
  "bug_sources"    text[],
  "is_pinned"      boolean,
  "comments_count" numeric                  not null default '0'::numeric,
  "votes"          uuid[]                   not null default '{}'::uuid[],
  constraint "post_id_key" unique (id),
  constraint "post_pkey" primary key (id),
  constraint "posts_is_pinned_key" unique (is_pinned)
);

create table "public"."votes" (
  "id"         uuid                     not null default gen_random_uuid(),
  "created_at" timestamp with time zone not null default now(),
  "post_id"    uuid                     not null default gen_random_uuid(),
  "user_id"    uuid                     default gen_random_uuid(),
  constraint "votes_id_key" unique (id),
  constraint "votes_pkey" primary key (id)
);

alter table "public"."votes"
  enable row level security;

alter table "public"."posts"
  add column "votes_count" integer generated always as (array_length(votes, 1)) stored;

create type "public"."status" as enum (
  'pending',
  'planned',
  'in_progress',
  'completed',
  'rejected',
  'closed'
);

alter table "public"."posts"
  add column "status" public.status not null default 'pending'::public.status;

create or replace function public.get_post_user (
  post_id uuid
)
  returns jsonb
  language sql
  AS $function$
  SELECT jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'username', COALESCE(u.raw_user_meta_data->>'username', u.email),
    'avatar_url', u.raw_user_meta_data->>'avatar_url'
  )
  FROM posts p
  JOIN auth.users u ON p.user_id = u.id
  WHERE p.id = post_id
$function$;

alter table "public"."comments"
  add constraint "comments_user_id_fkey" foreign key (user_id) references auth.users(id);

alter table "public"."posts"
  add constraint "post_board_fkey" foreign key (board) references public.boards(id);

alter table "public"."comments"
  add constraint "comments_post_id_fkey" foreign key (post_id) references public.posts(id);

alter table "public"."posts"
  add constraint "posts_user_id_fkey" foreign key (user_id) references auth.users(id);

alter table "public"."votes"
  add constraint "votes_post_id_fkey1" foreign key (post_id) references public.posts(id);

alter table "public"."votes"
  add constraint "votes_user_id_fkey" foreign key (user_id) references auth.users(id);

create view "public"."comments_with_users" AS  SELECT c.id,
    c.created_at,
    c.post_id,
    c.content,
    c.user_id,
    c.parent_comment_id,
    jsonb_build_object('id', u.id, 'email', u.email, 'username', COALESCE((u.raw_user_meta_data ->> 'username'::text), (u.email)::text), 'avatar_url', (u.raw_user_meta_data ->> 'avatar_url'::text)) AS "user"
   FROM (public.comments c
     JOIN auth.users u ON ((c.user_id = u.id)));

create view "public"."posts_with_users" AS  SELECT p.id,
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
    jsonb_build_object('id', u.id, 'email', u.email, 'username', COALESCE((u.raw_user_meta_data ->> 'username'::text), (u.email)::text), 'avatar_url', (u.raw_user_meta_data ->> 'avatar_url'::text)) AS "user"
   FROM (public.posts p
     JOIN auth.users u ON ((p.user_id = u.id)));

create policy "public can read boards" on "public"."boards"
  for select
  to "anon"
  using (true);

comment on extension "pgjwt" is 'JSON Web Token API for Postgresql';

grant execute on function "public"."get_post_user"(uuid) to public, "anon", "authenticated", "postgres", "service_role";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."boards" to "anon", "authenticated", "postgres", "service_role";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."comments" to "anon", "authenticated", "postgres", "service_role";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."posts" to "anon", "authenticated", "postgres", "service_role";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."votes" to "anon", "authenticated", "postgres", "service_role";

grant usage on type "public"."status" to "postgres";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."comments_with_users" to "anon", "authenticated", "postgres", "service_role";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."posts_with_users" to "anon", "authenticated", "postgres", "service_role";

alter default privileges for role "postgres" in schema "public" grant select, update, usage on sequences to "anon";

alter default privileges for role "postgres" in schema "public" grant select, update, usage on sequences to "authenticated";

alter default privileges for role "postgres" in schema "public" grant select, update, usage on sequences to "service_role";

alter default privileges for role "postgres" in schema "public" grant execute on FUNCTIONS to "anon";

alter default privileges for role "postgres" in schema "public" grant execute on FUNCTIONS to "authenticated";

alter default privileges for role "postgres" in schema "public" grant execute on FUNCTIONS to "service_role";

alter default privileges for role "postgres" in schema "public" grant delete, insert, maintain, references, select, trigger, truncate, update on tables to "anon";

alter default privileges for role "postgres" in schema "public" grant delete, insert, maintain, references, select, trigger, truncate, update on tables to "authenticated";

alter default privileges for role "postgres" in schema "public" grant delete, insert, maintain, references, select, trigger, truncate, update on tables to "service_role";

