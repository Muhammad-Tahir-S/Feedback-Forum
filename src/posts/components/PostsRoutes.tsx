import { Route, Routes } from 'react-router-dom';

import NotFound from '@/app/components/NotFound';

import PostsLayout from './PostsLayout';
import PostsList from './PostsList';

export default function PostRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<PostsLayout />}>
        <Route index element={<PostsList />} />
        {/* <Route path="/posts" element={<PostsList />} /> */}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
