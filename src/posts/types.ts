import { Database } from 'database.types';

import { UserType } from '@/types/auth';

type PostView = Database['public']['Views']['posts_with_users']['Row'];

export type PostWithUser = Omit<PostView, 'id' | 'status' | 'created_at' | 'user'> & {
  id: string;
  status: NonNullable<PostView['status']>;
  created_at: string;
  user: UserType | null;
};
