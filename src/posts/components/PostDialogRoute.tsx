import { useParams } from 'react-router';

import NotFound from '@/app/components/NotFound';
import { isPostId } from '@/lib/postsPath';

import PostDialog from './PostDialog';

export default function PostDialogRoute() {
  const { postId } = useParams<{ postId: string }>();

  if (!postId || !isPostId(postId)) {
    return <NotFound />;
  }

  return <PostDialog />;
}
