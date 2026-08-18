import supabase from '@/lib/supabase';
import { PostWithUser } from '@/posts/types';

export const PAGE_SIZE = 20;

export const POST_LIST_COLUMNS =
  'id, created_at, title, board, status, is_pinned, comments_count, votes_count, has_voted, user' as const;

export const SORTABLE_COLUMNS = ['comments_count', 'votes_count', 'created_at'] as const;
export type SortableColumn = (typeof SORTABLE_COLUMNS)[number];

export const FILTERABLE_COLUMNS = [
  'board',
  'status',
  'created_at',
  'module',
  'integrations',
  'bug_sources',
] as const;
export type FilterableColumn = (typeof FILTERABLE_COLUMNS)[number];

const RESERVED_PARAMS = new Set(['sortBy', 'search', 'cursor']);
const DATE_OPERATORS = new Set(['on', 'not', 'after', 'on_or_after', 'before', 'on_or_before']);
const STATUSES = new Set(['pending', 'planned', 'in_progress', 'completed', 'rejected', 'closed']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PostListCursor = {
  s: string | number;
  c: string;
  i: string;
};

function isSortableColumn(value: string): value is SortableColumn {
  return (SORTABLE_COLUMNS as readonly string[]).includes(value);
}

function isFilterableColumn(value: string): value is FilterableColumn {
  return (FILTERABLE_COLUMNS as readonly string[]).includes(value);
}

export function parseSortBy(value: string | null): SortableColumn {
  return value && isSortableColumn(value) ? value : 'comments_count';
}

function parseCursor(raw: string | null): PostListCursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(atob(raw)) as PostListCursor;
    if (!parsed?.i || !parsed?.c || parsed.s === undefined || parsed.s === null) return null;
    if (!UUID_RE.test(parsed.i)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function encodeCursor(cursor: PostListCursor): string {
  return btoa(JSON.stringify(cursor));
}

function quote(value: string | number) {
  const raw = String(value).replace(/"/g, '');
  if (/^-?\d+(\.\d+)?$/.test(raw)) return raw;
  return `"${raw}"`;
}

function startOfDayIso(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0).toISOString();
}

function endOfDayIso(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0).toISOString();
}

function splitOperator(value: string) {
  const prefix = value.split(':')[0];
  if (DATE_OPERATORS.has(prefix) || prefix === 'not') {
    return { operator: prefix, actualValue: value.slice(value.indexOf(':') + 1) };
  }
  return { operator: '', actualValue: value };
}

function sanitizeFilterValues(column: FilterableColumn, values: string[]) {
  return values.filter((value) => {
    if (column === 'board') return UUID_RE.test(value);
    if (column === 'status') return STATUSES.has(value);
    return value.length > 0 && value.length <= 200;
  });
}

export function collectFilters(searchParams: URLSearchParams) {
  const filters: Partial<Record<FilterableColumn, string[]>> = {};

  for (const [key, value] of searchParams.entries()) {
    if (RESERVED_PARAMS.has(key) || !isFilterableColumn(key)) continue;
    filters[key] = filters[key] ? [...filters[key]!, value] : [value];
  }

  return filters;
}

export async function fetchPostPage({
  boardId,
  searchParams,
  cursor: cursorParam,
}: {
  boardId?: string;
  searchParams: URLSearchParams;
  cursor?: string | null;
}) {
  const sortBy = parseSortBy(searchParams.get('sortBy'));
  const searchQuery = searchParams.get('search')?.trim() ?? '';
  const filters = collectFilters(searchParams);
  const cursor = parseCursor(cursorParam ?? null);

  let query = supabase.from('posts_with_users').select(POST_LIST_COLUMNS);

  if (boardId && UUID_RE.test(boardId)) {
    query = query.eq('board', boardId);
  }

  if (searchQuery) {
    const safeSearch = searchQuery.replace(/[%_,]/g, ' ').slice(0, 200);
    query = query.ilike('title', `%${safeSearch}%`);
  }

  for (const [column, values] of Object.entries(filters) as [FilterableColumn, string[]][]) {
    if (column === 'created_at') {
      const { operator, actualValue } = splitOperator(values[0]);
      const startOfDay = startOfDayIso(actualValue);
      const endOfDay = endOfDayIso(actualValue);
      if (!startOfDay || !endOfDay) continue;

      switch (operator || 'on') {
        case 'on':
          query = query.gte('created_at', startOfDay).lt('created_at', endOfDay);
          break;
        case 'not':
          query = query.or(`created_at.lt.${quote(startOfDay)},created_at.gte.${quote(endOfDay)}`);
          break;
        case 'after':
          query = query.gte('created_at', endOfDay);
          break;
        case 'on_or_after':
          query = query.gte('created_at', startOfDay);
          break;
        case 'before':
          query = query.lt('created_at', startOfDay);
          break;
        case 'on_or_before':
          query = query.lt('created_at', endOfDay);
          break;
      }
      continue;
    }

    const notValues = sanitizeFilterValues(
      column,
      values.filter((v) => v.startsWith('not:')).map((v) => v.replace(/^not:/, ''))
    );
    const regularValues = sanitizeFilterValues(
      column,
      values.filter((v) => !v.startsWith('not:')).map((v) => splitOperator(v).actualValue)
    );

    if (column === 'integrations' || column === 'bug_sources') {
      if (regularValues.length > 0) {
        query = query.overlaps(column, regularValues);
      }
      if (notValues.length > 0) {
        query = query.not(column, 'ov', `{${notValues.join(',')}}`);
      }
      continue;
    }

    if (regularValues.length > 0) {
      query = query.in(column, regularValues);
    }
    if (notValues.length > 0) {
      query = query.not(column, 'in', `(${notValues.join(',')})`);
    }
  }

  if (cursor) {
    query = query
      .or('is_pinned.is.null,is_pinned.eq.false')
      .or(
        `${sortBy}.lt.${quote(cursor.s)},and(${sortBy}.eq.${quote(cursor.s)},created_at.lt.${quote(cursor.c)}),and(${sortBy}.eq.${quote(cursor.s)},created_at.eq.${quote(cursor.c)},id.lt.${quote(cursor.i)})`
      );
  }

  const { data, error } = await query
    .order('is_pinned', { ascending: false, nullsFirst: false })
    .order(sortBy, { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (error) throw error;

  const rows = (data ?? []) as PostWithUser[];
  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const last = page[page.length - 1];

  return {
    posts: page,
    nextCursor:
      hasMore && last
        ? encodeCursor({
            s: last[sortBy] ?? '',
            c: last.created_at,
            i: last.id,
          })
        : null,
  };
}
