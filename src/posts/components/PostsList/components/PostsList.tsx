import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import useGetBoardId from '@/hooks/useGetBoardId';
import { collectFilters, fetchPostPage, parseSortBy } from '@/posts/listQuery';
import { PostWithUser } from '@/posts/types';

import EmptyState from '../../EmptyState';
import { PostCard } from './PostCard';

export default function PostsList() {
  const { boardId } = useGetBoardId();
  const [searchParams] = useSearchParams();
  const sortBy = parseSortBy(searchParams.get('sortBy'));
  const searchQuery = searchParams.get('search') || '';
  const filters = collectFilters(searchParams);

  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['posts', boardId, sortBy, searchQuery, filters],
      queryFn: ({ pageParam }) =>
        fetchPostPage({
          boardId,
          searchParams,
          cursor: pageParam,
        }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="mt-8 text-center">
        <p className="text-sm text-red-500/80">{error.message || 'Could not load posts.'}</p>
        <Button className="mt-3" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!posts.length) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="mt-4 overflow-hidden border-x rounded-lg bg-secondary/80 border-y border-primary/30">
        <div className="w-full divide-y divide-primary/30">
          {posts.map((post: PostWithUser) => (
            <PostCard key={post.id} {...post} refetch={refetch} />
          ))}
        </div>
      </div>

      {hasNextPage ? (
        <div className="flex justify-center mt-6">
          <Button size="sm" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}

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
