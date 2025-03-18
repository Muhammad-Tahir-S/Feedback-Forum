import { ReactNode } from 'react';

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
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 mr-2 secondary-svg"
        >
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
        </svg>
      ),
    },
    status: {
      label: 'Status',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 mr-2 secondary-svg"
        >
          <path
            fillRule="evenodd"
            d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
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
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 mr-2 secondary-svg"
        >
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
    },
    custom_field: {
      label: 'Custom Field',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 mr-2 secondary-svg"
        >
          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"></path>
        </svg>
      ),
      options: [
        { value: 'module', label: 'To which module does this apply' },
        { value: 'integrations', label: 'Which integration?' },
        { value: 'bug_sources', label: 'What is experiencing an issue' },
      ],
    },
  };
  return { options };
}
