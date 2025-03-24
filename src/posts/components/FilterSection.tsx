import { LucideSearch, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { cn } from '@/lib/utils';

import CreatePostButton from './CreatePostButton';
import Filter from './Filter';
import { SortSelector } from './SortSelector';

export default function FilterSection() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchActive) {
      setTimeout(() => inputRef?.current?.focus(), 400);
    }
  }, [isSearchActive]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchParams({ search: searchQuery });
    }
  };

  return (
    <div className="flex justify-between mt-4">
      <SortSelector isSearchActive={isSearchActive} />

      <div className="flex items-center justify-end w-full gap-3 ml-auto">
        <div className="flex items-start justify-end relative rounded-md flex-1">
          <div
            className={cn(
              'group flex relative items-center h-8.5 overflow-hidden transition-all duration-400  ease-in-out',
              isSearchActive ? 'w-full' : 'w-0'
            )}
          >
            <div className="z-10 cursor-text">
              <Search className="size-3.5 ml-3" />
            </div>
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isSearchActive ? 'Search for posts' : undefined}
              autoFocus
              className={cn(
                'pl-7 pr-2 mr-4 rounded-r-none rounded-l-md bg-transparent absolute border border-r-0 inset-0 shadow-none focus:ring-0 focus:outline-none w-full transition-all duration-300 border-primary/40'
              )}
            />
          </div>
          <button
            onClick={() => {
              if (isSearchActive) {
                setSearchQuery('');
                searchParams.delete('search');
                setSearchParams(searchParams);
                setIsSearchActive(false);
              } else {
                setIsSearchActive(true);
              }
            }}
            type="button"
            className={cn(
              'size-8.5 shrink-0 justify-center flex whitespace-nowrap rounded-md items-center cursor-pointer border text-[14px] transition-all duration-500 hover:bg-primary/40 overflow-hidden',
              isSearchActive
                ? 'border-primary/40 rounded-l-none w-8.5 bg-transparent pl-0'
                : 'w-9.5 sm:w-22.5 bg-primary/80 hover:bg-primary border-accent px-2.5'
            )}
          >
            {!isSearchActive ? (
              <>
                <LucideSearch className="size-4" /> <span className="ml-auto hidden sm:inline">Search</span>
              </>
            ) : (
              <X className="size-4" />
            )}
          </button>
        </div>
      </div>

      <Filter />

      <div className="hidden lg:block lg:ml-3">
        <CreatePostButton />
      </div>
    </div>
  );
}
