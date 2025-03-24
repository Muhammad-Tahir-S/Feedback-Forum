import { Calendar, PuzzleIcon } from 'lucide-react';
import { ReactNode } from 'react';

import BoardsIcon from '@/assets/icons/boards.svg';
import StatusIcon from '@/assets/icons/status.svg';

import useGetBoardItems from './useGetBoardItems';

export type FilterKey = 'board' | 'status' | 'created_at' | 'custom_field';
type DropdownItem = { icon?: ReactNode; label: string; value: string };

export default function useGetFilterOptions() {
  const { boards } = useGetBoardItems();

  const options: Record<FilterKey, { options?: DropdownItem[] | undefined; label: string; icon: ReactNode }> = {
    board: {
      label: 'Boards',
      options: boards
        .filter((item) => item.path !== '/posts')
        .map((item) => ({
          label: item.label,
          icon: item.icon,
          value: item.id || '',
        })),
      icon: <BoardsIcon className="w-4 h-4 mr-2" />,
    },
    status: {
      label: 'Status',
      icon: <StatusIcon className="w-4 h-4 mr-2" />,
      options: [
        { value: 'in_progress', label: 'In Progress' },
        { value: 'planned', label: 'Planned' },
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'closed', label: 'Closed' },
      ],
    },
    created_at: {
      label: 'Created At',
      icon: <Calendar className="w-4 h-4 mr-2" />,
    },
    custom_field: {
      label: 'Custom Field',
      icon: <PuzzleIcon className="w-4 h-4 mr-2" />,
      options: [
        { value: 'module', label: 'To which module does this apply' },
        { value: 'integrations', label: 'Which integration?' },
        { value: 'bug_sources', label: 'What is experiencing an issue' },
      ],
    },
  };
  return { options };
}
