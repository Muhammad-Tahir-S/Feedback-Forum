import { useLocalStorage } from '@uidotdev/usehooks';
import { Database } from 'database.types';
import { ReactNode } from 'react';

import PostsIcon from '@/assets/icons/posts.svg';
import { paths } from '@/lib/paths';

type Board = Database['public']['Tables']['boards']['Row'];
type Path = (typeof paths)[number];

export default function useGetBoardItems() {
  const [boards] = useLocalStorage<Board[] | null>('boards');

  const boardItems: {
    label: (string & {}) | Path['title'];
    path: Path['pathname'];
    icon?: ReactNode;
    id?: string;
  }[] = [
    {
      label: 'All Posts',
      path: '/posts' as const,
      icon: <PostsIcon className="w-4 h-4" />,
    },
    {
      label: 'Feature Request',
      path: '/posts/feature-request' as const,
      icon: (
        <span role="img" aria-label="Feature request">
          💡
        </span>
      ),
    },
    {
      label: 'Bugs',
      path: '/posts/bugs' as const,
      icon: (
        <span role="img" aria-label="Bugs">
          🐛
        </span>
      ),
    },
    {
      label: 'Integrations',
      path: '/posts/integrations' as const,
      icon: (
        <span role="img" aria-label="Integrations">
          🖇️
        </span>
      ),
    },
    {
      label: 'Question',
      path: '/posts/question' as const,
      icon: (
        <span role="img" aria-label="Question">
          🤔
        </span>
      ),
    },
  ].map((item) => ({ ...item, id: boards?.find((b) => b.name === item.label)?.id }));

  return { boards: boardItems };
}
