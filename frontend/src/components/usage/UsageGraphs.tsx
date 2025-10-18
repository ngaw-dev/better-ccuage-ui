/**
 * Daily Chart Component
 * Displays daily usage data in a visual chart format
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ChartNoAxesCombined } from 'lucide-react';
import { formatDate, formatCurrency, formatNumber, formatDateTime } from '../../utils/locale';

interface DailyUsageData {
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  totalTokens: number;
  modelsUsed: string[];
  cacheReadTokens: number;
  cacheCreationTokens: number;
}

interface ChartDataPoint {
  name: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  originalDate: string;
}

export interface UsageGraphsProps {
  data?: DailyUsageData[];
  loading?: boolean;
  error?: string;
  itemKey: string;
}

export const UsageGraphs: React.FC<UsageGraphsProps> = ({ data, loading = false, error, itemKey }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }
    console.log(data);

    const formattedData = data.map((item, index) => {
      const dateValue = item[itemKey as keyof typeof item] as string;
      let formattedName = dateValue || (index + 1).toString();

      // Format the name based on the data type
      if (itemKey === 'date') {
        formattedName = dateValue ? formatDate(dateValue, { dateStyle: 'medium' }) : 'Unknown Date';
      } else if (itemKey === 'month') {
        formattedName = dateValue ? formatDate(dateValue + '-01', { dateStyle: 'short' }) : 'Unknown Month';
      } else if (dateValue && dateValue.includes('T')) {
        // It's a datetime
        formattedName = formatDateTime(dateValue, {
          dateStyle: 'short',
          timeStyle: 'short',
        });
      }

      return {
        name: formattedName || (index + 1).toString(),
        inputTokens: item.inputTokens,
        outputTokens: item.outputTokens,
        cost: item.totalCost,
        originalDate: dateValue || (index + 1).toString(), // Keep original for formatting
      };
    });

    setChartData(formattedData);
  }, [data, itemKey]);

  const formatTick = (value: number) => {
    if (value >= 1000000) {
      return `${formatNumber(value / 1000000, { maximumFractionDigits: 1 })}M`;
    }
    if (value >= 1000) {
      return `${formatNumber(value / 1000, { maximumFractionDigits: 1 })}K`;
    }
    return formatNumber(value);
  };

  // Show loading state
  if (loading) {
    return (
      <div className='p-4 border rounded-lg'>
        <h3 className='text-lg font-semibold mb-4'>Usage Graphs</h3>
        <div className='flex items-center justify-center h-96 bg-muted/20 rounded'>
          <p className='text-muted-foreground'>Loading chart...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='p-4 border rounded-lg border-red-500'>
        <h3 className='text-lg font-semibold mb-4 text-red-600'>Usage Graphs</h3>
        <div className='flex items-center justify-center h-96 bg-red-50 dark:bg-red-950 rounded'>
          <p className='text-red-600'>{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!chartData || chartData.length === 0) {
    return (
      <div className='p-4 border rounded-lg'>
        <h3 className='text-lg font-semibold mb-4'>Usage Graphs</h3>
        <div className='flex items-center justify-center h-96 bg-muted/20 rounded'>
          <p className='text-muted-foreground'>No data available</p>
        </div>
      </div>
    );
  }

  // If only one data point, show a bar chart
  if (chartData.length === 1) {
    return (
      <div className='p-4 border rounded-lg'>
        <h3 className='text-lg font-semibold mb-4'>Usage Graphs</h3>
        <div className='flex flex-col items-center justify-center h-96 bg-muted/20 rounded'>
          <p className='text-muted-foreground mb-4'>Single data point, cannot show a chart</p>
          <ChartNoAxesCombined className='w-32 h-32 text-muted-foreground' />
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 border rounded-lg'>
      <div className='flex flex-row justify-between gap-4'>
        <div className='w-1/2 h-96 bg-muted/20 rounded p-4'>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis scale='log' domain={['auto', 'auto']} tickFormatter={(value) => formatTick(value)} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  let formattedValue = formatNumber(value);
                  if (name.includes('Tokens')) {
                    formattedValue = formatNumber(value);
                  }
                  return [formattedValue, name];
                }}
                labelFormatter={(label: string) => {
                  // Find the original data point to show proper date format
                  const dataPoint = chartData.find(d => d.name === label);
                  if (dataPoint?.originalDate && dataPoint.originalDate !== 'Unknown') {
                    if (itemKey === 'date') {
                      return formatDate(dataPoint.originalDate, { dateStyle: 'long' });
                    } else if (itemKey === 'month') {
                      return formatDate(dataPoint.originalDate + '-01', { dateStyle: 'long' });
                    }
                  }
                  return label;
                }}
              />
              <Area
                type='monotone'
                dataKey='inputTokens'
                stroke='#EF7722'
                fill='#EF7722'
                fillOpacity={0.5}
                name='Input Tokens'
              />
              <Area
                type='monotone'
                dataKey='outputTokens'
                stroke='#0BA6DF'
                fill='#0BA6DF'
                fillOpacity={0.6}
                name='Output Tokens'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className='w-1/2 h-96 bg-muted/20 rounded p-4'>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis
                tickCount={5}
                title='Cost in USD'
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(label: string) => {
                  // Find the original data point to show proper date format
                  const dataPoint = chartData.find(d => d.name === label);
                  if (dataPoint?.originalDate && dataPoint.originalDate !== 'Unknown') {
                    if (itemKey === 'date') {
                      return formatDate(dataPoint.originalDate, { dateStyle: 'long' });
                    } else if (itemKey === 'month') {
                      return formatDate(dataPoint.originalDate + '-01', { dateStyle: 'long' });
                    }
                  }
                  return label;
                }}
              />
              <Legend />
              <Bar dataKey='cost' fill='#5A9690' name='Cost in USD' />
              {/* Average line for cost */}
              <ReferenceLine
                y={chartData.reduce((sum, entry) => sum + (entry.cost || 0), 0) / (chartData.length || 1)}
                stroke='#542c13'
                opacity={0.5}
                strokeDasharray='4 4'
                ifOverflow='visible'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
