import { useLocation } from 'react-router';

import { parsePostsPath } from '@/lib/postsPath';

import useGetBoardItems from './useGetBoardItems';

export default function useGetBoardId() {
  const location = useLocation();
  const { boards, isLoading } = useGetBoardItems();
  const { boardPath, isInvalid } = parsePostsPath(location.pathname);
  const boardId =
    isInvalid ? undefined : boardPath === '/posts' ? undefined : boards.find((item) => item.path === boardPath)?.id;

  return { boardId, boardPath, isLoading };
}
