import { ChevronDown, Clock, Flame, TrendingUp } from 'lucide-react';
import { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

type SortOption = 'trending' | 'top' | 'new';

export function SortSelector({ isSearchActive }: { isSearchActive: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSort = searchParams.get('sortBy') || 'comments_count';

  const sortOptionToColumn: Record<SortOption, string> = {
    trending: 'comments_count',
    top: 'votes_count',
    new: 'created_at',
  };

  const columnToSortOption: Record<string, SortOption> = {
    comments_count: 'trending',
    votes_count: 'top',
    created_at: 'new',
  };

  const currentSortOption = columnToSortOption[currentSort] || 'trending';

  const handleSortChange = (sortOption: SortOption) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sortBy', sortOptionToColumn[sortOption]);
    setSearchParams(newSearchParams);
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'trending':
        return { label: 'Trending', icon: <TrendingIcon /> };
      case 'top':
        return { label: 'Top', icon: <TopIcon /> };
      case 'new':
        return { label: 'New', icon: <NewIcon /> };
    }
  };

  const currentSortInfo = getSortLabel(currentSortOption);

  return (
    <div
      className={cn('flex transition-all duration-300', isSearchActive ? 'mr-0' : 'delay-400 mr-3')}
      style={{ opacity: isSearchActive ? 0 : 1, width: isSearchActive ? '0px' : 'fit-content' }}
    >
      <div className="hidden gap-3 sm:flex">
        <SortButton
          label="Trending"
          icon={<TrendingIcon />}
          isSelected={currentSortOption === 'trending'}
          onClick={() => handleSortChange('trending')}
        />
        <SortButton
          label="Top"
          icon={<TopIcon />}
          isSelected={currentSortOption === 'top'}
          onClick={() => handleSortChange('top')}
        />
        <SortButton
          label="New"
          icon={<NewIcon />}
          isSelected={currentSortOption === 'new'}
          onClick={() => handleSortChange('new')}
        />
      </div>

      {/* Mobile Dropdown */}
      <div className="sm:hidden relative">
        <Drawer>
          <DrawerTrigger asChild>
            <SortButton
              label={currentSortInfo?.label}
              icon={currentSortInfo?.icon}
              isSelected
              endIcon={<ChevronDownIcon />}
            />
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Sort posts</DrawerTitle>
                <DrawerDescription>Select how posts should be sorted.</DrawerDescription>
              </DrawerHeader>

              <DrawerClose asChild>
                <button
                  className={`flex w-full items-center px-4 py-2 text-sm ${
                    currentSortOption === 'trending' ? 'bg-accent/10 text-primary' : 'text-foreground'
                  }`}
                  role="menuitem"
                  onClick={() => handleSortChange('trending')}
                >
                  <TrendingIcon />
                  Trending
                </button>
              </DrawerClose>

              <DrawerClose asChild>
                <button
                  className={`flex w-full items-center px-4 py-2 text-sm ${
                    currentSortOption === 'top' ? 'bg-accent/10 text-primary' : 'text-foreground'
                  }`}
                  role="menuitem"
                  onClick={() => handleSortChange('top')}
                >
                  <TopIcon />
                  Top
                </button>
              </DrawerClose>

              <DrawerClose asChild>
                <button
                  className={`flex w-full items-center px-4 py-2 text-sm ${
                    currentSortOption === 'new' ? 'bg-accent/10 text-primary' : 'text-foreground'
                  }`}
                  role="menuitem"
                  onClick={() => handleSortChange('new')}
                >
                  <NewIcon />
                  New
                </button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

function SortButton({
  icon,
  label,
  onClick,
  isSelected,
  endIcon,
}: {
  icon: ReactNode;
  label: string;
  onClick?: VoidFunction;
  isSelected: boolean;
  endIcon?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-[34px] px-[10px] flex whitespace-nowrap rounded-md items-center cursor-pointer border text-[14px] transition-all duration-300 hover:bg-primary',
        isSelected ? 'bg-primary/80 border-accent ' : 'border-border  bg-sidebar-accent'
      )}
    >
      {icon} {label} <span className="ml-auto">{endIcon}</span>
    </button>
  );
}

const TrendingIcon = () => <Flame className="size-4 mr-1.5" />;

const TopIcon = () => <TrendingUp className="size-4 mr-1.5" />;

const NewIcon = () => <Clock className="size-4 mr-1.5" />;

const ChevronDownIcon = () => <ChevronDown className="size-4 ml-1.5 opacity-80" />;
