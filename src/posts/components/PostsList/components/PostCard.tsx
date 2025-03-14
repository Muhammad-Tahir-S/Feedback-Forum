import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import useGetBoardItems from '@/hooks/useGetBoardItems';
import supabase from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { PostWithUser } from '@/posts/types';

export const PostCard = ({
  id,
  title,
  status,
  user: postUser,
  votes,
  board,
  created_at,
  is_pinned,
  comments_count,
  votes_count,
  refetch,
}: PostWithUser & { refetch: VoidFunction }) => {
  const { boards } = useGetBoardItems();
  const { user } = useAuth();

  const postBoard = boards.find((b) => b?.id === board);

  const statusStyles: { [k in NonNullable<PostWithUser['status']>]: string } = {
    in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/10',
    planned: 'bg-purple-500/10 text-purple-500 border-purple-500/10',
    completed: 'bg-green-500/10 text-green-500 border-green-500/10',
    pending: 'bg-gray-500/10 text-gray-500 border-gray-500/10',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/10',
    closed: 'bg-blue-500/10 text-blue-500 border-blue-500/10',
  };

  const statusText: { [k in NonNullable<PostWithUser['status']>]: string } = {
    in_progress: 'In Progress',
    planned: 'Planned',
    completed: 'Completed',
    pending: 'Pending',
    rejected: 'Rejected',
    closed: 'Closed',
  };

  const isUpvoted = user?.id && votes?.includes(user?.id);

  const { mutateAsync } = useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      await supabase
        .from('posts')
        .update({ votes: !votes.includes(userId) ? [...votes, userId] : votes.filter((id) => id !== userId) })
        .eq('id', postId);
    },
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <div className="relative flex w-full pr-0 duration-75 ease-in hover:bg-accent/10">
      <Link
        aria-label={`View post ${title}`}
        role="button"
        className="w-full h-full min-w-0 py-4 px-4 pr-3 my-auto overflow-auto rounded-md cursor-pointer sm:px-5 sm:py-5"
        to={`/posts/${id}`}
      >
        <div className="relative">
          {is_pinned && (
            <div className="absolute flex items-center p-1 rounded-md -top-4 -right-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 -mt-[3px] mr-0.5"
                width="44"
                height="44"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--primary)' }}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path
                  d="M15.113 3.21l.094 .083l5.5 5.5a1 1 0 0 1 -1.175 1.59l-3.172 3.171l-1.424 3.797a1 1 0 0 1 -.158 .277l-.07 .08l-1.5 1.5a1 1 0 0 1 -1.32 .082l-.095 -.083l-2.793 -2.792l-3.793 3.792a1 1 0 0 1 -1.497 -1.32l.083 -.094l3.792 -3.793l-2.792 -2.793a1 1 0 0 1 -.083 -1.32l.083 -.094l1.5 -1.5a1 1 0 0 1 .258 -.187l.098 -.042l3.796 -1.425l3.171 -3.17a1 1 0 0 1 1.497 -1.26z"
                  strokeWidth="0"
                  fill="currentColor"
                ></path>
              </svg>
              <p className="uppercase text-[11px] tracking-wide font-semibold text-muted-foreground">Pinned</p>
            </div>
          )}

          {/* Status badge */}
          <div className="inline-block mb-2">
            <p
              className={`px-2 py-0.5 flex items-center text-xs font-medium rounded-md border pointer-events-none ${
                statusStyles[status]
              }`}
            >
              {statusText[status]}
            </p>
          </div>

          {/* Post title */}
          <p className="text-base font-semibold line-clamp-2 text-foreground">{title}</p>

          {/* Author info and metadata */}
          <div className="flex flex-wrap items-end justify-between gap-3 pt-3.5">
            <div className="flex items-center mr-2">
              {/* Avatar */}
              <div className="relative flex items-center justify-center flex-shrink-0 w-5 h-5 rounded-full">
                <div className="relative rounded-full">
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                    }}
                  >
                    <defs>
                      <mask id={`avatar-mask-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
                        <path
                          fill="white"
                          fillRule="evenodd"
                          d="
                            M0,0 
                            h20 
                            v20 
                            h-20 
                            Z
                            M17,3.35
                            m -8,0
                            a 8,8 0 1,0 16,0
                            a 8,8 0 1,0 -16,0
                            Z
                          "
                        ></path>
                      </mask>
                    </defs>
                  </svg>
                  <div className="relative flex items-center justify-center flex-shrink-0 overflow-hidden rounded-full h-5 w-5">
                    <div className="absolute inset-0 bg-secondary/70" style={{ mask: `url(#avatar-mask-${id})` }}></div>
                    {postUser?.avatar_url ? (
                      <img
                        className="object-cover rounded-full h-full w-full z-10"
                        src={postUser?.avatar_url}
                        alt={postUser?.username || postUser?.email}
                        style={{
                          borderRadius: '100%',
                          mask: `url(#avatar-mask-${id})`,
                        }}
                      />
                    ) : (
                      <Avatar>
                        <AvatarImage src={postUser?.avatar_url} alt="user-avatar" />
                        <AvatarFallback>{postUser?.username?.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm ml-1.5 text-muted-foreground">
                <span className="font-medium">{postUser?.username || postUser?.email}</span>{' '}
                <span className="text-xs font-medium ml-1.5 text-muted-foreground/70 capitalize">
                  {formatRelativeTime(created_at)}
                </span>
              </p>
            </div>

            <div className="flex items-center space-x-2 -mb-[3px]">
              <div className="flex items-center px-2 py-1 text-xs font-medium text-muted-foreground rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="w-3.5 h-3.5 mr-1 text-card-foreground/70"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                {comments_count}
              </div>

              <div className="px-2 py-0.5 truncate flex items-center text-muted-foreground text-xs font-medium border-border/70 bg-secondary rounded-md border">
                {postBoard?.icon && (
                  <span className="mr-1 -ml-[2px]">
                    <div role="img" aria-label={`${postBoard?.label} icon`}>
                      <span>{postBoard?.icon}</span>
                    </div>
                  </span>
                )}
                <p className="truncate">{postBoard?.label}</p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Upvote button */}
      <div className="flex">
        <button
          aria-label={`${votes_count} upvotes. ${isUpvoted ? 'You upvoted this' : 'Click to upvote'}`}
          onClick={async () => await mutateAsync({ userId: user?.id || '', postId: id })}
          className="cursor-pointer flex flex-shrink-0 flex-col items-center justify-center w-14 sm:w-16 py-2 border-l bg-gradient-to-r from-accent/5 hover:bg-accent/10 border-primary/30 hover:border-primary/50 duration-75 ease-in"
        >
          <div className="group-hover:text-foreground flex flex-col items-center justify-center pb-1 px-2 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              aria-label={isUpvoted ? 'Remove upvote' : 'Upvote'}
              className={`flex-shrink-0 w-6 h-6 hover:-translate-y-0.5 cursor-pointer transition-transform ${
                isUpvoted ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
            <p className="text-sm font-semibold text-foreground">{votes?.length}</p>
          </div>
        </button>
      </div>
    </div>
  );
};
