import { Navigate, Route, Routes } from 'react-router-dom';

import NotFound from '@/app/components/NotFound';

import AuthLayout from './AuthLayout';
import ResetPassword from './ResetPassword';
import SignIn from './SignIn';
import SignUp from './SignUp';
import UpdatePassword from './UpdatePassword';

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate replace to="signin" />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="update-password" element={<UpdatePassword />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
