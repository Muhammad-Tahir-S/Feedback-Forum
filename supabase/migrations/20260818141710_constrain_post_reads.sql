-- Indexes matching the allowlisted list filters and sorts:
-- equality on board/status, then pinned, then the chosen sort, then created_at/id for stable paging.

create index if not exists posts_list_trending_idx
  on public.posts (
    board,
    is_pinned desc nulls last,
    comments_count desc nulls last,
    created_at desc,
    id desc
  );

create index if not exists posts_list_top_idx
  on public.posts (
    board,
    is_pinned desc nulls last,
    votes_count desc nulls last,
    created_at desc,
    id desc
  );

create index if not exists posts_list_new_idx
  on public.posts (
    board,
    is_pinned desc nulls last,
    created_at desc,
    id desc
  );

create index if not exists posts_board_status_created_idx
  on public.posts (
    board,
    status,
    created_at desc,
    id desc
  );
