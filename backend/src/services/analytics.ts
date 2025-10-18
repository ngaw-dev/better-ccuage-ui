import { UsageStats, Provider, CostBreakdown, ChartDataPoint } from '@better-ccusage-ui/shared';

interface AnalyticsQuery {
  providers?: Provider[];
  startDate?: string;
  endDate?: string;
}

export class AnalyticsService {
  private mockRecords: any[] = []; // In a real app, this would come from a database

  constructor() {
    // Initialize with some mock data for demonstration
    this.generateMockData();
  }

  /**
   * Get overall usage statistics
   */
  async getUsageStats(query: AnalyticsQuery): Promise<UsageStats> {
    const filteredRecords = this.filterRecords(this.mockRecords, query);

    const totalCost = filteredRecords.reduce((sum, record) => sum + record.cost, 0);
    const totalTokens = filteredRecords.reduce((sum, record) => sum + record.totalTokens, 0);
    const totalRequests = filteredRecords.length;

    const costByProvider = this.calculateCostBreakdown(filteredRecords);
    const dailyUsage = this.calculateDailyUsage(filteredRecords, 'cost');

    return {
      totalCost,
      totalTokens,
      totalRequests,
      costByProvider,
      dailyUsage,
    };
  }

  /**
   * Get usage trends over time
   */
  async getUsageTrends(query: AnalyticsQuery): Promise<{
    cost: ChartDataPoint[];
    tokens: ChartDataPoint[];
    requests: ChartDataPoint[];
  }> {
    const filteredRecords = this.filterRecords(this.mockRecords, query);

    return {
      cost: this.calculateDailyUsage(filteredRecords, 'cost'),
      tokens: this.calculateDailyUsage(filteredRecords, 'tokens'),
      requests: this.calculateDailyUsage(filteredRecords, 'requests'),
    };
  }

  /**
   * Get provider breakdown statistics
   */
  async getProviderBreakdown(query: AnalyticsQuery): Promise<{
    providers: CostBreakdown[];
    models: Array<{
      provider: Provider;
      model: string;
      totalCost: number;
      totalTokens: number;
      requestCount: number;
    }>;
  }> {
    const filteredRecords = this.filterRecords(this.mockRecords, query);

    const providers = this.calculateCostBreakdown(filteredRecords);
    const models = this.calculateModelBreakdown(filteredRecords);

    return { providers, models };
  }

  /**
   * Filter records based on query parameters
   */
  private filterRecords(records: any[], query: AnalyticsQuery): any[] {
    return records.filter(record => {
      // Provider filter
      if (query.providers && query.providers.length > 0) {
        if (!query.providers.includes(record.provider)) {
          return false;
        }
      }

      // Date range filter
      if (query.startDate) {
        const recordDate = new Date(record.timestamp);
        const startDate = new Date(query.startDate);
        if (recordDate < startDate) {
          return false;
        }
      }

      if (query.endDate) {
        const recordDate = new Date(record.timestamp);
        const endDate = new Date(query.endDate);
        if (recordDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Calculate cost breakdown by provider
   */
  private calculateCostBreakdown(records: any[]): CostBreakdown[] {
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
  }

  /**
   * Calculate daily usage for a specific metric
   */
  private calculateDailyUsage(records: any[], metric: 'cost' | 'tokens' | 'requests'): ChartDataPoint[] {
    const dailyData = records.reduce((acc, record) => {
      const date = record.timestamp.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          cost: 0,
          tokens: 0,
          requests: 0,
        };
      }

      acc[date].cost += record.cost;
      acc[date].tokens += record.totalTokens;
      acc[date].requests += 1;

      return acc;
    }, {} as Record<string, { cost: number; tokens: number; requests: number }>);

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        value: data[metric],
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Calculate model breakdown statistics
   */
  private calculateModelBreakdown(records: any[]): Array<{
    provider: Provider;
    model: string;
    totalCost: number;
    totalTokens: number;
    requestCount: number;
  }> {
    const modelStats = records.reduce((acc, record) => {
      const key = `${record.provider}:${record.model}`;
      if (!acc[key]) {
        acc[key] = {
          provider: record.provider,
          model: record.model,
          totalCost: 0,
          totalTokens: 0,
          requestCount: 0,
        };
      }

      acc[key].totalCost += record.cost;
      acc[key].totalTokens += record.totalTokens;
      acc[key].requestCount += 1;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(modelStats).sort((a, b) => b.totalCost - a.totalCost);
  }

  /**
   * Generate mock data for demonstration
   */
  private generateMockData(): void {
    const providers: Provider[] = ['anthropic', 'zai', 'glm'];
    const models = {
      anthropic: ['claude-3-sonnet', 'claude-3-haiku'],
      zai: ['gpt-4', 'gpt-3.5-turbo'],
      glm: ['glm-4', 'glm-4.5', 'glm-4.6'],
    };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 1000; i++) {
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const modelList = models[provider];
      const model = modelList[Math.floor(Math.random() * modelList.length)];

      const timestamp = new Date(
        thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
      );

      const promptTokens = Math.floor(Math.random() * 10000) + 1000;
      const completionTokens = Math.floor(Math.random() * 5000) + 500;
      const totalTokens = promptTokens + completionTokens;

      // Different cost rates per provider
      const costPerToken = provider === 'anthropic' ? 0.00003 : provider === 'zai' ? 0.00002 : 0.00001;
      const cost = totalTokens * costPerToken;

      this.mockRecords.push({
        id: `record-${i}`,
        timestamp: timestamp.toISOString(),
        provider,
        model,
        promptTokens,
        completionTokens,
        totalTokens,
        cost: parseFloat(cost.toFixed(6)),
        project: `project-${Math.floor(Math.random() * 5) + 1}`,
        endpoint: `/v1/${model}`,
      });
    }
  }
}