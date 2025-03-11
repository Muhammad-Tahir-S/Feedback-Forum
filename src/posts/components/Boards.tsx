import { useLocation } from 'react-router';

import { feedbackDropdownItems } from '@/app/components/Navbar';
import { P } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export default function Boards() {
  const boardItems = feedbackDropdownItems.map((item) => ({
    ...item,
    label: item.path === '/posts' ? 'View All Posts' : item.label,
  }));

  const location = useLocation();

  return (
    <div className="w-full hidden md:block">
      <P className="mb-2 text-secondary-foreground">Boards</P>
      <div className="w-full flex flex-col gap-1">
        {boardItems.map(({ path, label, icon }) => (
          <a
            key={path}
            href={path}
            className={cn(
              'flex items-center group hover:bg-secondary text-left w-full px-2 py-1.5 text-sm font-medium text-foreground rounded-[6px] hover:shadow-md border border-transparent hover:border-primary/40 transition-all duration-300',
              location.pathname === path ? 'bg-secondary shadow-md border-primary/40 ' : ''
            )}
          >
            <span className="flex items-center space-x-2">
              {icon && <span>{icon}</span>}
              <span>{label}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
