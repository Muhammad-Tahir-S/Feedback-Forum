import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Placeholder from '@tiptap/extension-placeholder';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Reply, SendHorizonal } from 'lucide-react';
import React, { useState } from 'react';

import Loader from '@/components/Loader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';
import { cn, formatRelativeTime } from '@/lib/utils';

import { CommentWithUser } from '../types';

interface Props {
  postId: string;
}

const CommentsSection: React.FC<Props> = ({ postId }) => {
  const queryClient = useQueryClient();
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase.from('comments_with_users').select('*').eq('post_id', postId);

      if (error) throw new Error(error.message);
      return data as CommentWithUser[];
    },
  });

  const { user } = useAuth();

  const { isPending, mutate } = useMutation({
    mutationFn: async (newComment: { content: string; parent_comment_id: string | null }) => {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        content: newComment.content,
        parent_comment_id: newComment.parent_comment_id,
        user_id: user?.id || '',
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setReplyTo(null);
    },
  });

  const newCommentEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing a comment...',
      }),
    ],
    // content: '',
  });

  const replyEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing a comment...',
      }),
    ],
    // content: '',
  });
  const editorContent = newCommentEditor?.getHTML()?.trim();

  const handleSubmit = (editor: Editor | null | undefined, replyTo: string | null) => {
    if (editor) {
      mutate({
        content: editor.getHTML()?.trim(),
        parent_comment_id: replyTo,
      });

      editor.commands.clearContent();
    }
  };

  // const renderComments = ({ comments, parentId = null }: { comments: CommentWithUser[]; parentId: string | null }) => {

  const getCommentDepth = (commentId: string | null, comments: CommentWithUser[]): number => {
    let depth = 0;
    let currentComment = comments.find((comment) => comment.id === commentId);

    while (currentComment?.parent_comment_id) {
      depth++;
      currentComment = comments.find((comment) => comment.id === currentComment?.parent_comment_id);
    }

    return depth;
  };
  const renderComments = ({ comments, parentId = null }: { comments: CommentWithUser[]; parentId: string | null }) => {
    const childComments = comments.filter((comment) => comment.parent_comment_id === parentId);

    if (childComments.length === 0) {
      return null;
    }

    return childComments.map((comment) => {
      const commentDepth = getCommentDepth(comment.id, comments);
      return (
        <div key={comment.id} className="mt-4 relative">
          {parentId === null ? <div className="absolute left-[15px] h-full w-[1px] bg-primary"></div> : null}

          <div className="flex items-start space-x-2">
            {parentId ? (
              <div
                className="absolute mt-[15px] h-[1px] bg-primary"
                style={{
                  width: `${48 * commentDepth}px`,
                  left: `-${32 * commentDepth + (commentDepth > 1 ? commentDepth * 8 : 0)}px`,
                }}
              ></div>
            ) : null}

            {comment?.user?.avatar_url ? (
              <img
                src={comment?.user?.avatar_url || '/default-avatar.png'}
                alt={comment?.user?.username}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <Avatar>
                <AvatarImage src={comment?.user?.avatar_url} alt="user-avatar" />
                <AvatarFallback>{comment?.user?.username?.slice(0, 1)}</AvatarFallback>
              </Avatar>
            )}

            <div className="flex-1 z-10">
              <div className="flex items-end space-x-2  mt-1.5">
                <span className="font-semibold text-sm text-white">
                  {comment?.user?.username || comment?.user?.email}
                </span>
                <span className="text-gray-400 text-xs">{formatRelativeTime(comment.created_at)}</span>
              </div>
              <div
                className="mt-2 text-gray-300 text-md"
                dangerouslySetInnerHTML={{ __html: comment?.content || '' }}
              />
              <button
                className="mt-2 text-xs text-gray-400 hover:bg-primary/30 px-1 py-0.5 transition-all duration-200 flex  rounded-sm items-center gap-1 cursor-pointer"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              >
                <Reply className="size-4" />
                Reply
              </button>

              {replyTo === comment.id && (
                <CommentEditor
                  editor={replyEditor}
                  onSubmitClick={
                    replyEditor?.getHTML()?.trim() ? () => handleSubmit(replyEditor, comment.id) : undefined
                  }
                  isCommenting={isPending}
                  isReply
                />
              )}
            </div>
          </div>

          <div className="ml-12 ">{renderComments({ comments, parentId: comment.id })}</div>
        </div>
      );
    });
  };

  return (
    <>
      <CommentEditor
        editor={newCommentEditor}
        onSubmitClick={editorContent ? () => handleSubmit(newCommentEditor, replyTo) : undefined}
        isCommenting={isPending}
        isReply={false}
      />
      <div className="py-6 ">
        <h1 className="text-l font-bold text-gray-300 border-b-[1.5px] border-gray-500 w-fit pb-2">Comments</h1>

        {isLoading ? (
          <Loader />
        ) : comments?.length ? (
          <div>{renderComments({ comments, parentId: null })}</div>
        ) : (
          <div className="mt-4 text-sm text-gray-400">No comments yet.</div>
        )}
      </div>
    </>
  );
};

export default CommentsSection;

function CommentEditor({
  editor,
  onSubmitClick,
  isCommenting,
  isReply,
}: {
  editor: Editor | null | undefined;
  onSubmitClick?: VoidFunction;
  isCommenting: boolean;
  isReply: boolean;
}) {
  return (
    <div
      className={cn(
        'px-[12px] py-[8px] bg-border border-2 text-[15px] min-h-[110px] relative transition-all duration-200 rounded-[8px] flex flex-col mt-4',
        editor?.isFocused ? ' border-primary' : 'border-transparent'
      )}
    >
      <div className="flex flex-1 min-h-0 w-full">
        <div className="relative flex flex-col flex-1 h-full w-full">
          {editor ? <EditorContent editor={editor} className="rounded-md" /> : null}
        </div>
      </div>

      <div className="h-6 w-full mt-4 flex gap-2">
        <button className="editor-btn" onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="editor-icon">
            <path d="M6 4h7a4 4 0 0 1 0 8H6zm0 8h8a4 4 0 1 1 0 8H6z" />
          </svg>
        </button>

        <button className="editor-btn" onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="editor-icon">
            <path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4z" />
          </svg>
        </button>

        <button
          className="editor-btn"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="editor-icon">
            <path d="M6 4h3v16H6zm9 0h3v16h-3zm-5 8h5v3h-5z" />
          </svg>
        </button>

        <button
          className="editor-btn"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="editor-icon">
            <path d="M4 6h2v2H4zm0 4h2v2H4zm0 4h2v2H4zm4-8h12v2H8zm0 4h12v2H8zm0 4h12v2H8z" />
          </svg>
        </button>

        <button
          className="editor-btn"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="editor-icon">
            <path d="M4 6h2v2H4zm0 4h2v2H4zm0 4h2v2H4zm4-8h12v2H8zm0 4h12v2H8zm0 4h12v2H8z" />
          </svg>
        </button>

        <button
          className="editor-btn"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="editor-icon">
            <path d="M8 4h2v16H8zm6 0h2v16h-2z" />
          </svg>
        </button>
      </div>

      <Button
        className="absolute ml-[8px] bottom-[8px] right-[8px]"
        size="sm"
        disabled={!onSubmitClick || isCommenting}
        onClick={onSubmitClick}
      >
        <SendHorizonal className="size-5" /> {isReply ? 'Reply' : 'Comment'}
      </Button>
    </div>
  );
}
