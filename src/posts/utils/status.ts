import { PostWithUser } from '../types';

export const statusStyles: { [k in NonNullable<PostWithUser['status']>]: string } = {
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/10',
  planned: 'bg-purple-500/10 text-purple-500 border-purple-500/10',
  completed: 'bg-green-500/10 text-green-500 border-green-500/10',
  pending: 'bg-gray-500/10 text-gray-500 border-gray-500/10',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/10',
  closed: 'bg-blue-500/10 text-blue-500 border-blue-500/10',
};

export const statusText: { [k in NonNullable<PostWithUser['status']>]: string } = {
  in_progress: 'In Progress',
  planned: 'Planned',
  completed: 'Completed',
  pending: 'Pending',
  rejected: 'Rejected',
  closed: 'Closed',
};
