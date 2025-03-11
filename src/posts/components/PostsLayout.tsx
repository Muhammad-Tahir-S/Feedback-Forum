import { Outlet } from 'react-router';

import Boards from './Boards';

export default function PostsLayout() {
  return (
    <div className="mt-4 flex gap-1.5 w-full">
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
      <div className="w-[280px]">
        <Boards />
      </div>
    </div>
  );
}
