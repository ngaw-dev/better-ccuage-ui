import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../src/App'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

describe('App', () => {
  it('renders the dashboard title', () => {
    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )

    expect(screen.getByText('API Usage Dashboard')).toBeInTheDocument()
    expect(screen.getByText('better-ccusage Analytics')).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )

    expect(screen.getByText(/Welcome to API Usage Dashboard/)).toBeInTheDocument()
    expect(screen.getByText(/Upload your better-ccusage JSONL files/)).toBeInTheDocument()
  })

  it('renders metric cards', () => {
    const queryClient = createTestQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )

    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    expect(screen.getByText('Total Cost')).toBeInTheDocument()
    expect(screen.getByText('Total Tokens')).toBeInTheDocument()
  })
})