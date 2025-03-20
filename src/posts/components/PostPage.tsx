import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronUp, XIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useComponentSize } from 'react-use-size';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { H4, P } from '@/components/ui/typography';
import useGetBoardItems from '@/hooks/useGetBoardItems';
import supabase from '@/lib/supabase';
import { cn, formatRelativeTime } from '@/lib/utils';

import { PostWithUser } from '../types';
import { statusStyles, statusText } from '../utils/status';
import CommentsSection from './Comments';

export default function PostPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const routerPost = JSON.parse(state as string) as PostWithUser | undefined;

  const { data, refetch } = useQuery({
    queryKey: ['getPostById', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts_with_users')
        .select('*')
        .eq('id', id || routerPost?.id || '')
        .single();

      return data as PostWithUser;
    },
  });

  const post = data || routerPost;

  const { title, description } = post || {};

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          navigate(-1);
        }
      }}
      modal={false}
    >
      <DialogContent
        tabIndex={undefined}
        className="relative z-50 w-fullshadow max-w-5xl my-0 2xl:mx-0 mx-0 sm:mx-8 sm:my-10 sm:rounded-lg flex flex-col md:flex-row"
      >
        <DialogTitle className="hidden">{title}</DialogTitle>

        <DialogClose className="m-[18px] md:hidden w-fit bg-sidebar-accent-foreground/50 hover:bg-sidebar-accent-foreground/70 rounded-sm cursor-pointer transition-all duration-300 outline-none">
          <XIcon className="w-6 h-6 text-secondary" />
        </DialogClose>

        <div className="flex-1 min-w-0 p-[18px] md:py-5 md:w-8/12 relative overflow-hidden">
          <H4 className="line-clamp-5 pb-3">{title || ''}</H4>

          <div className="block md:hidden">
            <PostInfo post={post} refetch={refetch} />
          </div>

          <Description description={description || ''} />

          <CommentsSection postId={id || ''} />
        </div>

        <div className="hidden md:block  pb-2 text-sm md:border-l border-accent md:w-4/12 text-foreground relative rounded-tr-lg">
          <PostInfo post={post} refetch={refetch} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PostInfo({ post, refetch }: { post: PostWithUser | undefined; refetch: VoidFunction }) {
  const { status, board, created_at, votes_count, user: postUser, votes, id } = post || {};
  const Label = ({ label }: { label: string }) => <P className="col-span-2 font-medium truncate">{label}</P>;
  const Value = ({ children }: { children: ReactNode }) => <div className="col-span-3">{children}</div>;

  const Row = ({ label, children }: { label: string; children: ReactNode }) => (
    <>
      <Label label={label} />
      <Value>{children}</Value>
    </>
  );

  const isUpvoted = postUser?.id && votes?.includes(postUser?.id);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      await supabase
        .from('posts')
        .update({ votes: votes && !votes.includes(userId) ? [...votes, userId] : votes?.filter((id) => id !== userId) })
        .eq('id', postId);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const { boards } = useGetBoardItems();
  const selectedBoard = boards.find((opt) => opt.id === board);

  return (
    <>
      <div className="grid items-center grid-cols-5 py-3 md:p-4 border-b gap-y-4 border-accent">
        <Row label="Upvoters">
          <button
            className={cn(
              'h-[34px] px-[10px] flex gap-1 whitespace-nowrap rounded-md items-center cursor-pointer border text-[14px] transition-all duration-300 hover:bg-primary/30 border-border  bg-sidebar-accent'
            )}
            disabled={isPending}
            onClick={async () => await mutateAsync({ userId: postUser?.id || '', postId: id || '' })}
          >
            <ChevronUp className={cn('size-4', isUpvoted ? 'text-primary' : 'text-secondary-foreground')} />
            {votes_count || 0}
          </button>
        </Row>
        <Row label="Status">
          <div className="inline-block">
            <p
              className={`px-2 py-0.5 flex items-center text-xs font-medium rounded-md border pointer-events-none ${
                statusStyles[status || 'pending']
              }`}
            >
              {statusText[status || 'pending']}
            </p>
          </div>
        </Row>
        <Row label="Board">
          <button
            className="text-xs h-7 font-medium px-1.5 py-1 rounded-md flex items-center bg-border text-gray-400 transition-all"
            type="button"
          >
            <span className="mr-1 -ml-[2px]">
              <div role="img" aria-label="Featured icon">
                <span className="">{selectedBoard?.icon}</span>
              </div>
            </span>
            {selectedBoard?.label}
          </button>
        </Row>
      </div>
      <div className="grid items-center grid-cols-5 py-3 md:p-4 border-b gap-y-4 border-accent">
        <Row label="Date">
          <Label label={created_at ? formatRelativeTime(created_at) : ''} />
        </Row>
        <Row label="Author">
          <div className="flex gap-2 items-center">
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
            <Label label={postUser?.username || postUser?.email || ''} />
          </div>
        </Row>
      </div>
    </>
  );
}

function Description({ description }: { description: string }) {
  const [showAll, setShowAll] = useState(false);
  const { ref, height } = useComponentSize();

  return (
    <div className="relative">
      <div
        ref={ref}
        className={cn(
          'text-[15px] text-gray-400 h-full overflow-clip flow-root pt-1 break-words whitespace-pre-wrap',
          showAll ? '' : 'max-h-[602px]'
        )}
        dangerouslySetInnerHTML={{ __html: description || '' }}
      ></div>

      {showAll || height < 602 ? null : (
        <button
          tabIndex={-1}
          className="absolute bottom-0 h-20 flex items-end group justify-center backdrop-blur-sm bg-linear-90 from-secondary to-secondary/60 w-full cursor-pointer hover:backdrop-brightness-110 transition-all duration-300"
          onClick={() => setShowAll(true)}
        >
          <p className="mb-1 text-sm font-medium text-gray-500 border-b border-gray-accent group-hover:border-gray-300 group-hover:text-gray-300 transition-all duration-300">
            Continue Reading
          </p>
        </button>
      )}
    </div>
  );
}
