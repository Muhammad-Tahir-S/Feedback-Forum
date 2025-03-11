import {
  Badge,
  Bell,
  LogOut,
  // Stars,
  User,
  UserCircle,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { H3 } from '@/components/ui/typography';
import { useAuth } from '@/contexts/AuthContext';

export default function ToolBar() {
  return (
    <div className="w-full h-[36px] flex justify-between">
      <a href="/posts" className="flex gap-2 items-center max-w-fit overflow-hidden">
        <div className="size-9 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Badge className="size-[70%] stroke-2" />
        </div>
        <H3 className="truncate max-w-xs text-secondary-foreground">Featurebase Clone</H3>
      </a>

      <div className="flex gap-4">
        <Notifications />
        <UserDropdown />
      </div>
    </div>
  );
}

function Notifications() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="size-9 rounded-full p-[7px] outline-0 bg-secondary border border-border cursor-pointer hover:bg-border"
        >
          <Bell className="size-5 fill-secondary-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end"></PopoverContent>
    </Popover>
  );
}

function UserDropdown() {
  const { signOut, loading } = useAuth();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="size-9 rounded-full  p-[7px] outline-0 bg-secondary border border-border cursor-pointer hover:bg-border"
        >
          <User className="size-full fill-secondary-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[208px]" align="end">
        <DropdownMenuItem>
          <UserCircle /> My Profile
        </DropdownMenuItem>
        <DropdownMenuItem disabled={loading} onClick={signOut}>
          <LogOut /> Sign out
        </DropdownMenuItem>
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem><Stars className='fill-amber-400' />Create your own feedback board</DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
