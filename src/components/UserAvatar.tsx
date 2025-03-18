import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { ComponentProps } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

export default function UserAvatar(props: ComponentProps<typeof AvatarPrimitive.Root>) {
  const { user } = useAuth();

  return (
    <Avatar {...props}>
      <AvatarImage src={user?.avatar_url} alt="user-avatar" />
      <AvatarFallback>{user?.username?.slice(0, 1)}</AvatarFallback>
    </Avatar>
  );
}
