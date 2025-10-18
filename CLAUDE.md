# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the API Usage Dashboard - a Next.js 15 web application that transforms better-ccusage JSONL data into interactive visualizations and analytics. The project is designed to help development teams monitor, analyze, and optimize their AI API usage across multiple providers (Anthropic, Zai, GLM-4.5/4.6) with real-time insights into token consumption, costs, and usage patterns.

## Commands

### Development
```bash
pnpm run dev              # Start Next.js development server with Turbopack
pnpm run build            # Build for production with Turbopack
pnpm run start            # Start production server
pnpm run lint             # Run ESLint
```

### Current Project State
This is a newly initialized Next.js 15 project with TypeScript and Tailwind CSS. The core documentation and architecture have been established in the `docs/` directory, but the actual application implementation is beginning from the standard Next.js template.

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.5.5 with App Router
- **React**: 19.1.0 with latest features and hooks
- **Language**: TypeScript 5+ with strict mode
- **Styling**: Tailwind CSS 4.0 with modern design system
- **State Management**: Planned TanStack Query for server state, Zustand for local state
- **UI Components**: Planned shadcn/ui built on Radix UI
- **Data Validation**: Zod for runtime validation and TypeScript types
- **Testing**: Jest + React Testing Library + Playwright
- **Build Tool**: Turbopack for fast development and builds

### Project Structure (Planned)
```
src/
├── app/                 # Next.js App Router pages and layouts
├── components/          # Reusable UI components
│   ├── ui/              # Basic UI primitives (shadcn/ui)
│   ├── charts/          # Chart-specific components
│   ├── layout/          # Layout and navigation
│   └── features/        # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configurations
├── store/               # State management
├── services/            # External service integrations
├── types/               # TypeScript type definitions
└── middleware.ts        # Next.js middleware
```

### Key Features (From PRD)
- **Data Integration**: Automatic ingestion of better-ccusage JSONL output files
- **Usage Overview Dashboard**: Total tokens, costs, and requests with time-based filtering
- **Provider Breakdown**: Visual comparison of usage across Anthropic, Zai, and GLM providers
- **Time-Series Charts**: Daily, weekly, and monthly usage trends
- **Cost Analysis**: Detailed cost breakdowns with project and provider filtering
- **Export Functionality**: CSV/PDF export of usage reports

## Development Standards

### Critical Coding Rules
1. **Always use Zod schemas** for props validation in complex components
2. **Never use console.log in production code** - use configured logger instead
3. **All API responses must be validated with Zod schemas** before use in components
4. **Always handle loading and error states** in UI components
5. **Never hardcode color values** - use Tailwind utilities or CSS custom properties
6. **Always use the cn() utility** for conditional class merging
7. **Never bypass shadcn/ui components** unless absolutely necessary
8. **Always use proper TypeScript types** - avoid `any` types
9. **Never store sensitive data in localStorage**
10. **Always use TanStack Query for server state** - don't use useState for API data

### Next.js Specific Patterns
- **'use client' directive**: Required for components with interactivity, hooks, or browser APIs
- **Server Components**: Default for all components, optimized for SSR/SSG
- **File-based routing**: Route structure mirrors file system in `src/app/`
- **Error boundaries**: Automatic error handling with `error.tsx` files
- **Loading states**: Built-in loading UI with `loading.tsx` files
- **Route handlers**: API endpoints within the app directory

### Component Standards
- **Naming**: Use PascalCase for components: `FileUpload`, `MetricsCard`, `TimeSeriesChart`
- **File names**: kebab-case preferred: `file-upload.tsx`, `metrics-card.tsx`
- **Props validation**: Always validate complex props with Zod schemas
- **Export pattern**: Export both raw component and validated wrapper when needed
- **Documentation**: Include JSDoc comments for component purpose and usage

### Data Processing Patterns
The application will process JSONL files from better-ccusage CLI tool. Key patterns:
- **Client-side processing**: All data processing happens in the browser for privacy
- **Zod validation**: All incoming JSONL data must be validated against schemas
- **Memory management**: Efficient handling of large datasets (10K+ records)
- **Progressive loading**: Load and process data in chunks for better performance

## Testing Strategy

