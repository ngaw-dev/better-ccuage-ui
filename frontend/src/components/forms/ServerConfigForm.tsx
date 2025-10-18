interface ServerConfigFormProps {
  serverUrl: string;
  durationType: string;
  sinceDate: string;
  untilDate: string;
  processDataButtonText: string;
  processDataButtonColor: string;
  onServerUrlChange: (url: string) => void;
  onDurationTypeChange: (type: string) => void;
  onSinceDateChange: (date: string) => void;
  onUntilDateChange: (date: string) => void;
  onSubmit: () => void;
}

export function ServerConfigForm({
  serverUrl,
  durationType,
  sinceDate,
  untilDate,
  processDataButtonText,
  processDataButtonColor,
  onServerUrlChange,
  onDurationTypeChange,
  onSinceDateChange,
  onUntilDateChange,
  onSubmit,
}: ServerConfigFormProps) {
  return (
    <div className='metric-card'>
      <h2 className='text-lg font-semibold mb-4'>Welcome to Claude Code API Usage Dashboard</h2>
      <details className='mb-4'>
        <summary className='cursor-pointer font-medium text-muted-foreground hover:underline mb-2'>
          How do I get the MCP server URL?
        </summary>
        <div className='flex flex-col gap-2 mt-2'>
          <p className='text-muted-foreground'>Run the following command to get the server URL:</p>
          <span className='font-mono bg-muted px-2 py-1 rounded'>
            npx @better-ccusage/mcp@latest --type http --port 8080
          </span>
          <p className='text-muted-foreground'>You will get output like this:</p>
          <p>
            <span className='font-mono bg-muted px-2 py-1 rounded'>
              [better-ccusage 8:32:42 pm] ℹ MCP server is running on http://localhost:8080
            </span>
          </p>
        </div>
      </details>
      <div className='flex flex-col gap-4'>
        {/* Server URL and Duration Type */}
        <div className='flex flex-col md:flex-row gap-2'>
          <input
            type='text'
            name='server_url'
            placeholder='Server URL'
            className='flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition'
            autoComplete='off'
            value={serverUrl}
            onChange={(e) => onServerUrlChange(e.target.value)}
          />
          <select
            name='duration_type'
            className='flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition'
            value={durationType}
            onChange={(e) => onDurationTypeChange(e.target.value)}
          >
            <option value='daily'>Daily</option>
            <option value='monthly'>Monthly</option>
            <option value='session'>Session</option>
            <option value='blocks'>Blocks</option>
            <option value='codex-daily'>Codex Daily</option>
            <option value='codex-monthly'>Codex Monthly</option>
          </select>
        </div>

        {/* Date Range */}
        <div className='flex flex-col md:flex-row gap-2'>
          <div className='flex-1'>
            <label className='block text-sm font-medium mb-1'>Since Date (Optional)</label>
            <input
              type='date'
              name='since_date'
              className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition'
              value={sinceDate}
              onChange={(e) => onSinceDateChange(e.target.value)}
            />
          </div>
          <div className='flex-1'>
            <label className='block text-sm font-medium mb-1'>Until Date (Optional)</label>
            <input
              type='date'
              name='until_date'
              className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition'
              value={untilDate}
              onChange={(e) => onUntilDateChange(e.target.value)}
            />
          </div>
        </div>

        <button
          type='submit'
          className={`w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition ${processDataButtonColor}`}
          onClick={onSubmit}
        >
          {processDataButtonText}
        </button>
      </div>
    </div>
  );
}

