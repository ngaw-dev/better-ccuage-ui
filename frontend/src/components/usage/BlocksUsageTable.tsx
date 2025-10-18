import { useState, useMemo } from 'react';
import { UsageData } from '../../utils';
import { BlocksUsageFilters, BlocksUsageFilterValues } from './BlocksUsageFilters';
import { ChevronUp, ChevronDown, ChevronsUpDown, Settings2, FileX } from 'lucide-react';

interface BlocksUsageTableProps {
  data: NonNullable<UsageData['blocks']>;
}

type SortableField =
  | 'startTime'
  | 'endTime'
  | 'entries'
  | 'userPromptCount'
  | 'inputTokens'
  | 'outputTokens'
  | 'cacheReadTokens'
  | 'totalTokens'
  | 'costUSD';
type SortOrder = 'asc' | 'desc';

export function BlocksUsageTable({ data }: BlocksUsageTableProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortableField>('startTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [appliedFilters, setAppliedFilters] = useState<BlocksUsageFilterValues>({
    search: '',
    status: '',
    model: '',
    minCost: '',
    maxCost: '',
    minEntries: '',
    maxEntries: '',
  });

  const [localFilters, setLocalFilters] = useState<BlocksUsageFilterValues>({
    search: '',
    status: '',
    model: '',
    minCost: '',
    maxCost: '',
    minEntries: '',
    maxEntries: '',
  });

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const availableModels = useMemo(() => {
    const models = new Set<string>();
    data.forEach((block) => {
      block.models.forEach((model) => models.add(model));
    });
    return Array.from(models).sort();
  }, [data]);

  const handleSort = (column: SortableField) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
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

  const handleApplyFilters = (filters: BlocksUsageFilterValues) => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: BlocksUsageFilterValues = {
      search: '',
      status: '',
      model: '',
      minCost: '',
      maxCost: '',
      minEntries: '',
      maxEntries: '',
    };
    setAppliedFilters(clearedFilters);
    setLocalFilters(clearedFilters);
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    if (appliedFilters.search) {
      const searchLower = appliedFilters.search.toLowerCase();
      filtered = filtered.filter((block) => {
        return (
          block.id.toLowerCase().includes(searchLower) ||
          block.source.toLowerCase().includes(searchLower) ||
          block.startTime.toLowerCase().includes(searchLower) ||
          block.models.some((model) => model.toLowerCase().includes(searchLower)) ||
          block.entries.toString().includes(searchLower) ||
          block.userPromptCount.toString().includes(searchLower) ||
          block.totalTokens.toString().includes(searchLower) ||
          block.costUSD.toString().includes(searchLower)
        );
      });
    }

    if (appliedFilters.status) {
      filtered = filtered.filter((block) => {
        switch (appliedFilters.status) {
          case 'active':
            return block.isActive;
          case 'gap':
            return block.isGap;
          case 'completed':
            return !block.isActive && !block.isGap;
          default:
            return true;
        }
      });
    }

    if (appliedFilters.model) {
      filtered = filtered.filter((block) => block.models.includes(appliedFilters.model));
    }

    if (appliedFilters.minEntries) {
      const minEntries = parseInt(appliedFilters.minEntries);
      filtered = filtered.filter((block) => block.entries >= minEntries);
    }

    if (appliedFilters.maxEntries) {
      const maxEntries = parseInt(appliedFilters.maxEntries);
      filtered = filtered.filter((block) => block.entries <= maxEntries);
    }

    if (appliedFilters.minCost) {
      const minCost = parseFloat(appliedFilters.minCost);
      filtered = filtered.filter((block) => block.costUSD >= minCost);
    }

    if (appliedFilters.maxCost) {
      const maxCost = parseFloat(appliedFilters.maxCost);
      filtered = filtered.filter((block) => block.costUSD <= maxCost);
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'startTime':
          comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          break;
        case 'endTime':
          comparison =
            new Date(a.actualEndTime || a.endTime).getTime() - new Date(b.actualEndTime || b.endTime).getTime();
          break;
        case 'entries':
          comparison = a.entries - b.entries;
          break;
        case 'userPromptCount':
          comparison = a.userPromptCount - b.userPromptCount;
          break;
        case 'inputTokens':
          comparison = a.tokenCounts.inputTokens - b.tokenCounts.inputTokens;
          break;
        case 'outputTokens':
          comparison = a.tokenCounts.outputTokens - b.tokenCounts.outputTokens;
          break;
        case 'cacheReadTokens':
          comparison = a.tokenCounts.cacheReadInputTokens - b.tokenCounts.cacheReadInputTokens;
          break;
        case 'totalTokens':
          comparison = a.totalTokens - b.totalTokens;
          break;
        case 'costUSD':
          comparison = a.costUSD - b.costUSD;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [data, appliedFilters, sortBy, sortOrder]);

  const hasActiveFilters =
    appliedFilters.search ||
    appliedFilters.status ||
    appliedFilters.model ||
    appliedFilters.minCost ||
    appliedFilters.maxCost ||
    appliedFilters.minEntries ||
    appliedFilters.maxEntries;

  return (
    <div className='metric-card'>
      <div className='mb-4 flex flex-row items-center justify-between'>
        <h3 className='text-lg font-semibold'>Blocks Usage Report</h3>
        <button
          className='flex items-center justify-center gap-2 rounded-md bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-400 hover:text-white dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-700'
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Settings2 className='h-4 w-4' /> Filters
        </button>
      </div>

      {isFilterOpen && (
        <BlocksUsageFilters
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
                <th className='py-2 px-3'>Block ID</th>
                <th
                  className='cursor-pointer select-none py-2 px-3 hover:bg-gray-50 dark:hover:bg-slate-700'
                  onClick={() => handleSort('startTime')}
                >
                  <div className='flex items-center justify-between'>
                    <span>Start Time</span>
                    {getSortIcon('startTime')}
                  </div>
                </th>
                <th
                  className='cursor-pointer select-none py-2 px-3 hover:bg-gray-50 dark:hover:bg-slate-700'
                  onClick={() => handleSort('endTime')}
                >
                  <div className='flex items-center justify-between'>
                    <span>End Time</span>
                    {getSortIcon('endTime')}
                  </div>
                </th>
                <th className='py-2 px-3'>Status</th>
                <th
                  className='cursor-pointer select-none py-2 px-3 text-right hover:bg-gray-50 dark:hover:bg-slate-700'
                  onClick={() => handleSort('entries')}
                >
                  <div className='flex items-center justify-between'>
                    <span>Entries</span>
                    {getSortIcon('entries')}
                  </div>
                </th>
                <th
                  className='cursor-pointer select-none py-2 px-3 text-right hover:bg-gray-50 dark:hover:bg-slate-700'
                  onClick={() => handleSort('userPromptCount')}
                >
                  <div className='flex items-center justify-between'>
                    <span>Prompts</span>
                    {getSortIcon('userPromptCount')}
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
                  onClick={() => handleSort('costUSD')}
                >
                  <div className='flex items-center justify-between'>
                    <span>Cost (USD)</span>
                    {getSortIcon('costUSD')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((block, index) => (
                <tr
                  key={index}
                  className={`border-b last:border-0 hover:bg-muted/50 ${
                    block.isActive ? 'bg-green-50 dark:bg-green-950' : block.isGap ? 'bg-gray-50 dark:bg-gray-950' : ''
                  }`}
                >
                  <td className='py-2 px-3 font-medium max-w-xs truncate' title={block.id}>
                    Block {index + 1}
                  </td>
                  <td className='py-2 px-3 text-xs whitespace-nowrap'>{formatTime(block.startTime)}</td>
                  <td className='py-2 px-3 text-xs whitespace-nowrap'>
                    {formatTime(block.actualEndTime || block.endTime)}
                  </td>
                  <td className='py-2 px-3'>
                    {block.isActive && (
                      <span className='text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded'>
                        Active
                      </span>
                    )}
                    {block.isGap && (
                      <span className='text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 rounded'>
                        Gap
                      </span>
                    )}
                    {!block.isActive && !block.isGap && (
                      <span className='text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded'>
                        Completed
                      </span>
                    )}
                  </td>
                  <td className='py-2 px-3 text-right'>{block.entries.toLocaleString()}</td>
                  <td className='py-2 px-3 text-right'>{block.userPromptCount.toLocaleString()}</td>
                  <td className='py-2 px-3'>
                    <div className='flex flex-wrap gap-1'>
                      {block.models.map((model, idx) => (
                        <span key={idx} className='text-xs bg-primary/10 text-primary px-2 py-1 rounded'>
                          {model}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='py-2 px-3 text-right'>{block.tokenCounts.inputTokens.toLocaleString()}</td>
                  <td className='py-2 px-3 text-right'>{block.tokenCounts.outputTokens.toLocaleString()}</td>
                  <td className='py-2 px-3 text-right'>{block.tokenCounts.cacheReadInputTokens.toLocaleString()}</td>
                  <td className='py-2 px-3 text-right font-medium'>{block.totalTokens.toLocaleString()}</td>
                  <td className='py-2 px-3 text-right font-bold text-green-600'>${block.costUSD.toFixed(2)}</td>
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
                ? 'No blocks data matches your current filters. Try adjusting your search criteria.'
                : 'No blocks data available.'}
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
