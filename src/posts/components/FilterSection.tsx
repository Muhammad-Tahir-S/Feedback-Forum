import { LucideSearch, X } from 'lucide-react';
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
              'group flex relative items-center h-[33.58px] overflow-hidden transition-all duration-400  ease-in-out',
              isSearchActive ? 'w-full' : 'w-0'
            )}
          >
            <div className="z-10 cursor-text">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="w-3.5 h-3.5 secondary-svg ml-3"
                data-state="closed"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
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
              'h-[34px] justify-center flex whitespace-nowrap rounded-md items-center cursor-pointer border text-[14px] transition-all duration-500 hover:bg-primary/40 overflow-hidden',
              isSearchActive
                ? 'border-primary/40 rounded-l-none w-[38px] bg-transparent pl-0'
                : 'w-[38px] sm:w-[91px] bg-primary/80 hover:bg-primary border-accent px-[10px]'
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
