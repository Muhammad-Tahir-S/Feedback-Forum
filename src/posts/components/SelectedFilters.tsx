import { formatDate } from 'date-fns';
import { X as CloseIcon } from 'lucide-react';
import { useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useCustomSearchParams from '@/hooks/useCustomSearchParams';
import useGetFilterOptions, { FilterKey } from '@/hooks/useGetFilterOptions';

export default function SelectedFilters() {
  const { searchParams, removeSearchParamValue, updateSearchParamOperator } = useCustomSearchParams();
  const { options } = useGetFilterOptions();

  const selectedFilters = Object.keys(options).reduce(
    (acc, key) => {
      const values = searchParams.getAll(key);
      if (values.length > 0) {
        acc.push(
          ...values.map((value) => {
            const [operator, actualValue] =
              value.startsWith('not:') ||
              value.startsWith('on:') ||
              value.startsWith('after:') ||
              value.startsWith('on_or_after:') ||
              value.startsWith('before:') ||
              value.startsWith('on_or_before:')
                ? [value.split(':')[0], value.slice(value.indexOf(':') + 1)]
                : ['', value];
            return {
              key: key as FilterKey,
              value: actualValue,
              operator:
                key === 'created_at' ? operator || 'on' : operator === 'not' ? ('Is Not' as const) : ('Is' as const),
            };
          })
        );
      }
      return acc;
    },
    [] as { key: FilterKey; value: string; operator: string }[]
  );

  return selectedFilters?.length ? (
    <div className="pb-0 pt-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {selectedFilters.map((filter, index) => (
          <div
            key={index}
            className="flex items-center text-xs font-medium border border-sidebar-accent-foreground/15 rounded-r-md shadow-sm "
          >
            <p className="flex items-center text-primary-foreground bg-sidebar-accent capitalize px-2 py-1.5">
              {options[filter.key]?.icon}
              <span>{options[filter.key]?.label}</span>
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <p className="px-2 border-x text-primary-foreground bg-sidebar-accent hover:bg-primary/80 cursor-pointer border-sidebar-accent-foreground/15 py-1.5 transition-all duration-200 capitalize">
                  {filter.operator.split('_').join(' ')}
                </p>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filter.key === 'created_at' ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        updateSearchParamOperator(filter.key, `${filter.value}`, 'on');
                      }}
                    >
                      On
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateSearchParamOperator(filter.key, filter.value, 'not');
                      }}
                    >
                      Not on
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateSearchParamOperator(filter.key, filter.value, 'after');
                      }}
                    >
                      After
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateSearchParamOperator(filter.key, filter.value, 'on_or_after');
                      }}
                    >
                      On or after
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateSearchParamOperator(filter.key, filter.value, 'before');
                      }}
                    >
                      Before
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateSearchParamOperator(filter.key, filter.value, 'on_or_before');
                      }}
                    >
                      On or before
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        updateSearchParamOperator(filter.key, `${filter.value}`, 'Is');
                      }}
                    >
                      Is
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateSearchParamOperator(filter.key, filter.value, 'Is Not');
                      }}
                    >
                      Is Not
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {filter.key === 'created_at' ? (
              <DatePopover filter={filter} />
            ) : (
              <div className="border-r border-sidebar-accent-foreground/15 shrink-0 min-w-fit">
                <p className="inline-flex items-center px-2  border-sidebar-accent-foreground/15 py-1.5 text-primary-foreground bg-sidebar-accent">
                  {/* cursor-pointer hover:bg-primary/80 transition-all duration-200 */}
                  {filter.key === 'board'
                    ? options[filter?.key].options?.find((opt) => opt.value === filter?.value)?.label
                    : filter.value}
                </p>
              </div>
            )}

            <button
              className="px-2 py-2 cursor-pointer rounded-r-md text-primary-foreground bg-sidebar-accent hover:bg-primary/80 transition-all duration-200"
              onClick={() => {
                removeSearchParamValue(filter.key, filter.value);
              }}
            >
              <CloseIcon className="w-3 h-3 secondary-svg" />
            </button>
          </div>
        ))}
      </div>
    </div>
  ) : null;
}

function DatePopover({ filter: { value } }: { filter: { key: FilterKey; value: string; operator: string } }) {
  const { searchParams, addSearchParam } = useCustomSearchParams();
  const createdAtSearchParams = searchParams.get('created_at');
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={(open) => setOpen(open)}>
      <PopoverTrigger>
        <div className="border-r border-sidebar-accent-foreground/15 shrink-0 min-w-fit">
          <p className="inline-flex items-center px-2  border-sidebar-accent-foreground/15 py-1.5 text-primary-foreground bg-sidebar-accent cursor-pointer hover:bg-primary/80 transition-all duration-200">
            {formatDate(value, 'dd-MMM-yy')}
          </p>
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-fit">
        <Calendar
          mode="single"
          selected={createdAtSearchParams ? new Date(createdAtSearchParams) : undefined}
          onSelect={(date) => {
            if (date) {
              const [operator, _value] =
                createdAtSearchParams?.startsWith('not:') ||
                createdAtSearchParams?.startsWith('on:') ||
                createdAtSearchParams?.startsWith('after:') ||
                createdAtSearchParams?.startsWith('on_or_after:') ||
                createdAtSearchParams?.startsWith('before:') ||
                createdAtSearchParams?.startsWith('on_or_before:')
                  ? [
                      createdAtSearchParams?.split(':')[0],
                      createdAtSearchParams?.slice(createdAtSearchParams?.indexOf(':') + 1),
                    ]
                  : ['', createdAtSearchParams || ''];

              addSearchParam('created_at', `${operator}:${date?.toString() || ''}`, true);
            }
            setOpen(false);
          }}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
}
