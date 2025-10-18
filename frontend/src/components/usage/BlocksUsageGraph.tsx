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

interface BlocksUsageData {
  startTime: string;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  totalTokens: number;
  blockType: string;
}

interface BlocksUsageGraphData {
  name: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface BlocksUsageGraphProps {
  data?: BlocksUsageData[];
  loading?: boolean;
  error?: string;
  itemKey: string;
}

export const BlocksUsageGraph: React.FC<BlocksUsageGraphProps> = ({ data, loading = false, error, itemKey }) => {
  const [chartData, setChartData] = useState<BlocksUsageGraphData[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }
    console.log(data);

    let index = 0;
    const formattedData = data
      .map((item) => {
        if (!item.isGap) {
          index++;
          return {
            name: index,
            inputTokens: item.tokenCounts.inputTokens,
            outputTokens: item.tokenCounts.outputTokens,
            cost: item.costUSD,
          };
        }
        return null;
      })
      .filter((item): item is BlocksUsageGraphData => item !== null);

    setChartData(formattedData);
  }, [data]);

  const formatTick = (value: number) => {
    if (value >= 1000000) {
      return `${value / 1000000}M`;
    }
    if (value >= 1000) {
      return `${value / 1000}K`;
    }
    return value.toString();
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
              <Tooltip formatter={(value: number, name: string) => [`${value.toLocaleString()}`, name]} />
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
              <YAxis tickCount={5} title='Cost in USD' tickFormatter={(value) => '$' + `${value.toFixed(2)}`} />
              <Tooltip formatter={(value: number, name: string) => ['$' + `${value.toFixed(2)}`, name]} />
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
