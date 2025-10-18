/**
 * Shared types for better-ccusage-ui
 */

import { z } from 'zod';

// Provider types
export const ProviderSchema = z.enum(['anthropic', 'zai', 'glm']);
export type Provider = z.infer<typeof ProviderSchema>;

// Usage record schema
export const UsageRecordSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  provider: ProviderSchema,
  model: z.string(),
  promptTokens: z.number().nonnegative(),
  completionTokens: z.number().nonnegative(),
  totalTokens: z.number().nonnegative(),
  cost: z.number().nonnegative(),
  project: z.string().optional(),
  endpoint: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type UsageRecord = z.infer<typeof UsageRecordSchema>;

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  provider?: Provider;
  model?: string;
}

export interface CostBreakdown {
  provider: Provider;
  totalCost: number;
  totalTokens: number;
  percentage: number;
}

export interface UsageStats {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  costByProvider: CostBreakdown[];
  dailyUsage: ChartDataPoint[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// File processing types
export interface FileProcessingResult {
  records: UsageRecord[];
  totalRecords: number;
  processingTime: number;
  errors: string[];
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  providers?: Provider[];
  includeMetadata?: boolean;
}