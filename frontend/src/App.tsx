import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { parseMCPResponse, hasError, getErrorMessage, type UsageData } from './utils';
import { getDateFormatPattern } from './utils/locale';
import { ServerConfigForm } from './components/forms';
import { UsageDisplay } from './components/usage';

import fakeDailyUsageData from './assets/fake/fake-daily-usage.json';
import fakeMonthlyUsageData from './assets/fake/fake-monthly-usage.json';
import fakeSessionUsageData from './assets/fake/fake-session-usage.json';
import fakeBlocksUsageData from './assets/fake/fake-blocks-usage.json';
import fakeCodexDailyUsageData from './assets/fake/fake-codex-daily-usage.json';
import fakeCodexMonthlyUsageData from './assets/fake/fake-codex-monthly-usage.json';

// URL parameter management utilities
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    serverUrl: params.get('serverUrl') || '',
    durationType: params.get('durationType') || 'daily',
    sinceDate: params.get('sinceDate') || '',
    untilDate: params.get('untilDate') || '',
  };
};

const updateUrlParams = (params: {
  serverUrl?: string;
  durationType?: string;
  sinceDate?: string;
  untilDate?: string;
}) => {
  const urlParams = new URLSearchParams(window.location.search);

  if (params.serverUrl !== undefined) {
    if (params.serverUrl) {
      urlParams.set('serverUrl', params.serverUrl);
    } else {
      urlParams.delete('serverUrl');
    }
  }

  if (params.durationType !== undefined) {
    if (params.durationType && params.durationType !== 'daily') {
      urlParams.set('durationType', params.durationType);
    } else {
      urlParams.delete('durationType');
    }
  }

  if (params.sinceDate !== undefined) {
    if (params.sinceDate) {
      urlParams.set('sinceDate', params.sinceDate);
    } else {
      urlParams.delete('sinceDate');
    }
  }

  if (params.untilDate !== undefined) {
    if (params.untilDate) {
      urlParams.set('untilDate', params.untilDate);
    } else {
      urlParams.delete('untilDate');
    }
  }

  const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
  window.history.replaceState({}, '', newUrl);
};

