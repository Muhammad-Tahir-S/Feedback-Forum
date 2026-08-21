import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessageSquare, Pin, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Muted, P } from '@/components/ui/typography';
import { useAuth } from '@/contexts/AuthContext';
import useGetBoardItems from '@/hooks/useGetBoardItems';
import { isPostId, parsePostsPath } from '@/lib/postsPath';
import { queryKeys } from '@/lib/queryClient';
import { sanitizeHtml, toPlainText } from '@/lib/sanitizeHtml';
import supabase from '@/lib/supabase';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  BUG_SOURCE_LABELS,
  formatStoredLabel,
  INTEGRATION_LABELS,
  MODULE_LABELS,
  STATUS_LABELS,
  STATUS_STYLES,
} from '@/posts/postDisplay';
import { fetchCommentsForPost, fetchPostById } from '@/posts/postQueries';

export default function PostDialog() {
  const location = useLocation();
  const navigate = useNavigate();
  const { postId: routePostId } = useParams<{ postId: string }>();
  const { boardPath, postId: parsedPostId } = parsePostsPath(location.pathname);

  const postId = routePostId ?? parsedPostId;

  if (!postId || !isPostId(postId)) {
    return null;
  }

  const close = () => {
    navigate({ pathname: boardPath, search: location.search });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden" aria-describedby={undefined}>
        <PostDialogBody postId={postId} onClose={close} />
      </DialogContent>
    </Dialog>
  );
}

