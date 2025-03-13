import { Route, Routes } from 'react-router-dom';

import NotFound from '@/app/components/NotFound';
import useGetBoardItems from '@/hooks/useGetBoardItems';

import PostsLayout from './PostsLayout';
import PostsList from './PostsList';

export default function PostRoutes() {
  const { boards } = useGetBoardItems();

  return (
    <Routes>
      <Route path="/*" element={<PostsLayout />}>
        {boards.map(({ label, path, id }) => {
          return path === '/posts' ? (
            <Route key={label} index element={<PostsList boardId={id} />} />
          ) : (
            <Route key={label} path={path.split('/').at(-1)} element={<PostsList boardId={id} />} />
          );
        })}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
