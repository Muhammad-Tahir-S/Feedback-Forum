import { useSearchParams } from 'react-router';

import { FilterKey } from './useGetFilterOptions';

export type Operator = (typeof dateOperators)[number]['operator'] | (typeof defaultOperators)[number]['operator'];

export const dateOperators: {
  operator: 'on' | 'not' | 'after' | 'on_or_after' | 'before' | 'on_or_before';
  name: string;
}[] = [
  { operator: 'on', name: 'On' },
  { operator: 'not', name: 'Not On' },
  { operator: 'after', name: 'After' },
  { operator: 'on_or_after', name: 'On or After' },
  { operator: 'before', name: 'Before' },
  { operator: 'on_or_before', name: 'On or Before' },
];

export const defaultOperators: {
  operator: 'is' | 'is_not';
  name: string;
}[] = [
  { operator: 'is', name: 'Is' },
  { operator: 'is_not', name: 'Is Not' },
];

export const isDateFilterParam = (value: string, key: FilterKey) =>
  key === 'created_at' &&
  dateOperators
    .map((op) => op.operator)
    .some((operator) => {
      return value.startsWith(`${operator}:`);
    });

export const extractFilterOperatorAndValueFromSearchParamValue = (value: string, key: FilterKey) => {
  const [operator, actualValue] = isDateFilterParam(value, key)
    ? [value.split(':')[0], value.slice(value.indexOf(':') + 1)]
    : key === 'created_at'
      ? ['on', value]
      : value.includes(':')
        ? value.split(':')
        : ['is', value];

  // console.log({ operator, actualValue, value, key });

  return { operator: operator as Operator, actualValue };
};

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
      const { actualValue } = extractFilterOperatorAndValueFromSearchParamValue(v, key as FilterKey);

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

  const updateSearchParamOperator = (key: string, value: string, operator: Operator) => {
    const existingValues = searchParams.getAll(key);

    if (key === 'created_at') {
      const updatedValues = existingValues.map((v) => {
        const { actualValue } = extractFilterOperatorAndValueFromSearchParamValue(value, key as FilterKey);

        return actualValue === value ? `${operator}:${value}` : v;
      });

      searchParams.delete(key);
      updatedValues.forEach((v) => searchParams.append(key, v));
      setSearchParams(searchParams);
      return;
    }

    const updatedValues = existingValues.map((v) => {
      return operator === 'is_not' && v === value
        ? `is_not:${value}`
        : operator === 'is' && v === `is_not:${value}`
          ? value
          : v;
    });

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