function PostDialogBody({ postId, onClose }: { postId: string; onClose: VoidFunction }) {
  const { user } = useAuth();
  const { boards } = useGetBoardItems();
  const queryClient = useQueryClient();
  const [commentDraft, setCommentDraft] = useState('');

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: () => fetchPostById(postId),
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: () => fetchCommentsForPost(postId),
    enabled: Boolean(post),
  });

  const postBoard = boards.find((board) => board.id === post?.board);

  const { mutateAsync: toggleVote, isPending: isVoting } = useMutation({
    mutationFn: async ({ remove }: { remove: boolean }) => {
      if (!user?.id) {
        throw new Error('Sign in to vote');
      }

      if (remove) {
        const { error: voteError } = await supabase.from('votes').delete().eq('post_id', postId).eq('user_id', user.id);
        if (voteError) throw voteError;
        return;
      }

      const { error: voteError } = await supabase.from('votes').insert({ post_id: postId });
      if (voteError) throw voteError;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.posts }),
      ]);
    },
    onError: (voteError) => {
      toast.error('Could not update vote', {
        description: voteError.message || 'Unknown error occurred',
      });
    },
  });

  const { mutateAsync: addComment, isPending: isSubmittingComment } = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) {
        throw new Error('Sign in to comment');
      }

      const { error: commentError } = await supabase.from('comments').insert({
        post_id: postId,
        content,
        user_id: user.id,
      });

      if (commentError) throw commentError;
    },
    onSuccess: async () => {
      setCommentDraft('');
      await queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
    onError: (commentError) => {
      toast.error('Could not add comment', {
        description: commentError.message || 'Unknown error occurred',
      });
    },
  });

  const {
    mutateAsync: deleteComment,
    isPending: isDeletingComment,
    variables: deletingCommentId,
  } = useMutation({
    mutationFn: async (commentId: string) => {
      const { error: deleteError } = await supabase.from('comments').delete().eq('id', commentId);
      if (deleteError) throw deleteError;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
    onError: (deleteError) => {
      toast.error('Could not delete comment', {
        description: deleteError.message || 'Unknown error occurred',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center px-6 py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="px-6 py-8 text-center">
        <P className="text-sm text-red-500/80">{error?.message || 'Could not load this post.'}</P>
        <Button className="mt-4" size="sm" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  const isUpvoted = Boolean(user?.id && post.has_voted);
  const authorName = post.user?.username || post.user?.email || 'Unknown user';
  const metadataItems = [
    post.module ? { label: 'Module', value: formatStoredLabel(post.module, MODULE_LABELS) } : null,
    post.integrations?.length
      ? {
          label: 'Integrations',
          value: post.integrations.map((item) => formatStoredLabel(item, INTEGRATION_LABELS)).join(', '),
        }
      : null,
    post.bug_sources?.length
      ? {
          label: 'Affected areas',
          value: post.bug_sources.map((item) => formatStoredLabel(item, BUG_SOURCE_LABELS)).join(', '),
        }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <DialogHeader className="px-5 pt-5 pb-3 border-b border-accent/60 shrink-0">
        <DialogTitle className="pr-8 text-left text-xl leading-snug">{post.title}</DialogTitle>
      </DialogHeader>

      <div className="flex max-h-[75vh] flex-col">
        <div className="overflow-y-auto custom-scrollbar px-5 py-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('px-2 py-0.5 text-xs font-medium rounded-md border', STATUS_STYLES[post.status])}>
                {STATUS_LABELS[post.status]}
              </span>

              {post.is_pinned ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <Pin className="size-3" />
                  Pinned
                </span>
              ) : null}

              {postBoard ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border border-border/70 bg-secondary text-muted-foreground">
                  {postBoard.icon ? <span className="leading-none">{postBoard.icon}</span> : null}
                  {postBoard.label}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              aria-label={`${post.votes_count} upvotes. ${isUpvoted ? 'You upvoted this' : 'Click to upvote'}`}
              disabled={isVoting || !user?.id}
              onClick={() => toggleVote({ remove: isUpvoted })}
              className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-accent/10 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className={cn('size-4 transition-transform', isUpvoted ? 'text-primary' : 'text-muted-foreground')}
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{post.votes_count ?? 0}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <Avatar className="size-8">
              <AvatarImage src={post.user?.avatar_url} alt={authorName} />
              <AvatarFallback>{authorName.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{authorName}</p>
              <Muted className="text-xs capitalize">{formatRelativeTime(post.created_at)}</Muted>
            </div>
          </div>

          {post.description ? (
            <div
              className="post-description text-[15px] leading-relaxed text-foreground/90 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.description) }}
            />
          ) : (
            <Muted className="text-sm italic">No description provided.</Muted>
          )}

          {metadataItems.length ? (
            <div className="rounded-md border border-accent/60 bg-secondary/40 p-3 space-y-2">
              {metadataItems.map((item) => (
                <div key={item.label} className="text-sm">
                  <span className="font-medium text-foreground">{item.label}: </span>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <Separator className="bg-accent/60 shrink-0" />

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center gap-2 px-5 py-3">
            <MessageSquare className="size-4 text-muted-foreground" />
            <P className="text-sm font-semibold text-foreground">{`Comments (${comments.length})`}</P>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar px-5 pb-3">
            {commentsLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length ? (
              <div className="space-y-3">
                {comments.map((comment) => {
                  const commentAuthor = comment.user?.username || comment.user?.email || 'Unknown user';
                  const canDelete = user?.id === comment.user_id;
                  const isDeleting = isDeletingComment && deletingCommentId === comment.id;

                  return (
                    <div key={comment.id} className="rounded-md border border-accent/50 bg-secondary/30 px-3 py-3">
                      <div className="flex items-start gap-2.5">
                        <Avatar className="size-7 mt-0.5 shrink-0">
                          <AvatarImage src={comment.user?.avatar_url} alt={commentAuthor} />
                          <AvatarFallback>{commentAuthor.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-sm font-medium text-foreground">{commentAuthor}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {formatRelativeTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap break-words">
                            {toPlainText(comment.content ?? '')}
                          </p>
                        </div>
                        {canDelete ? (
                          <button
                            type="button"
                            aria-label="Delete comment"
                            disabled={isDeleting}
                            onClick={() => deleteComment(comment.id)}
                            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 self-center cursor-pointer"
                          >
                            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Muted className="text-sm">No comments yet. Be the first to reply.</Muted>
            )}
          </div>

          <div className="shrink-0 border-t border-accent/60 px-5 py-3 space-y-3 bg-card/40">
            <Textarea
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder="Write a comment..."
              className="min-h-[88px] bg-transparent border-border/70"
              disabled={!user?.id || isSubmittingComment}
              autoFocus
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!user?.id || isSubmittingComment || commentDraft.trim().length === 0}
                onClick={() => addComment(commentDraft.trim())}
              >
                {isSubmittingComment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Add comment'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
