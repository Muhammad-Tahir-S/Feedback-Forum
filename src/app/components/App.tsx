import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';

import AppRoutes from './AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
