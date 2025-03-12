import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { ComponentProps } from 'react';

import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import SearchDropdownContent from './SearchDropdownContent';

type DropdownItem = ComponentProps<typeof SearchDropdownContent>['items'][number];
export default function SelectDropdown({
  selectedItem,
  label,
  ...dropdownProps
}: {
  selectedItem: DropdownItem | null;
  label: string;
} & ComponentProps<typeof SearchDropdownContent>) {
  return (
    <div className="relative z-[50] py-3.5 px-4 bg-popover border-t border-accent">
      <p className="pr-20 text-sm font-medium text-foreground">{label}</p>

      <div className="mt-3 max-w-[240px]">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full relative py-1 pl-2.5 pr-10 text-left border border-accent hover:bg-primary/20 cursor-pointer rounded-md sm:text-sm text-foreground bg-secondary transition-all"
            >
              <span className="truncate font-medium">
                <p className="truncate">{selectedItem?.label || 'Unselected'}</p>
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="w-5 h-5 opacity-75 secondary-svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>
            </button>
          </DropdownMenuTrigger>
          <SearchDropdownContent {...dropdownProps} />
        </DropdownMenu>
      </div>
    </div>
  );
}
