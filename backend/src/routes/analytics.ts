import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AnalyticsService } from '../services/analytics';
import { ApiResponse, UsageStats, Provider } from '@better-ccusage-ui/shared';

const analyticsRouter = Router();

// Query schema validation
const AnalyticsQuerySchema = z.object({
  providers: z.array(z.enum(['anthropic', 'zai', 'glm'])).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

// GET /api/analytics/stats - Get usage statistics
analyticsRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const query = AnalyticsQuerySchema.parse(req.query);
    const analyticsService = new AnalyticsService();

    const stats: UsageStats = await analyticsService.getUsageStats({
      providers: query.providers as Provider[],
      startDate: query.startDate,
      endDate: query.endDate,
    });

    res.json({
      success: true,
      data: stats,
      message: 'Usage statistics retrieved successfully',
    } as ApiResponse<UsageStats>);

  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse<never>);
  }
});

// GET /api/analytics/trends - Get usage trends over time
analyticsRouter.get('/trends', async (req: Request, res: Response) => {
  try {
    const query = AnalyticsQuerySchema.parse(req.query);
    const analyticsService = new AnalyticsService();

    const trends = await analyticsService.getUsageTrends({
      providers: query.providers as Provider[],
      startDate: query.startDate,
      endDate: query.endDate,
    });

    res.json({
      success: true,
      data: trends,
      message: 'Usage trends retrieved successfully',
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Analytics trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse<never>);
  }
});

// GET /api/analytics/providers - Get provider breakdown
analyticsRouter.get('/providers', async (req: Request, res: Response) => {
  try {
    const query = AnalyticsQuerySchema.parse(req.query);
    const analyticsService = new AnalyticsService();

    const breakdown = await analyticsService.getProviderBreakdown({
      providers: query.providers as Provider[],
      startDate: query.startDate,
      endDate: query.endDate,
    });

    res.json({
      success: true,
      data: breakdown,
      message: 'Provider breakdown retrieved successfully',
    } as ApiResponse<any>);

  } catch (error) {
    console.error('Analytics providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse<never>);
  }
});

export { analyticsRouter };