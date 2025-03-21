import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import Loader from '@/components/Loader';
import { extractFilterOperatorAndValueFromSearchParamValue } from '@/hooks/useCustomSearchParams';
import useGetBoardId from '@/hooks/useGetBoardId';
import useGetFilterOptions, { FilterKey } from '@/hooks/useGetFilterOptions';
import supabase from '@/lib/supabase';
import { PostWithUser } from '@/posts/types';

import EmptyState from '../../EmptyState';
import { PostCard } from './PostCard';

export default function PostsList() {
  const { boardId } = useGetBoardId();
  const [searchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy') || 'comments_count';
  const searchQuery = searchParams.get('search') || '';
  const { options } = useGetFilterOptions();

  const pageSize = 6;

  const filters = Array.from(searchParams.entries()).reduce(
    (acc, [key, value]) => {
      if (!['sortBy', 'search'].includes(key)) {
        const filterKey = key as FilterKey;
        if (filterKey === 'custom_field' && options.custom_field.options?.map((op) => op.value).includes(value)) {
          return acc;
        }
        acc[key] = acc[key] ? [...acc[key], value] : [value];
      }
      return acc;
    },
    {} as Record<string, string[]>
  );

  const fetchPosts = async ({ pageParam = 0 }) => {
    let query = boardId
      ? supabase.from('posts_with_users').select('*').eq('board', boardId)
      : supabase.from('posts_with_users').select('*');

    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    Object.entries(filters).forEach(([key, values]) => {
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
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery({
    queryKey: ['posts', boardId, sortBy, searchQuery, filters],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined;
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
  });

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : data?.pages?.[0]?.length ? (
        <div className="mt-4 overflow-hidden border-x rounded-lg bg-secondary/80 border-y border-primary/30">
          <div className="w-full divide-y divide-primary/30">
            {data.pages.map((page) => page.map((post) => <PostCard key={post.id} {...post} refetch={refetch} />))}
          </div>
        </div>
      ) : (
        <EmptyState />
      )}

      <div ref={observerRef} className="mt-4">
        {isFetchingNextPage && <Loader />}
      </div>

      <div className="mt-16"></div>
    </>
  );
}
