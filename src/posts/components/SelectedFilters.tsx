import { formatDate } from 'date-fns';
import { X as CloseIcon } from 'lucide-react';
import { ComponentProps, useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useCustomSearchParams, {
  dateOperators,
  defaultOperators,
  extractFilterOperatorAndValueFromSearchParamValue,
} from '@/hooks/useCustomSearchParams';
import useGetFilterOptions, { FilterKey } from '@/hooks/useGetFilterOptions';

import { badgeOptions, integrationOptions, moduleOptions } from '../utils/options';
import SearchDropdownContent from './CreatePostButton/SearchDropdownContent';

export default function SelectedFilters() {
  const { searchParams, removeSearchParamValue, updateSearchParamOperator } = useCustomSearchParams();
  const { options } = useGetFilterOptions();

  const selectedFilters = Object.keys(options).reduce(
    (acc, key) => {
      const values = searchParams.getAll(key);
      if (values.length > 0) {
        acc.push(
          ...values.map((value) => {
            const { operator, actualValue } = extractFilterOperatorAndValueFromSearchParamValue(
              value,
              key as FilterKey
            );
            // console.log({ operator, actualValue, value, key });

            return {
              key: key as FilterKey,
              value: actualValue,
              operator,
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
              <span>
                {filter.key === 'custom_field'
                  ? options.custom_field.options?.find((opt) => opt.value === filter.value)?.label
                  : options[filter.key]?.label}
              </span>
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <p className="px-2 border-x text-primary-foreground bg-sidebar-accent hover:bg-primary/80 cursor-pointer border-sidebar-accent-foreground/15 py-1.5 transition-all duration-200 capitalize">
                  {filter.operator.split('_').join(' ')}
                </p>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filter.key === 'created_at'
                  ? dateOperators.map((op) => (
                      <DropdownMenuItem
                        key={op.operator}
                        onClick={() => {
                          updateSearchParamOperator(filter.key, `${filter.value}`, op.operator);
                        }}
                      >
                        {op.name}
                      </DropdownMenuItem>
                    ))
                  : defaultOperators.map((op) => (
                      <DropdownMenuItem
                        key={op.operator}
                        onClick={() => {
                          updateSearchParamOperator(filter.key, `${filter.value}`, op.operator);
                        }}
                      >
                        {op.name}
                      </DropdownMenuItem>
                    ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {filter.key === 'created_at' ? (
              <DatePopover filter={filter} />
            ) : filter.key === 'custom_field' ? (
              <CustomFieldDropdown filter={filter} />
            ) : (
              <div className="border-r border-sidebar-accent-foreground/15 shrink-0 min-w-fit">
                <p className="inline-flex items-center px-2  border-sidebar-accent-foreground/15 py-1.5 text-primary-foreground bg-sidebar-accent">
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

function CustomFieldDropdown({
  filter: { value, key },
}: {
  filter: { key: FilterKey; value: string; operator: string };
}) {
  const { searchParams, addSearchParam: _aS } = useCustomSearchParams();
  const { options } = useGetFilterOptions();

  const customFieldSearchParams = searchParams.get('custom_field');
  const [open, setOpen] = useState(false);

  const dropdownItems: Record<
    'module' | 'bug_sources' | 'integrations',
    ComponentProps<typeof SearchDropdownContent>['items']
  > = { bug_sources: badgeOptions, module: moduleOptions, integrations: integrationOptions };

  console.log({ value, key, customFieldSearchParams, items: dropdownItems[value as keyof typeof dropdownItems] });
  return (
    <DropdownMenu open={open} onOpenChange={(open) => setOpen(open)}>
      <DropdownMenuTrigger>
        <div className="border-r border-sidebar-accent-foreground/15 shrink-0 min-w-fit">
          <p className="inline-flex items-center px-2  border-sidebar-accent-foreground/15 py-1.5 text-primary-foreground bg-sidebar-accent cursor-pointer hover:bg-primary/80 transition-all duration-200">
            {options.custom_field.options?.map((op) => op.value).includes(value) ? 'Not Selected' : value}
          </p>
        </div>
      </DropdownMenuTrigger>
      <SearchDropdownContent items={dropdownItems[value as keyof typeof dropdownItems]} onSelect={() => {}} />
    </DropdownMenu>
  );
}
