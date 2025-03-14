import { Database } from 'database.types';

import { UserType } from '@/types/auth';

export type PostWithUser = Database['public']['Tables']['posts']['Row'] & {
  user: UserType | null;
};
