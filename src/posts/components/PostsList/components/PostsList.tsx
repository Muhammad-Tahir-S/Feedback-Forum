import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import useGetBoardId from '@/hooks/useGetBoardId';
import supabase from '@/lib/supabase';
import { PostWithUser } from '@/posts/types';

import EmptyState from '../../EmptyState';
import { PostCard } from './PostCard';

const formatDateWithoutTimezone = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export default function PostsList() {
  const { boardId } = useGetBoardId();
  const [searchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy') || 'comments_count';
  const searchQuery = searchParams.get('search') || '';

  const filters = Array.from(searchParams.entries()).reduce(
    (acc, [key, value]) => {
      if (!['sortBy', 'search'].includes(key)) {
        acc[key] = acc[key] ? [...acc[key], value] : [value];
      }
      return acc;
    },
    {} as Record<string, string[]>
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['posts', boardId, sortBy, searchQuery, filters],
    queryFn: async () => {
      let query = boardId
        ? supabase.from('posts_with_users').select('*').eq('board', boardId)
        : supabase.from('posts_with_users').select('*');

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      Object.entries(filters).forEach(([key, values]) => {
        values.forEach((value) => {
          const [operator, actualValue] =
            value.startsWith('not:') ||
            value.startsWith('on:') ||
            value.startsWith('after:') ||
            value.startsWith('on_or_after:') ||
            value.startsWith('before:') ||
            value.startsWith('on_or_before:')
              ? [value.split(':')[0], value.slice(value.indexOf(':') + 1)]
              : ['on', value];

          if (key === 'created_at') {
            console.log({ key, value, operator });
            const formattedValue = formatDateWithoutTimezone(new Date(value));
            switch (operator) {
              case 'on':
                query = query.eq(key, formattedValue);
                break;
              case 'not':
                query = query.neq(key, formattedValue);
                break;
              case 'after':
                query = query.gt(key, formattedValue);
                break;
              case 'on_or_after':
                query = query.gte(key, formattedValue);
                break;
              case 'before':
                query = query.lt(key, formattedValue);
                break;
              case 'on_or_before':
                query = query.lte(key, formattedValue);
                break;
            }
          } else {
            // Handle other filters
            if (operator === 'not') {
              query = query.not(key, 'in', `(${actualValue})`); // Properly format `not.in` with parentheses
            } else {
              query = query.in(key, [actualValue]);
            }
          }
        });
        // const isNotValues = values.filter((v) => v.startsWith('not:')).map((v) => v.replace('not:', ''));
        // const isValues = values.filter((v) => !v.startsWith('not:'));

        // if (key === 'custom_field') {
        //   return;
        // }
        // if (isValues.length > 0) {
        //   query = query.in(key, isValues);
        // }
        // if (isNotValues.length > 0) {
        //   query = query.not(key, 'in', `(${isNotValues.join(',')})`);
        // }
      });

      query = query.order('is_pinned', { ascending: false, nullsFirst: false });

      if (sortBy === 'comments_count') {
        query = query
          .order('comments_count', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });
      } else {
        query = query.order(sortBy, { ascending: false, nullsFirst: false });
      }
      const res = await query;
      return res?.data as PostWithUser[];
    },
  });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : data?.length ? (
        <div className="mt-4 overflow-hidden border-x rounded-lg bg-secondary/80 border-y border-primary/30">
          <div className="w-full divide-y divide-primary/30">
            {data?.map((post) => <PostCard key={post.id} {...post} refetch={refetch} />)}
          </div>
        </div>
      ) : (
        <EmptyState />
      )}

      <div className="mt-16"></div>
    </>
  );
}

function Loader() {
  return (
    <div className="mt-16">
      <div>
        <div className="flex items-center justify-center mt-4 pb-7">
          <div className="w-6 h-6 secondary-svg">
            <svg
              className="inherit-width inherit-height animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid"
              style={{ maxHeight: '28px', maxWidth: '28px' }}
            >
              <circle
                cx="50"
                cy="50"
                r="32"
                strokeWidth="8"
                stroke="currentColor"
                strokeDasharray="50.26548245743669 50.26548245743669"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
