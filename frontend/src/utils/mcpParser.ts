/**
 * Utility functions for parsing MCP (Model Context Protocol) server responses
 * Handles both event-stream format and standard JSON-RPC responses
 */

export interface UsageData {
  daily?: Array<{
    date: string;
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    totalTokens: number;
    totalCost: number;
    modelsUsed: string[];
    modelBreakdowns?: Array<{
      modelName: string;
      inputTokens: number;
      outputTokens: number;
      cacheCreationTokens: number;
      cacheReadTokens: number;
      cost: number;
    }>;
  }>;
  monthly?: Array<{
    month: string;
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    totalTokens: number;
    totalCost: number;
    modelsUsed: string[];
  }>;
  session?: Array<{
    sessionId: string;
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    totalTokens: number;
    totalCost: number;
    lastActivity: string;
    projectPath: string;
    modelsUsed: string[];
    modelBreakdowns?: Array<{
      modelName: string;
      inputTokens: number;
      outputTokens: number;
      cacheCreationTokens: number;
      cacheReadTokens: number;
      cost: number;
    }>;
  }>;
  totals?: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    totalCost: number;
    totalTokens: number;
  };
  blocks?: Array<{
    id: string;
    startTime: string;
    endTime: string;
    actualEndTime: string | null;
    isActive: boolean;
    isGap: boolean;
    source: string;
    entries: number;
    userPromptCount: number;
    tokenCounts: {
      inputTokens: number;
      outputTokens: number;
      cacheCreationInputTokens: number;
      cacheReadInputTokens: number;
    };
    totalTokens: number;
    costUSD: number;
    models: string[];
    burnRate: {
      tokensPerMinute: number;
      tokensPerMinuteForIndicator: number;
      costPerHour: number;
    } | null;
    projection: {
      totalTokens: number;
      totalCost: number;
      remainingMinutes: number;
    } | null;
  }>;
  codexDaily?: Array<{
    date: string;
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    totalTokens: number;
    totalCost: number;
    modelsUsed: string[];
    modelBreakdowns?: Array<{
      modelName: string;
      inputTokens: number;
      outputTokens: number;
      cacheCreationTokens: number;
      cacheReadTokens: number;
      cost: number;
    }>;
  }>;
  codexMonthly?: Array<{
    month: string;
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    totalTokens: number;
    totalCost: number;
    modelsUsed: string[];
  }>;
}

export interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: {
    content?: Array<{
      type: string;
      text: string;
    }>;
    isError?: boolean;
  };
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Parse MCP server response and extract usage data
 * Handles multiple response formats:
 * 1. Event-stream format (event: message\ndata: {...})
 * 2. Standard JSON-RPC with nested text field
 * 3. Direct UsageData object
 */
export function parseMCPResponse(responseData: unknown): UsageData | null {
  try {
    // Handle event-stream format
    if (typeof responseData === 'string' && responseData.startsWith('event: message')) {
      return parseEventStreamResponse(responseData);
    }

    // Handle standard JSON-RPC response with nested text field
    if (responseData?.result?.content?.[0]?.text) {
      return parseJSONRPCResponse(responseData);
    }

    // Handle direct UsageData object (fallback)
    if (responseData?.daily || responseData?.monthly || responseData?.session) {
      return responseData as UsageData;
    }

    // If none of the above formats match, try generic parsing
    return parseGenericResponse(responseData);
  } catch (error) {
    console.error('Failed to parse MCP response:', error);
    return null;
  }
}

/**
 * Parse event-stream format response
 * Example: event: message\ndata: {"result":{"content":[{"type":"text","text":"{...JSON...}"}]}}
 */
function parseEventStreamResponse(responseData: string): UsageData | null {
  try {
    // Extract JSON from the "text" field using regex
    const match = responseData.match(/"text":"(.*?)"[\s}]/s);
    if (!match || !match[1]) {
      console.warn('Could not extract text field from event-stream response');
      return null;
    }

    // Unescape and normalize the JSON string
    const normalizedJson = match[1]
      .replace(/\\n/g, ' ')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/ {2,}/g, ' ');

    return JSON.parse(normalizedJson) as UsageData;
  } catch (error) {
    console.error('Failed to parse event-stream response:', error);
    return null;
  }
}

/**
 * Parse standard JSON-RPC response with nested text field
 * Example: {"result":{"content":[{"type":"text","text":"{\"daily\":[...],\"totals\":{...}}"}]}}
 */
function parseJSONRPCResponse(responseData: MCPResponse): UsageData | null {
  try {
    const textData = responseData.result?.content?.[0]?.text;
    if (!textData) {
      return null;
    }

    return JSON.parse(textData) as UsageData;
  } catch (error) {
    console.error('Failed to parse JSON-RPC response:', error);
    return null;
  }
}

/**
 * Generic parser for other response formats
 * Attempts to stringify and clean up the response data
 */
function parseGenericResponse(responseData: unknown): UsageData | null {
  try {
    const stringData = String(responseData)
      .replace(/\n/g, ' ')
      .replace(/\\/g, ' ');

    return JSON.parse(stringData) as UsageData;
  } catch (error) {
    console.error('Failed to parse generic response:', error);
    return null;
  }
}

/**
 * Check if the response contains an error
 */
export function hasError(responseData: unknown): boolean {
  const data = responseData as MCPResponse | UsageData;
  return !!(data && typeof data === 'object' && ('error' in data || ('result' in data && data.result?.isError)));
}

/**
 * Extract error message from response
 */
export function getErrorMessage(responseData: unknown): string {
  const data = responseData as MCPResponse;
  if (data?.error?.message) {
    return data.error.message;
  }
  if (data?.result?.isError) {
    return 'MCP server returned an error';
  }
  return 'Unknown error occurred';
}

