import { ComponentProps, ReactNode, useMemo, useState } from 'react';

import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type DropdownItem = { label: string; value: string; icon?: ReactNode };

export default function SearchDropdownContent({
  items,
  onSelect,
  contentProps,
  noItemMessage,
  searchInputPlaceholder,
  onMultiSelect,
  isSelected,
}: {
  items: DropdownItem[];
  onSelect?: (item: DropdownItem) => void;
  contentProps?: ComponentProps<typeof DropdownMenuContent>;
  noItemMessage?: string;
  searchInputPlaceholder?: string;
  onMultiSelect?: (item: DropdownItem) => void;
  isSelected?: (item: DropdownItem) => boolean | undefined;
}) {
  const [searchValue, setSearchValue] = useState('');

  const filteredItems = useMemo(
    () => items.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase())),
    [items, searchValue]
  );

  return (
    <DropdownMenuContent {...contentProps} className={cn('z-[999] w-[238px]', contentProps?.className)}>
      <input
        className="placeholder:text-foreground-muted flex border-0 focus:outline-none focus:ring-0 dark:bg-transparent h-9 w-full rounded-md bg-transparent px-2 py-3 text-base sm:text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={searchInputPlaceholder || 'Search options...'}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
        autoFocus
      ></input>

      <DropdownMenuSeparator />
      {filteredItems?.length > 0 ? (
        filteredItems.map((item, index) =>
          onMultiSelect ? (
            <DropdownMenuCheckboxItem
              checked={isSelected?.(item)}
              onCheckedChange={() => onMultiSelect(item)}
              key={`${index}_${item.value}`}
              tabIndex={undefined}
            >
              <span
                className="inline-flex gap-1 items-center"
                onClick={(e) => {
                  e.preventDefault();
                  onSelect?.(item);
                }}
              >
                {item?.icon} {item.label}
              </span>
            </DropdownMenuCheckboxItem>
          ) : (
            <DropdownMenuItem
              className="hover:bg-primary/60 hover:text-accent-foreground"
              tabIndex={undefined}
              onClick={() => onSelect?.(item)}
              key={`${index}_${item.value}`}
            >
              <span className="inline-flex items-center">
                {item?.icon} {item.label}
              </span>
            </DropdownMenuItem>
          )
        )
      ) : (
        <div className="py-2.5 px-3 text-left text-sm">{noItemMessage || 'No options found'}</div>
      )}
    </DropdownMenuContent>
  );
}
