import { useLocalStorage } from '@uidotdev/usehooks';
import { Database } from 'database.types';
import { Route, Routes } from 'react-router-dom';

import NotFound from '@/app/components/NotFound';

import PostsLayout from './PostsLayout';
import PostsList from './PostsList';

type Board = Database['public']['Tables']['boards']['Row'];

export default function PostRoutes() {
  const [boards] = useLocalStorage<Board[]>('boards');

  const boardItems = [{ value: 'posts', id: undefined }, ...boards];

  return (
    <Routes>
      <Route path="/*" element={<PostsLayout />}>
        {boardItems.map(({ value, id }) => {
          return value === 'posts' ? (
            <Route key={value} index element={<PostsList boardId={id} />} />
          ) : (
            <Route key={value} path={value} element={<PostsList boardId={id} />} />
          );
        })}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
