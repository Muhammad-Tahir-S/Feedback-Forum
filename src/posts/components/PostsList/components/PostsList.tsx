import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import useGetBoardId from '@/hooks/useGetBoardId';
import supabase from '@/lib/supabase';
import { PostWithUser } from '@/posts/types';

import { PostCard } from './PostCard';

export default function PostsList() {
  const { boardId } = useGetBoardId();
  const [searchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy') || 'comments_count';
  const searchQuery = searchParams.get('search') || '';

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['posts', boardId, sortBy, searchQuery],
    queryFn: async () => {
      let query = boardId
        ? supabase.from('posts_with_users').select('*').eq('board', boardId)
        : supabase.from('posts_with_users').select('*');

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

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
      ) : null}
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
