import { create } from 'zustand';
import { UsageRecord, UsageStats, Provider } from '@shared/types';

interface UsageState {
  // Data
  records: UsageRecord[];
  stats: UsageStats | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  selectedProviders: Provider[];
  dateRange: {
    start: string;
    end: string;
  } | null;
  searchTerm: string;

  // UI State
  viewMode: 'overview' | 'detailed' | 'charts';
  selectedChart: 'cost' | 'tokens' | 'requests';

  // Actions
  setRecords: (records: UsageRecord[]) => void;
  setStats: (stats: UsageStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Filter actions
  setProviders: (providers: Provider[]) => void;
  setDateRange: (range: { start: string; end: string } | null) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;

  // UI actions
  setViewMode: (mode: 'overview' | 'detailed' | 'charts') => void;
  setSelectedChart: (chart: 'cost' | 'tokens' | 'requests') => void;
}

export const useUsageStore = create<UsageState>((set, _get) => ({
  // Initial state
  records: [],
  stats: null,
  isLoading: false,
  error: null,

  selectedProviders: [],
  dateRange: null,
  searchTerm: '',

  viewMode: 'overview',
  selectedChart: 'cost',

  // Actions
  setRecords: (records) => set({ records }),
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setProviders: (selectedProviders) => set({ selectedProviders }),
  setDateRange: (dateRange) => set({ dateRange }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  clearFilters: () => set({
    selectedProviders: [],
    dateRange: null,
    searchTerm: '',
  }),

  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedChart: (selectedChart) => set({ selectedChart }),
}));