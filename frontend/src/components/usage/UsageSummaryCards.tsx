import { UsageData } from '../../utils';

interface UsageSummaryCardsProps {
  totals: NonNullable<UsageData['totals']>;
}

export function UsageSummaryCards({ totals }: UsageSummaryCardsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      <div className='metric-card'>
        <h3 className='text-sm font-medium text-muted-foreground mb-2'>Total Cost</h3>
        <p className='text-2xl font-bold'>${totals.totalCost.toFixed(2)}</p>
      </div>
      <div className='metric-card'>
        <h3 className='text-sm font-medium text-muted-foreground mb-2'>Total Tokens</h3>
        <p className='text-2xl font-bold'>{totals.totalTokens.toLocaleString()}</p>
      </div>
      <div className='metric-card'>
        <h3 className='text-sm font-medium text-muted-foreground mb-2'>Cache Read Tokens</h3>
        <p className='text-2xl font-bold'>{totals.cacheReadTokens.toLocaleString()}</p>
      </div>
    </div>
  );
}

