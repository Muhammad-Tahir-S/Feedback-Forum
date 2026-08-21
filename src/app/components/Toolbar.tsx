import { Badge, LogOut, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { H3, Muted } from '@/components/ui/typography';
import UserAvatar from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';

export default function ToolBar() {
  return (
    <div className="w-full h-[36px] flex justify-between">
      <Link to="/posts" className="flex gap-2 items-center max-w-fit overflow-hidden">
        <div className="size-9 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Badge className="size-[70%] stroke-4" />
        </div>
        <H3 className="truncate max-w-xs text-secondary-foreground">Feedback Forum</H3>
      </Link>

      <div className="flex gap-4">
        <UserDropdown />
      </div>
    </div>
  );
}

function UserDropdown() {
  const { user, signOut, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = user?.username || user?.email || 'User';

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button type="button" className="outline-0 rounded-full cursor-pointer hover:bg-border">
            <UserAvatar />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[208px]" align="end">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setDropdownOpen(false);
              setProfileOpen(true);
            }}
          >
            <UserCircle /> My Profile
          </DropdownMenuItem>
          <DropdownMenuItem disabled={loading} onClick={signOut}>
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 px-4 pb-6 text-center">
            <UserAvatar className="size-20" />
            <div className="min-w-0 w-full">
              <p className="truncate text-base font-semibold text-foreground">{displayName}</p>
              {user?.email ? <Muted className="truncate text-sm mt-1">{user.email}</Muted> : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
