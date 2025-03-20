import { useLocation } from 'react-router';

import useGetBoardItems from './useGetBoardItems';

export default function useGetBoardId() {
  const location = useLocation();
  const { boards } = useGetBoardItems();
  const boardId =
    location?.pathname === '/posts' ? undefined : boards.find((item) => item.path === location?.pathname)?.id;

  return { boardId };
}
