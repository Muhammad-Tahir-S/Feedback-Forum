import { Link } from 'react-router';

import { P } from '@/components/ui/typography';
import useGetBoardItems from '@/hooks/useGetBoardItems';
import { cn } from '@/lib/utils';

export default function Boards() {
  const { boards } = useGetBoardItems();

  const boardItems = boards.map((item) => ({
    ...item,
    label: item.path === '/posts' ? 'View All Posts' : item.label,
  }));

  return (
    <div className="w-full">
      <P className="mb-2 text-secondary-foreground">Boards</P>
      <div className="w-full flex flex-col gap-1">
        {boardItems.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={{
              pathname: path,
              search: location.search,
            }}
            className={cn(
              'flex items-center group hover:bg-secondary text-left w-full px-2 py-1.5 text-sm font-medium text-foreground rounded-[6px] hover:shadow-md border border-transparent hover:border-primary/40 transition-all duration-300',
              location.pathname === path ? 'bg-secondary shadow-md border-primary/40 ' : ''
            )}
          >
            <span className="flex items-center space-x-2">
              {icon && <span>{icon}</span>}
              <span>{label}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
