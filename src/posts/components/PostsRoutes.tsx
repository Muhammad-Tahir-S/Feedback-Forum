import { Route, Routes } from 'react-router-dom';

import NotFound from '@/app/components/NotFound';
import { getBoardSlugs } from '@/lib/postsPath';

import PostDialogRoute from './PostDialogRoute';
import PostsLayout from './PostsLayout';

export default function PostRoutes() {
  const boardSlugs = getBoardSlugs();

  return (
    <Routes>
      <Route path="/*" element={<PostsLayout />}>
        <Route index element={null} />

        {boardSlugs.map((slug) => (
          <Route key={slug} path={slug}>
            <Route index element={null} />
            <Route path=":postId" element={<PostDialogRoute />} />
          </Route>
        ))}

        <Route path=":postId" element={<PostDialogRoute />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
