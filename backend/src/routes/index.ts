import { Router } from 'express';
import { uploadRouter } from './upload';
import { analyticsRouter } from './analytics';
import { mcpProxyRouter } from './mcp-proxy';

export const apiRouter = Router();

// Mount route modules
apiRouter.use('/upload', uploadRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/mcp', mcpProxyRouter);

// API info endpoint
apiRouter.get('/', (req, res) => {
  res.json({
    message: 'better-ccusage-ui API',
    version: '1.0.0',
    endpoints: {
      upload: '/api/upload',
      analytics: '/api/analytics',
      mcp: '/api/mcp',
    },
  });
});
