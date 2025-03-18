import { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AuthRoutes from '@/auth';
import { useAuth } from '@/contexts/AuthContext';
import PostRoutes from '@/posts/components/PostsRoutes';

import MainLayout from './MainLayout';
import NotFound from './NotFound';

function MainRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/posts" />} />
        <Route path="posts/*" element={<PostRoutes />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="auth/*" element={<AuthRoutes />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <MainRoutes />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    return children;
  }

  return <Navigate replace to={'/auth/signin'} state={{ from: location }} />;
}
