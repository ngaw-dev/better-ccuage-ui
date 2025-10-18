import { UsageData } from '../../utils';
import {
  DailyUsageTable,
  UsageSummaryCards,
  MonthlyUsageTable,
  SessionUsageTable,
  BlocksUsageTable,
  CodexDailyUsageTable,
  CodexMonthlyUsageTable,
  UsageGraphs,
  BlocksUsageGraph,
} from '.';
import { formatTime, formatDuration } from '../../utils/locale';
import { useLocale } from '../../contexts/LocaleContext';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface UsageDisplayProps {
  usageData: UsageData;
  rawJsonData: UsageData | null;
  loading: boolean;
}

// Countdown Timer Component for Active Blocks
function BlocksCountdownTimer({ blocks }: { blocks: any[] }) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const activeBlock = blocks.find((block) => block.isActive);

    if (!activeBlock || !activeBlock.startTime) {
      setTimeRemaining('');
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const startTime = new Date(activeBlock.startTime);
      const limitTime = new Date(startTime.getTime() + 5 * 60 * 60 * 1000); // 5 hours in milliseconds

      const remainingMs = limitTime.getTime() - now.getTime();

      if (remainingMs <= 0) {
        setTimeRemaining('Limit reached');
        return;
      }

      const remainingSeconds = Math.floor(remainingMs / 1000);
      setTimeRemaining(formatDuration(remainingSeconds, { style: 'short' }));
    };

    calculateTimeRemaining();

    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [blocks, formatDuration]);

  const activeBlock = blocks.find((block) => block.isActive);

  if (!activeBlock || !timeRemaining) {
    return null;
  }

  return (
    <div className='metric-card border-blue-500 bg-blue-50 dark:bg-blue-950'>
      <div className='flex items-center justify-between'>
        {/* Left: Time Remaining */}
        <div className='flex items-center gap-3'>
          <div className='text-blue-600 dark:text-blue-400'>
            <Clock className='w-5 h-5' />
          </div>
          <div>
            <h3 className='text-sm font-medium text-blue-700 dark:text-blue-300 mb-1'>Active Block Time Remaining</h3>
            <p className='text-lg font-semibold text-blue-800 dark:text-blue-200'>{timeRemaining}</p>
          </div>
        </div>
        {/* Right: Start/End times */}
        <div className='flex flex-col gap-1 items-end text-right'>
          <span className='text-xs text-blue-800 dark:text-blue-200'>
            <span className='font-semibold'>Start:</span> {new Date(activeBlock.startTime).toLocaleString()}
          </span>
          <span className='text-xs text-blue-800 dark:text-blue-200'>
            <span className='font-semibold'>End:</span>{' '}
            {new Date(
              activeBlock.actualEndTime || new Date(new Date(activeBlock.startTime).getTime() + 5 * 60 * 60 * 1000)
            ).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function UsageDisplay({ usageData, rawJsonData, loading }: UsageDisplayProps) {
  return (
    <>
      {/* Usage Summary Cards */}
      {usageData?.totals && <UsageSummaryCards totals={usageData.totals} />}
      {/* Daily Usage Table and Cards */}
      {usageData?.daily && usageData.daily.length > 0 && (
        <div className='flex flex-col gap-6'>
          <UsageGraphs data={usageData.daily} itemKey='date' title='Daily Usage' />
          <DailyUsageTable data={usageData.daily} />
        </div>
      )}

      {/* Monthly Usage Table and Cards */}
      {usageData?.monthly && usageData.monthly.length > 0 && (
        <div className='flex flex-col gap-6'>
          <UsageGraphs data={usageData.monthly} itemKey='month' title='Monthly Usage' />
          <MonthlyUsageTable data={usageData.monthly} />
        </div>
      )}

      {/* Session Usage Table and Cards */}
      {usageData?.sessions && usageData.sessions.length > 0 && (
        <div className='flex flex-col gap-6'>
          <UsageGraphs data={usageData.sessions} itemKey='startTime' title='Session Usage' />
          <SessionUsageTable data={usageData.sessions} />
        </div>
      )}

      {/* Blocks Usage Table and Cards */}
      {usageData?.blocks && usageData.blocks.length > 0 && (
        <div className='flex flex-col gap-6'>
          {/* Countdown Timer for Active Blocks */}
          <BlocksCountdownTimer blocks={usageData.blocks} />
          <BlocksUsageGraph data={usageData.blocks} itemKey='startTime' title='Blocks Usage' />
          <BlocksUsageTable data={usageData.blocks} />
        </div>
      )}

      {/* Codex Daily Usage Table and Cards */}
      {usageData?.codexDaily && usageData.codexDaily.length > 0 && (
        <div className='flex flex-col gap-6'>
          <UsageGraphs data={usageData.codexDaily} itemKey='date' title='Codex Daily Usage' />
          <CodexDailyUsageTable data={usageData.codexDaily} />
        </div>
      )}

      {/* Codex Monthly Usage Table and Cards */}
      {usageData?.codexMonthly && usageData.codexMonthly.length > 0 && (
        <div className='flex flex-col gap-6'>
          <UsageGraphs data={usageData.codexMonthly} itemKey='month' title='Codex Monthly Usage' />
          <CodexMonthlyUsageTable data={usageData.codexMonthly} />
        </div>
      )}

      {/* Raw JSON Data Display (Collapsible) */}
      {rawJsonData && !loading && (
        <details className='metric-card'>
          <summary className='cursor-pointer text-lg font-semibold mb-4'>
            Raw MCP Server Response (Click to expand)
          </summary>
          <pre className='bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm'>
            {JSON.stringify(rawJsonData, null, 2)}
          </pre>
        </details>
      )}
    </>
  );
}
