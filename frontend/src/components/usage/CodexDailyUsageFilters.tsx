import React from 'react';
import { SingleSelect } from '../ui/SingleSelect';
import { Search, X } from 'lucide-react';

export interface CodexDailyUsageFilterValues {
  search: string;
  date: string;
  model: string;
  minCost: string;
  maxCost: string;
}

interface CodexDailyUsageFiltersProps {
  filters: CodexDailyUsageFilterValues;
  appliedFilters: CodexDailyUsageFilterValues;
  onChange: (filters: CodexDailyUsageFilterValues) => void;
  onApply: (filters: CodexDailyUsageFilterValues) => void;
  onClear: () => void;
  availableModels: string[];
}

export function CodexDailyUsageFilters({
  filters,
  appliedFilters,
  onChange,
  onApply,
  onClear,
  availableModels,
}: CodexDailyUsageFiltersProps) {
  const modelOptions = [
    { value: '', label: 'All Models' },
    ...availableModels.map((model) => ({ value: model, label: model })),
  ];

  const handleInputChange = (field: keyof CodexDailyUsageFilterValues, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  const handleApply = () => {
    onApply(filters);
  };

  const handleClear = () => {
    const clearedFilters: CodexDailyUsageFilterValues = {
      search: '',
      date: '',
      model: '',
      minCost: '',
      maxCost: '',
    };
    onChange(clearedFilters);
    onClear();
  };

  const hasActiveFilters =
    appliedFilters?.search ||
    appliedFilters?.date ||
    appliedFilters?.model ||
    appliedFilters?.minCost ||
    appliedFilters?.maxCost;

  return (
    <div className='mb-4 rounded-md bg-gray-50 p-4 dark:bg-slate-800'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className='flex items-center gap-1 rounded-md bg-gray-200 px-2 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          >
            <X className='h-3 w-3' />
            Clear All
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        {/* General Search */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>Search</label>
          <div className='relative'>
            <input
              type='text'
              value={filters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              className='block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
              placeholder='Search all fields...'
            />
          </div>
        </div>

        {/* Date Filter */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>Date</label>
          <div className='relative'>
            <input
              type='date'
              value={filters.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className='block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
            />
          </div>
        </div>

        {/* Model Filter */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>Model</label>
          <SingleSelect
            options={modelOptions}
            value={filters.model}
            onChange={(value) => handleInputChange('model', value)}
            placeholder='Select model'
          />
        </div>

        {/* Min Cost Filter */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>Min Cost ($)</label>
          <div className='relative'>
            <input
              type='number'
              step='0.01'
              min='0'
              value={filters.minCost}
              onChange={(e) => handleInputChange('minCost', e.target.value)}
              className='block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
              placeholder='0.00'
            />
          </div>
        </div>

        {/* Max Cost Filter */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>Max Cost ($)</label>
          <div className='relative'>
            <input
              type='number'
              step='0.01'
              min='0'
              value={filters.maxCost}
              onChange={(e) => handleInputChange('maxCost', e.target.value)}
              className='block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
              placeholder='999.99'
            />
          </div>
        </div>
      </div>

      <div className='mt-4 flex items-end gap-2'>
        <button
          onClick={handleApply}
          className='flex h-10 items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
        >
          <Search className='h-4 w-4' />
          Apply
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className='flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            <X className='h-4 w-4' />
            Clear
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className='mt-4 flex flex-wrap gap-2'>
          <span className='py-1 text-sm text-gray-600 dark:text-gray-400'>Active filters:</span>
          {appliedFilters?.search && (
            <span className='inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'>
              Search: "{appliedFilters.search}"
              <button
                onClick={() => {
                  handleInputChange('search', '');
                  onApply({ ...filters, search: '' });
                }}
                className='ml-1 hover:text-indigo-600'
              >
                <X className='h-3 w-3' />
              </button>
            </span>
          )}
          {appliedFilters?.date && (
            <span className='inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'>
              Date: {appliedFilters.date}
              <button
                onClick={() => {
                  handleInputChange('date', '');
                  onApply({ ...filters, date: '' });
                }}
                className='ml-1 hover:text-indigo-600'
              >
                <X className='h-3 w-3' />
              </button>
            </span>
          )}
          {appliedFilters?.model && (
            <span className='inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'>
              Model: {appliedFilters.model}
              <button
                onClick={() => {
                  handleInputChange('model', '');
                  onApply({ ...filters, model: '' });
                }}
                className='ml-1 hover:text-indigo-600'
              >
                <X className='h-3 w-3' />
              </button>
            </span>
          )}
          {appliedFilters?.minCost && (
            <span className='inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'>
              Min Cost: ${appliedFilters.minCost}
              <button
                onClick={() => {
                  handleInputChange('minCost', '');
                  onApply({ ...filters, minCost: '' });
                }}
                className='ml-1 hover:text-indigo-600'
              >
                <X className='h-3 w-3' />
              </button>
            </span>
          )}
          {appliedFilters?.maxCost && (
            <span className='inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'>
              Max Cost: ${appliedFilters.maxCost}
              <button
                onClick={() => {
                  handleInputChange('maxCost', '');
                  onApply({ ...filters, maxCost: '' });
                }}
                className='ml-1 hover:text-indigo-600'
              >
                <X className='h-3 w-3' />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

