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

const TrendingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    width={16}
    height={16}
    fill="currentColor"
    aria-hidden="true"
    className="secondary-svg mr-1.5"
  >
    <path
      fillRule="evenodd"
      d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
      clipRule="evenodd"
    />
  </svg>
);

const TopIcon = () => (
  <svg
    width={16}
    height={16}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    className="secondary-svg mr-1.5"
  >
    <path
      fillRule="evenodd"
      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
      clipRule="evenodd"
    />
  </svg>
);

const NewIcon = () => (
  <svg
    width={16}
    height={16}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    className="secondary-svg mr-1.5"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width={16}
    height={16}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    className="secondary-svg ml-1.5 opacity-80"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);
