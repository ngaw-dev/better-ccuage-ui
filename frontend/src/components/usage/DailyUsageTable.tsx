import { useState, useMemo } from 'react';
import { UsageData } from '../../utils';
import { formatDate, formatNumber, formatCurrency } from '../../utils/locale';
import { useLocale } from '../../contexts/LocaleContext';
import { DailyUsageFilters, DailyUsageFilterValues } from './DailyUsageFilters';
import { ChevronUp, ChevronDown, ChevronsUpDown, Settings2, FileX } from 'lucide-react';

interface DailyUsageTableProps {
  data: NonNullable<UsageData['daily']>;
}

type SortableField = 'date' | 'inputTokens' | 'outputTokens' | 'cacheReadTokens' | 'totalTokens' | 'totalCost';
type SortOrder = 'asc' | 'desc';

export function DailyUsageTable({ data }: DailyUsageTableProps) {
  const { locale } = useLocale();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortableField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Applied filter states (used for display)
  const [appliedFilters, setAppliedFilters] = useState<DailyUsageFilterValues>({
    search: '',
    date: '',
    model: '',
    minCost: '',
    maxCost: '',
  });

  // Local filter states (for form inputs before apply)
  const [localFilters, setLocalFilters] = useState<DailyUsageFilterValues>({
    search: '',
    date: '',
    model: '',
    minCost: '',
    maxCost: '',
  });

  // Get available models from data
  const availableModels = useMemo(() => {
    const models = new Set<string>();
    data.forEach((day) => {
      day.modelsUsed.forEach((model) => models.add(model));
    });
    return Array.from(models).sort();
  }, [data]);

  const handleSort = (column: SortableField) => {
    if (sortBy === column) {
      // If clicking the same column, toggle the order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a different column, set it as sortBy and default to asc
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: SortableField) => {
    if (sortBy !== column) {
      return <ChevronsUpDown className='h-4 w-4 text-gray-400' />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className='h-4 w-4 text-blue-600' />
    ) : (
      <ChevronDown className='h-4 w-4 text-blue-600' />
    );
  };

  const handleApplyFilters = (filters: DailyUsageFilterValues) => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: DailyUsageFilterValues = {
      search: '',
      date: '',
      model: '',
      minCost: '',
      maxCost: '',
    };
    setAppliedFilters(clearedFilters);
    setLocalFilters(clearedFilters);
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Apply filters
    if (appliedFilters.search) {
      const searchLower = appliedFilters.search.toLowerCase();
      filtered = filtered.filter((day) => {
        return (
          day.date.toLowerCase().includes(searchLower) ||
          day.modelsUsed.some((model) => model.toLowerCase().includes(searchLower)) ||
          day.inputTokens.toString().includes(searchLower) ||
          day.outputTokens.toString().includes(searchLower) ||
          day.totalTokens.toString().includes(searchLower) ||
          day.totalCost.toString().includes(searchLower)
        );
      });
    }

    if (appliedFilters.date) {
      filtered = filtered.filter((day) => day.date === appliedFilters.date);
    }

    if (appliedFilters.model) {
      filtered = filtered.filter((day) => day.modelsUsed.includes(appliedFilters.model));
    }

    if (appliedFilters.minCost) {
      const minCost = parseFloat(appliedFilters.minCost);
      filtered = filtered.filter((day) => day.totalCost >= minCost);
    }

    if (appliedFilters.maxCost) {
      const maxCost = parseFloat(appliedFilters.maxCost);
      filtered = filtered.filter((day) => day.totalCost <= maxCost);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'inputTokens':
          comparison = a.inputTokens - b.inputTokens;
          break;
        case 'outputTokens':
          comparison = a.outputTokens - b.outputTokens;
          break;
        case 'cacheReadTokens':
          comparison = a.cacheReadTokens - b.cacheReadTokens;
          break;
        case 'totalTokens':
          comparison = a.totalTokens - b.totalTokens;
          break;
        case 'totalCost':
          comparison = a.totalCost - b.totalCost;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [data, appliedFilters, sortBy, sortOrder]);

  const hasActiveFilters =
    appliedFilters.search ||
    appliedFilters.date ||
    appliedFilters.model ||
    appliedFilters.minCost ||
    appliedFilters.maxCost;

  return (
    <div className='metric-card'>
      <div className='mb-4 flex flex-row items-center justify-between'>
        <h3 className='text-lg font-semibold'>Daily Usage Report</h3>
        <button
          className='flex items-center justify-center gap-2 rounded-md bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-400 hover:text-white dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-700'
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Settings2 className='h-4 w-4' /> Filters
        </button>
      </div>

      {isFilterOpen && (
        <DailyUsageFilters
          filters={localFilters}
          appliedFilters={appliedFilters}
          onChange={setLocalFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          availableModels={availableModels}
        />
      )}

      <div className='overflow-x-auto'>
        {filteredAndSortedData.length > 0 ? (
          <table className='w-full text-sm'>
            <thead className='border-b'>
              <tr className='text-left'>
                <th
                  className='cursor-pointer select-none py-2 px-3 hover:bg-gray-50 dark:hover:bg-slate-700'
                  onClick={() => handleSort('date')}
                >
                  <div className='flex items-center justify-between'>
                    <span>Date</span>
                    {getSortIcon('date')}
                  </div>
                </th>
                <th className='py-2 px-3'>Models</th>
                <th
                  className='cursor-pointer select-none py-2 px-3 text-right hover:bg-gray-50 dark:hover:bg-slate-700'
                  onClick={() => handleSort('inputTokens')}
                >
                  <div className='flex items-center justify-between'>
                    <span>Input Tokens</span>
                    {getSortIcon('inputTokens')}
                  </div>
                </th>
                <th
                  className='cursor-pointer select-none py-2 px-3 text-right hover:bg-gray-50 dark:hover:bg-slate-700'
                  onClick={() => handleSort('outputTokens')}
                >
                  <div className='flex items-center justify-between'>
                    <span>Output Tokens</span>
                    {getSortIcon('outputTokens')}
                  </div>
                </th>
                <th
                  className='cursor-pointer select-none py-2 px-3 text-right hover:bg-gray-50 dark:hover:bg-slate-700'
                  onClick={() => handleSort('cacheReadTokens')}
                >
                  <div className='flex items-center justify-between'>
                    <span>Cache Read</span>
                    {getSortIcon('cacheReadTokens')}
                  </div>
                </th>
                <th
                  className='cursor-pointer select-none py-2 px-3 text-right hover:bg-gray-50 dark:hover:bg-slate-700'
                  onClick={() => handleSort('totalTokens')}
                >
                  <div className='flex items-center justify-between'>
                    <span>Total Tokens</span>
                    {getSortIcon('totalTokens')}
                  </div>
                </th>
                <th
                  className='cursor-pointer select-none py-2 px-3 text-right hover:bg-gray-50 dark:hover:bg-slate-700'
                  onClick={() => handleSort('totalCost')}
                >
                  <div className='flex items-center justify-between'>
                    <span>Cost (USD)</span>
                    {getSortIcon('totalCost')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((day, index) => (
                <tr key={index} className='border-b last:border-0 hover:bg-muted/50'>
                  <td className='py-2 px-3 font-medium'>{formatDate(day.date, { localeConfig: locale })}</td>
                  <td className='py-2 px-3'>
                    <div className='flex flex-wrap gap-1'>
                      {day.modelsUsed.map((model, idx) => (
                        <span key={idx} className='text-xs bg-primary/10 text-primary px-2 py-1 rounded'>
                          {model}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='py-2 px-3 text-right'>{formatNumber(day.inputTokens, { localeConfig: locale })}</td>
                  <td className='py-2 px-3 text-right'>{formatNumber(day.outputTokens, { localeConfig: locale })}</td>
                  <td className='py-2 px-3 text-right'>
                    {formatNumber(day.cacheReadTokens, { localeConfig: locale })}
                  </td>
                  <td className='py-2 px-3 text-right font-medium'>
                    {formatNumber(day.totalTokens, { localeConfig: locale })}
                  </td>
                  <td className='py-2 px-3 text-right font-bold text-green-600'>
                    {formatCurrency(day.totalCost, 'USD', { localeConfig: locale })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <FileX className='mx-auto mb-4 h-16 w-16 text-gray-400' />
            <h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-gray-100'>No data found</h3>
            <p className='mb-4 text-sm text-gray-500 dark:text-gray-400'>
              {hasActiveFilters
                ? 'No usage data matches your current filters. Try adjusting your search criteria.'
                : 'No usage data available for this period.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className='inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                <Settings2 className='h-4 w-4' />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