### Framework Setup
- **Unit Testing**: Jest + React Testing Library (planned)
- **E2E Testing**: Playwright (planned)
- **Component Testing**: Storybook integration (planned)
- **Coverage Target**: 80% code coverage

### Testing Requirements
1. **Component Tests**: Test all UI components with proper mocking
2. **Data Processing Tests**: Test JSONL parsing and validation
3. **Integration Tests**: Test component interactions and data flow
4. **E2E Tests**: Test critical user flows (file upload, dashboard navigation)

## API Integration

### Data Sources
- **Primary**: better-ccusage JSONL output files
- **Processing**: Client-side file processing and validation
- **Storage**: Browser-based storage for processed data
- **Export**: Client-side CSV/PDF generation

### Data Validation
All data processing must use Zod schemas:
- **JSONL parsing**: Validate each line against expected structure
- **Provider data**: Ensure Anthropic, Zai, GLM data consistency
- **Usage metrics**: Validate token counts, costs, timestamps
- **Export data**: Validate data before export generation

## Styling Guidelines

### Design System
- **Theme**: Professional developer-centric design with dark mode support
- **Colors**: Dedicated palette for data visualization by provider
- **Typography**: Consistent scale using Tailwind utilities
- **Spacing**: Standardized spacing scale for consistency
- **Accessibility**: WCAG AA compliance with proper contrast ratios

### Component Styling
- **Utilities-first**: Use Tailwind utilities for rapid development
- **Component abstraction**: Create reusable component patterns
- **Responsive design**: Mobile-first approach with Tailwind breakpoints
- **Chart styling**: Consistent styling across all data visualizations

## File Structure Key Points

### Current Files
- `src/app/page.tsx`: Next.js template home page (to be replaced with dashboard)
- `src/app/layout.tsx`: Root layout with basic Tailwind setup
- `src/app/globals.css`: Global styles with Tailwind imports
- `docs/`: Comprehensive project documentation and architecture

### Planned Implementation
The project follows the architecture documented in `docs/ui-architecture.md`. Key directories to be created:
- `src/components/`: UI components organized by feature
- `src/hooks/`: Custom React hooks for data processing
- `src/lib/`: Utilities, validations, and configurations
- `src/services/`: Data processing and export services
- `src/types/`: TypeScript type definitions
- `src/store/`: State management with TanStack Query and Zustand

## Data Processing Requirements

### JSONL Format
The application processes JSONL files from better-ccusage with this expected structure:
- Provider information (Anthropic, Zai, GLM)
- Token usage data
- Cost information
- Timestamps and metadata
- Project identifiers

### Performance Considerations
- **Large datasets**: Handle 10K+ usage records efficiently
- **Memory management**: Process data in chunks to avoid memory issues
- **Progressive rendering**: Render charts progressively for better UX
- **Caching**: Cache processed data to avoid reprocessing

## Common Development Tasks

### Adding New Charts
1. Create chart component in `src/components/charts/`
2. Add Zod schema for chart data validation
3. Implement with Chart.js or similar library
4. Add loading and error states
5. Include responsive design
6. Add tests for chart functionality

### Processing New Data Sources
1. Define Zod schema for data validation
2. Create processing service in `src/services/`
3. Add React Query hook for data management
4. Implement error handling and validation
5. Add tests for data processing

### Creating New Features
1. Follow component naming conventions
2. Use Zod for props and data validation
3. Implement proper loading and error states
4. Add TypeScript types for all data structures
5. Include accessibility features
6. Add comprehensive tests

## Environment Configuration

### Development Variables
Key environment variables (to be added to `.env.local`):
- `NEXT_PUBLIC_API_BASE_URL`: API base URL (if external API needed)
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_ENABLE_DEVTOOLS`: Development tools toggle
- `NEXT_PUBLIC_MAX_FILE_SIZE`: Maximum file upload size

### Configuration Files
- `next.config.ts`: Next.js configuration (Turbopack enabled)
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration with strict mode
- `eslint.config.mjs`: ESLint configuration

This project is in early development stage, with comprehensive documentation and architecture established. The implementation will follow the patterns and standards outlined in the `docs/` directory, particularly `docs/ui-architecture.md`.