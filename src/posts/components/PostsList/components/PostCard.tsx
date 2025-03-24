import { useMutation } from '@tanstack/react-query';
import { ChevronUpIcon, MessageCircleMoreIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

import PinIcon from '@/assets/icons/pin.svg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import useGetBoardItems from '@/hooks/useGetBoardItems';
import supabase from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { PostWithUser } from '@/posts/types';
import { statusStyles, statusText } from '@/posts/utils/status';

export const PostCard = (post: PostWithUser & { refetch: VoidFunction }) => {
  const {
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
  } = post;
  const { boards } = useGetBoardItems();
  const { user } = useAuth();
  const navigate = useNavigate();

  const postBoard = boards.find((b) => b?.id === board);

  const isUpvoted = user?.id && votes?.includes(user?.id);

  const { mutateAsync, isPending } = useMutation({
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
      <div
        aria-label={`View post ${title}`}
        role="button"
        className="w-full h-full min-w-0 py-4 px-4 pr-3 my-auto overflow-auto rounded-md cursor-pointer sm:px-5 sm:py-5"
        onClick={() => navigate(`/posts/${id}`, { state: JSON.stringify(post) })}
      >
        <div className="relative">
          {is_pinned && (
            <div className="absolute flex items-center p-1 rounded-md -top-4 -right-2">
              <PinIcon className="w-3 h-3 -mt-[3px] mr-0.5 text-primary" />
              <p className="uppercase text-[11px] tracking-wide font-semibold text-muted-foreground">Pinned</p>
            </div>
          )}

          <div className="inline-block mb-2">
            <p
              className={`px-2 py-0.5 flex items-center text-xs font-medium rounded-md border pointer-events-none ${
                statusStyles[status]
              }`}
            >
              {statusText[status]}
            </p>
          </div>

          <p className="text-base font-semibold line-clamp-2 text-foreground">{title}</p>

          <div className="flex flex-wrap items-end justify-between gap-3 pt-3.5">
            <div className="flex items-center mr-2">
              <div className="relative flex items-center justify-center flex-shrink-0 w-5 h-5 rounded-full">
                <div className="relative flex items-center justify-center flex-shrink-0 overflow-hidden rounded-full h-5 w-5">
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

              <p className="text-sm ml-1.5 text-muted-foreground">
                <span className="font-medium">{postUser?.username || postUser?.email}</span>{' '}
                <span className="text-xs font-medium ml-1.5 text-muted-foreground/70 capitalize">
                  {formatRelativeTime(created_at)}
                </span>
              </p>
            </div>

            <div className="flex items-center space-x-2 -mb-[3px]">
              <div className="flex items-center px-2 py-1 text-xs font-medium text-muted-foreground rounded-md">
                <MessageCircleMoreIcon className="w-3.5 h-3.5 mr-1 fill-card-foreground/70 stroke-black" />{' '}
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
      </div>

      {/* Upvote button */}
      <div className="flex">
        <button
          aria-label={`${votes_count} upvotes. ${isUpvoted ? 'You upvoted this' : 'Click to upvote'}`}
          onClick={async () => await mutateAsync({ userId: user?.id || '', postId: id })}
          disabled={isPending}
          className="cursor-pointer group flex flex-shrink-0 flex-col items-center justify-center w-14 sm:w-16 py-2 border-l bg-gradient-to-r from-accent/5 hover:bg-accent/10 border-primary/30 hover:border-primary/50 duration-75 ease-in disabled:cursor-not-allowed disabled:opacity-70"
        >
          <div className="group-hover:text-foreground flex flex-col items-center justify-center pb-1 px-2 rounded-md">
            <ChevronUpIcon
              aria-hidden="true"
              aria-label={isUpvoted ? 'Remove upvote' : 'Upvote'}
              className={`flex-shrink-0 w-6 h-6 group-hover:-translate-y-0.5 cursor-pointer transition-transform ${
                isUpvoted ? 'text-primary' : 'text-muted-foreground'
              }`}
            />

            <p className="text-sm font-semibold text-foreground">{votes?.length}</p>
          </div>
        </button>
      </div>
    </div>
  );
};
