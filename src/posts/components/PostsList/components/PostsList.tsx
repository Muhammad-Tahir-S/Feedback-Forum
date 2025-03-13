import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import supabase from '@/lib/supabase';

import { PostCard } from './PostCard';

export default function PostsList({ boardId }: { boardId?: string }) {
  const [searchParams] = useSearchParams();
  const sortBy = searchParams.get('sortBy') || 'comments_count';

  const { data, isLoading } = useQuery({
    queryKey: ['posts', boardId, sortBy],
    queryFn: async () => {
      let query = boardId
        ? supabase.from('posts').select('*').eq('board', boardId)
        : supabase.from('posts').select('*');

      query = query.order('is_pinned', { ascending: false, nullsFirst: false });

      query = query.order(sortBy, { ascending: false });

      const res = await query;
      return res?.data;
    },
  });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : data?.length ? (
        <div className="mt-4 -mx-4 overflow-hidden rounded-none border-x-0 sm:border-x sm:rounded-lg sm:mx-0 bg-secondary/80 border-y border-primary/30">
          <div className="w-full divide-y divide-primary/30">
            {data?.map((post) => <PostCard key={post.id} {...post} />)}
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
