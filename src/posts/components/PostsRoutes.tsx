import { Route, Routes } from 'react-router-dom';

import NotFound from '@/app/components/NotFound';
import useGetBoardItems from '@/hooks/useGetBoardItems';

import PostPage from './PostPage';
import PostsLayout from './PostsLayout';
import PostsList from './PostsList';

export default function PostRoutes() {
  const { boards } = useGetBoardItems();

  return (
    <Routes>
      <Route path="/*" element={<PostsLayout />}>
        <Route index element={<PostsList />} />

        {boards.map(({ label, path }) => {
          return <Route key={label} path={path.split('/').at(-1)} element={<PostsList />} />;
        })}
        <Route path=":id" element={<PostPage />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
