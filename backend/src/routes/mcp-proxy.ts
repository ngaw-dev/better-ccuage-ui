import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

/**
 * Proxy endpoint to forward requests to the MCP server
 * This avoids CORS issues when calling the MCP server directly from the browser
 */
router.post('/call', async (req: Request, res: Response) => {
  try {
    const { serverUrl, ...mcpRequest } = req.body;

    if (!serverUrl) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'serverUrl is required',
      });
    }

    // Forward the request to the MCP server
    const response = await axios.post(serverUrl, mcpRequest, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
    });

    // Return the MCP server's response
    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        error: 'MCP Server Error',
        message: error.message,
        details: error.response?.data,
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to proxy request to MCP server',
    });
  }
});

export const mcpProxyRouter = router;

