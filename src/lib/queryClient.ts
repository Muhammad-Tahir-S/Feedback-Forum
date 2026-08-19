import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

export const queryKeys = {
  posts: ['posts'] as const,
  boards: ['boards'] as const,
};
