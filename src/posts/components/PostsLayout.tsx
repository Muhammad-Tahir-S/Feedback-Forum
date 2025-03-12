import { Outlet } from 'react-router';

import { Large, Muted } from '@/components/ui/typography';

import Boards from './Boards';
import CreatePostButton from './CreatePostButton';

export default function PostsLayout() {
  return (
    <div className="mt-4 flex gap-6 w-full">
      <div className="flex-1 min-w-0">
        <div className="relative p-4 overflow-hidden rounded-[8px] bg-card/50">
          <Large className="text-white">Share your product feedback!</Large>
          <Muted className="text-muted-foreground mt-1.5">
            Please tell us what we can do to make Featurebase the best product for you.
          </Muted>
          <div className="z-20 mt-3 lg:hidden">
            <CreatePostButton />
          </div>
        </div>

        <div className="p-4 -m-4 overflow-x-auto scrollbar-none">
          <div className="flex justify-between gap-3 mt-4">
            <div className="hidden lg:block">
              <CreatePostButton />
            </div>
          </div>
        </div>

        <Outlet />
      </div>

      <div className="w-[280px]  hidden md:block">
        <Boards />
      </div>
    </div>
  );
}
