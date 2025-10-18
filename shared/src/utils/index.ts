/**
 * Shared utilities for better-ccusage-ui
 */

import { UsageRecord, Provider, ChartDataPoint, CostBreakdown } from '../types';

/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format token numbers with appropriate unit
 */
export const formatTokens = (tokens: number): string => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
};

/**
 * Format date strings
 */
export const formatDate = (dateString: string, format: 'short' | 'long' = 'short'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: format === 'long' ? 'numeric' : '2-digit',
    month: format === 'long' ? 'long' : 'short',
    day: 'numeric',
  });
};

/**
 * Group records by date
 */
export const groupByDate = (records: UsageRecord[]): Record<string, UsageRecord[]> => {
  return records.reduce((acc, record) => {
    const date = record.timestamp.split('T')[0];
    if (date && !acc[date]) {
      acc[date] = [];
    }
    if (date) {
      acc[date]!.push(record);
    }
    return acc;
  }, {} as Record<string, UsageRecord[]>);
};

/**
 * Calculate cost breakdown by provider
 */
export const calculateCostBreakdown = (records: UsageRecord[]): CostBreakdown[] => {
  const providerStats = records.reduce((acc, record) => {
    if (!acc[record.provider]) {
      acc[record.provider] = {
        totalCost: 0,
        totalTokens: 0,
      };
    }
    acc[record.provider].totalCost += record.cost;
    acc[record.provider].totalTokens += record.totalTokens;
    return acc;
  }, {} as Record<Provider, { totalCost: number; totalTokens: number }>);

  const totalCost = Object.values(providerStats).reduce((sum, stat) => sum + stat.totalCost, 0);

  return Object.entries(providerStats).map(([provider, stats]) => ({
    provider: provider as Provider,
    totalCost: stats.totalCost,
    totalTokens: stats.totalTokens,
    percentage: totalCost > 0 ? (stats.totalCost / totalCost) * 100 : 0,
  }));
};

/**
 * Process usage data for charts
 */
export const processChartData = (
  records: UsageRecord[],
  metric: 'cost' | 'tokens' | 'requests'
): ChartDataPoint[] => {
  const grouped = groupByDate(records);

  return Object.entries(grouped).map(([date, dayRecords]) => {
    let value = 0;

    switch (metric) {
      case 'cost':
        value = dayRecords.reduce((sum, record) => sum + record.cost, 0);
        break;
      case 'tokens':
        value = dayRecords.reduce((sum, record) => sum + record.totalTokens, 0);
        break;
      case 'requests':
        value = dayRecords.length;
        break;
    }

    return { date, value };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Parse JSONL content
 */
export const parseJSONL = (content: string): any[] => {
  const lines = content.trim().split('\n');
  const results = [];

  for (const line of lines) {
    if (line.trim()) {
      try {
        results.push(JSON.parse(line));
      } catch (error) {
        console.warn('Failed to parse JSONL line:', line, error);
      }
    }
  }

  return results;
};

/**
 * Validate and convert raw data to UsageRecord
 */
export const validateUsageRecord = (raw: any): UsageRecord | null => {
  try {
    // Basic validation - in a real implementation, this would use Zod
    if (!raw.timestamp || !raw.provider || raw.totalTokens === undefined) {
      return null;
    }

    return {
      id: raw.id || Math.random().toString(36).substr(2, 9),
      timestamp: raw.timestamp,
      provider: raw.provider,
      model: raw.model || 'unknown',
      promptTokens: raw.promptTokens || 0,
      completionTokens: raw.completionTokens || 0,
      totalTokens: raw.totalTokens,
      cost: raw.cost || 0,
      project: raw.project,
      endpoint: raw.endpoint,
      metadata: raw.metadata,
    };
  } catch {
    return null;
  }
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};