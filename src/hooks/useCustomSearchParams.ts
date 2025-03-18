import { useSearchParams } from 'react-router';

import { FilterKey } from './useGetFilterOptions';

export default function useCustomSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const addSearchParam = (key: FilterKey, value: string, replace?: boolean) => {
    if (replace) {
      searchParams.set(key, value);
    } else {
      searchParams.append(key, value);
    }
    setSearchParams(searchParams);
  };

  const isValueInSearchParams = (key: FilterKey, value: string): boolean => {
    const values = searchParams.getAll(key);
    return values.includes(value);
  };

  const removeSearchParamValue = (key: FilterKey, value: string) => {
    const existingValues = searchParams.getAll(key);

    const updatedValues = existingValues.filter((v) => {
      const [_operator, actualValue] =
        key === 'created_at'
          ? value.startsWith('not:') ||
            value.startsWith('on:') ||
            value.startsWith('after:') ||
            value.startsWith('on_or_after:') ||
            value.startsWith('before:') ||
            value.startsWith('on_or_before:')
            ? [value.split(':')[0], value.slice(value.indexOf(':') + 1)]
            : ['', value]
          : v.includes(':')
            ? v.split(':')
            : ['', v];
      return actualValue !== value;
    });

    if (updatedValues.length > 0) {
      searchParams.delete(key);
      updatedValues.forEach((v) => searchParams.append(key, v));
    } else {
      searchParams.delete(key);
    }

    setSearchParams(searchParams);
  };

  const updateSearchParamOperator = (
    key: string,
    value: string,
    operator: 'Is' | 'Is Not' | 'on' | 'not' | 'after' | 'on_or_after' | 'before' | 'on_or_before'
  ) => {
    const existingValues = searchParams.getAll(key);

    if (key === 'created_at') {
      const updatedValues = existingValues.map((v) => {
        const [_existingOperator, existingValue] =
          value.startsWith('not:') ||
          value.startsWith('on:') ||
          value.startsWith('after:') ||
          value.startsWith('on_or_after:') ||
          value.startsWith('before:') ||
          value.startsWith('on_or_before:')
            ? [value.split(':')[0], value.slice(value.indexOf(':') + 1)]
            : ['', value];
        return existingValue === value ? `${operator}:${value}` : v;
      });

      searchParams.delete(key);
      updatedValues.forEach((v) => searchParams.append(key, v));
      setSearchParams(searchParams);
      return;
    }

    const updatedValues = existingValues.map((v) =>
      operator === 'Is Not' && v === value ? `not:${value}` : operator === 'Is' && v === `not:${value}` ? value : v
    );

    searchParams.delete(key);
    updatedValues.forEach((v) => searchParams.append(key, v));
    setSearchParams(searchParams);
  };

  return {
    addSearchParam,
    isValueInSearchParams,
    removeSearchParamValue,
    searchParams,
    setSearchParams,
    updateSearchParamOperator,
  };
}
