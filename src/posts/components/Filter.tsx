import { PopoverContent } from '@radix-ui/react-popover';
import { usePrevious } from '@uidotdev/usehooks';
import { Filter as FilterIcon } from 'lucide-react';
import { useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import useCustomSearchParams from '@/hooks/useCustomSearchParams';
import useGetFilterOptions from '@/hooks/useGetFilterOptions';

import SearchDropdownContent from './CreatePostButton/SearchDropdownContent';

type FilterKey = 'board' | 'status' | 'created_at' | 'custom_field';

export default function Filter() {
  const { searchParams, addSearchParam, isValueInSearchParams, removeSearchParamValue } = useCustomSearchParams();

  const [selectedKey, setSelectedKey] = useState<FilterKey>();

  const { options } = useGetFilterOptions();

  const [isOpen, setIsOpen] = useState(false);
  const previousIsOpen = usePrevious(selectedKey);

  function closeMenu() {
    setIsOpen(false);
    setTimeout(() => setSelectedKey(undefined), 100);
    return;
  }

  const createdAtSearchParams = searchParams.get('created_at');

  return (
    <Popover open={selectedKey === 'created_at'} modal={false}>
      <PopoverTrigger>
        <div className="h-[34px] w-[38px] relative shrink-0  ml-3 z-50">
          <DropdownMenu
            modal={false}
            open={isOpen}
            onOpenChange={(open) => {
              if (isOpen && selectedKey && previousIsOpen === undefined) {
                return;
              }
              if (!open) {
                closeMenu();
              }
              setIsOpen(open);
            }}
          >
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="size-full justify-center flex whitespace-nowrap rounded-md items-center cursor-pointer border text-[14px] transition-all duration-500 hover:bg-primary bg-primary/80 border-accent shrink-0 overflow-hidden"
              >
                <FilterIcon className="size-4 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            {selectedKey === 'created_at' ? (
              <PopoverContent align="end" onPointerDownOutside={() => closeMenu()} onEscapeKeyDown={closeMenu}>
                <Calendar
                  mode="single"
                  selected={createdAtSearchParams ? new Date(createdAtSearchParams) : undefined}
                  onSelect={(date) => {
                    addSearchParam('created_at', date?.toString() || '', true);
                    closeMenu();
                  }}
                  className="rounded-md border"
                />
              </PopoverContent>
            ) : (
              <SearchDropdownContent
                contentProps={{
                  onPointerDownOutside: closeMenu,
                  onEscapeKeyDown: closeMenu,
                  side: 'bottom',
                  align: 'end',
                }}
                items={
                  (!selectedKey
                    ? Object.keys(options).map((k) => ({
                        label: options[k as keyof typeof options]?.label,
                        value: k,
                        icon: options[k as keyof typeof options]?.icon,
                      }))
                    : options[selectedKey]?.options) || []
                }
                onSelect={
                  !selectedKey
                    ? (item) => setSelectedKey(item.value as FilterKey)
                    : (item) => {
                        if (isValueInSearchParams(selectedKey, item.value)) {
                          removeSearchParamValue(selectedKey, item.value);
                        } else {
                          addSearchParam(selectedKey, item.value);
                        }
                        closeMenu();
                      }
                }
                onMultiSelect={
                  !selectedKey
                    ? undefined
                    : (item) =>
                        isValueInSearchParams(selectedKey, item.value)
                          ? removeSearchParamValue(selectedKey, item.value)
                          : addSearchParam(selectedKey, item.value)
                }
                isSelected={!selectedKey ? undefined : (item) => isValueInSearchParams(selectedKey, item.value)}
              />
            )}
          </DropdownMenu>
        </div>
      </PopoverTrigger>
    </Popover>
  );
}
