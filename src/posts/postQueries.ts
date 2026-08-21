import { Json } from 'database.types';

import supabase from '@/lib/supabase';
import { PostWithUser } from '@/posts/types';
import { UserType } from '@/types/auth';

const POST_DETAIL_COLUMNS =
  'id, created_at, title, description, board, status, is_pinned, comments_count, votes_count, has_voted, user, module, integrations, bug_sources' as const;

const COMMENT_COLUMNS = 'id, created_at, content, post_id, user, user_id, parent_comment_id' as const;

export type PostDetail = {
  id: string;
  title: string | null;
  description: string | null;
  board: string | null;
  status: PostWithUser['status'];
  created_at: string;
  is_pinned: boolean;
  comments_count: number;
  votes_count: number;
  has_voted: boolean;
  user: UserType | null;
  module: string | null;
  integrations: string[] | null;
  bug_sources: string[] | null;
};

export type CommentWithUser = {
  id: string;
  content: string | null;
  created_at: string;
  post_id: string;
  user_id: string | null;
  parent_comment_id: string | null;
  user: UserType | null;
};

function parseUser(user: Json | null): UserType | null {
  if (!user || typeof user !== 'object' || Array.isArray(user)) {
    return null;
  }

  const record = user as Record<string, unknown>;

  return {
    id: String(record.id ?? ''),
    email: record.email ? String(record.email) : undefined,
    username: record.username ? String(record.username) : undefined,
    avatar_url: record.avatar_url ? String(record.avatar_url) : undefined,
  };
}

function normalizePost(row: Record<string, unknown>): PostDetail {
  return {
    id: String(row.id),
    title: row.title ? String(row.title) : null,
    description: row.description ? String(row.description) : null,
    board: row.board ? String(row.board) : null,
    status: row.status as PostWithUser['status'],
    created_at: String(row.created_at),
    is_pinned: Boolean(row.is_pinned),
    comments_count: Number(row.comments_count ?? 0),
    votes_count: Number(row.votes_count ?? 0),
    has_voted: Boolean(row.has_voted),
    user: parseUser(row.user as Json | null),
    module: row.module ? String(row.module) : null,
    integrations: Array.isArray(row.integrations) ? row.integrations.map(String) : null,
    bug_sources: Array.isArray(row.bug_sources) ? row.bug_sources.map(String) : null,
  };
}

function normalizeComment(row: Record<string, unknown>): CommentWithUser {
  return {
    id: String(row.id),
    content: row.content ? String(row.content) : null,
    created_at: String(row.created_at),
    post_id: String(row.post_id),
    user_id: row.user_id ? String(row.user_id) : null,
    parent_comment_id: row.parent_comment_id ? String(row.parent_comment_id) : null,
    user: parseUser(row.user as Json | null),
  };
}

export async function fetchPostById(postId: string) {
  const { data, error } = await supabase.from('posts_with_users').select(POST_DETAIL_COLUMNS).eq('id', postId).single();

  if (error) {
    throw error;
  }

  return normalizePost(data as Record<string, unknown>);
}

export async function fetchCommentsForPost(postId: string) {
  const { data, error } = await supabase
    .from('comments_with_users')
    .select(COMMENT_COLUMNS)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => normalizeComment(row as Record<string, unknown>));
}
