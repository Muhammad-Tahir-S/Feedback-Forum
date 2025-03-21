import { extractFilterOperatorAndValueFromSearchParamValue } from '@/hooks/useCustomSearchParams';
import { FilterKey } from '@/hooks/useGetFilterOptions';
import supabase from '@/lib/supabase';
import { PostWithUser } from '@/posts/types';

export async function useFetchPosts({
  pageParam = 0,
  boardId,
  searchQuery,
  filters,
  sortBy,
  pageSize,
}: {
  pageParam?: number;
  boardId?: string;
  sortBy: string;
  searchQuery?: string;
  filters?: Record<string, string[]>;
  pageSize: number;
}) {
  let query = boardId
    ? supabase.from('posts_with_users').select('*').eq('board', boardId)
    : supabase.from('posts_with_users').select('*');

  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }

  Object.entries(filters || []).forEach(([key, values]) => {
    if (values.length > 1) {
      if (key !== 'created_at') {
        const notValues = values.filter((v) => v.startsWith('is_not:')).map((v) => v.replace('is_not:', ''));
        const regularValues = values.filter((v) => !v.startsWith('is_not:'));
        if (regularValues.length > 0) {
          query = query.in(key, regularValues);
        }

        if (notValues.length > 0) {
          query = query.not(key, 'in', `(${notValues})`);
        }
      }
      return;
    }

    const value = values[0];

    const { operator, actualValue } = extractFilterOperatorAndValueFromSearchParamValue(value, key as FilterKey);

    if (key === 'created_at') {
      const date = new Date(actualValue);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0).toISOString();
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0).toISOString();

      switch (operator) {
        case 'on':
          query = query.gte(key, startOfDay).lt(key, endOfDay);
          break;
        case 'not':
          query = query.or(`created_at.lte.${startOfDay},and(created_at.gt.${endOfDay})`);
          break;
        case 'after':
          query = query.gt(key, endOfDay);
          break;
        case 'on_or_after':
          query = query.gte(key, startOfDay);
          break;
        case 'before':
          query = query.lt(key, startOfDay);
          break;
        case 'on_or_before':
          query = query.lt(key, endOfDay);
          break;
      }
    } else {
      if (operator === 'is_not') {
        query = query.not(key, 'in', `(${actualValue})`);
      } else {
        query = query.in(key, [actualValue]);
      }
    }
  });

  if (pageParam === 0) {
    query = query.order('is_pinned', { ascending: false, nullsFirst: false });
  }

  if (sortBy === 'comments_count') {
    query = query
      .order('comments_count', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
  } else {
    query = query.order(sortBy, { ascending: false, nullsFirst: false });
  }

  query = query.range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

  const res = await query;
  return res?.data as PostWithUser[];
}