function App() {
  // Initialize state from URL parameters
  const urlParams = getUrlParams();
  const [serverUrl, setServerUrl] = useState(urlParams.serverUrl);
  const [rawJsonData, setRawJsonData] = useState<UsageData | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [durationType, setDurationType] = useState(urlParams.durationType);
  const [sinceDate, setSinceDate] = useState(urlParams.sinceDate);
  const [untilDate, setUntilDate] = useState(urlParams.untilDate);
  const [processDataButtonText, setProcessDataButtonText] = useState('Process data');
  const [processDataButtonColor, setProcessDataButtonColor] = useState('bg-primary text-primary-foreground');

  const fetchData = useCallback(
    async (mcpServerUrl: string) => {
      try {
        setLoading(true);
        setError(null);
        setProcessDataButtonText('Processing data...');
        setUsageData(null);
        setRawJsonData(null);

        // Build arguments object
        const mcpArguments: Record<string, string> = {};

        // Convert dates from YYYY-MM-DD to YYYYMMDD format
        if (sinceDate) mcpArguments.since = sinceDate.replace(/-/g, '');
        if (untilDate) mcpArguments.until = untilDate.replace(/-/g, '');

        // Call the backend proxy instead of the MCP server directly to avoid CORS issues
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        const response = await axios.post(`${backendUrl}/api/mcp/call`, {
          serverUrl: mcpServerUrl,
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            // daily, monthly, session, blocks, codex-daily, codex-monthly
            name: durationType,
            arguments: mcpArguments,
          },
        });
        // console.log('Data fetched:', response.data);

        // Check for MCP error response
        if (hasError(response.data)) {
          setError(getErrorMessage(response.data));
          setLoading(false);
          setProcessDataButtonText('Process data');
          return;
        }

        // Parse MCP response using utility function
        const parsedData = parseMCPResponse(response.data);

        if (parsedData) {
          // console.log('Parsed usage data:', parsedData);
          setRawJsonData(parsedData);
          setUsageData(parsedData);
        } else {
          setError('Failed to parse MCP server response');
        }

        setLoading(false);
        setProcessDataButtonText('Refresh data for ' + durationType);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
        setLoading(false);
      }
    },
    [durationType, sinceDate, untilDate]
  );

  useEffect(() => {
    const initialServerUrl = localStorage.getItem('serverUrl');
    // console.log('initialServerUrl', initialServerUrl);
    if (initialServerUrl && !serverUrl) {
      setServerUrl(initialServerUrl);
      fetchData(initialServerUrl);
    } else if (serverUrl) {
      fetchData(serverUrl);
    }
  }, [fetchData, serverUrl]);

  const handleProcessData = () => {
    localStorage.setItem('serverUrl', serverUrl);
    updateUrlParams({ serverUrl, durationType, sinceDate, untilDate });
    fetchData(serverUrl);
  };

  const handleDurationTypeChange = (newType: string) => {
    setDurationType(newType);
    updateUrlParams({ durationType: newType, serverUrl, sinceDate, untilDate });
  };

  // Update URL parameters when state changes
  const handleServerUrlChange = (newUrl: string) => {
    setServerUrl(newUrl);
    updateUrlParams({ serverUrl: newUrl, durationType, sinceDate, untilDate });
  };

  const handleSinceDateChange = (newDate: string) => {
    setSinceDate(newDate);
    updateUrlParams({ sinceDate: newDate, serverUrl, durationType, untilDate });
  };

  const handleUntilDateChange = (newDate: string) => {
    setUntilDate(newDate);
    updateUrlParams({ untilDate: newDate, serverUrl, durationType, sinceDate });
  };

  useEffect(() => {
    if (durationType === 'daily') {
      setProcessDataButtonColor('bg-primary text-primary-foreground');
    } else if (durationType === 'monthly') {
      setProcessDataButtonColor('bg-emerald-600 text-white');
    } else if (durationType === 'session') {
      setProcessDataButtonColor('bg-cyan-600 text-white');
    } else if (durationType === 'blocks') {
      setProcessDataButtonColor('bg-yellow-600 text-white');
    } else if (durationType === 'codex-daily') {
      setProcessDataButtonColor('bg-green-600 text-white');
    } else if (durationType === 'codex-monthly') {
      setProcessDataButtonColor('bg-purple-600 text-white');
    }
  }, [durationType]);

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='border-b'>
        <div className='container mx-auto px-4 py-4'>
          <h1 className='text-2xl font-bold'>Claude Code API Usage Dashboard</h1>
          <p className='text-muted-foreground'>better-ccusage Analytics</p>
        </div>
      </header>

      <main className='container mx-auto px-4 py-8'>
        <div className='grid gap-6'>
          <ServerConfigForm
            serverUrl={serverUrl}
            durationType={durationType}
            sinceDate={sinceDate}
            untilDate={untilDate}
            processDataButtonText={processDataButtonText}
            processDataButtonColor={processDataButtonColor}
            onServerUrlChange={handleServerUrlChange}
            onDurationTypeChange={handleDurationTypeChange}
            onSinceDateChange={handleSinceDateChange}
            onUntilDateChange={handleUntilDateChange}
            onSubmit={handleProcessData}
          />

          {/* Loading State */}
          {loading && (
            <div className='metric-card'>
              <p className='text-muted-foreground'>Loading data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className='metric-card border-red-500 bg-red-50 dark:bg-red-950'>
              <h3 className='text-lg font-semibold text-red-700 dark:text-red-300 mb-2'>Error</h3>
              <p className='text-red-600 dark:text-red-400'>{error}</p>
            </div>
          )}

          {/* Usage Display Section */}
          {usageData && <UsageDisplay usageData={usageData} rawJsonData={rawJsonData} loading={loading} />}

          {/* Empty State */}
          {!usageData && !loading && !error && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='metric-card'>
                <h3 className='text-sm font-medium text-muted-foreground mb-2'>Total Cost</h3>
                <p className='text-2xl font-bold text-muted-foreground'>-</p>
              </div>
              <div className='metric-card'>
                <h3 className='text-sm font-medium text-muted-foreground mb-2'>Total Tokens</h3>
                <p className='text-2xl font-bold text-muted-foreground'>-</p>
              </div>
              <div className='metric-card'>
                <h3 className='text-sm font-medium text-muted-foreground mb-2'>Cache Read Tokens</h3>
                <p className='text-2xl font-bold text-muted-foreground'>-</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
