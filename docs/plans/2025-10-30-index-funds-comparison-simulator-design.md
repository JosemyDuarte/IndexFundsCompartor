# IndexFunds Comparison Simulator - Design Document

**Date:** 2025-10-30
**Status:** Approved

## Overview

A static web application that simulates and compares investment returns between two Spanish index fund providers: **MyInvestor** and **IndexaCapital**. The simulator accounts for their different fee structures, compound interest, and user-defined investment scenarios over time.

## Requirements Summary

### Functional Requirements

- Compare investment growth for MyInvestor vs IndexaCapital
- Factor in provider-specific fee structures (tiered vs fixed)
- Calculate compound interest monthly
- Support flexible deposit frequencies (monthly, quarterly, annual)
- Display visual comparison chart and detailed breakdown
- Generate shareable URLs with simulation parameters
- Allow user-configurable expected returns and MyInvestor TER

### Non-Functional Requirements

- Static web application (no backend)
- Deployable to Cloudflare Pages
- Mobile-first responsive design
- TypeScript with strict TDD approach
- No heavy UI/browser testing
- Modular charting architecture

## Architecture

### Pattern: Functional Core, Reactive Shell

The application follows a **reactive stores with functional core** architecture:

**Core Layer (Pure Functions):**

- All business logic as pure, testable functions
- No framework dependencies
- Maximum testability for TDD

**State Layer (Svelte Stores):**

- Reactive state management
- URL synchronization
- Derived computations

**UI Layer (Svelte Components):**

- Thin presentation layer
- Binds to stores
- Delegates logic to core

### Data Flow

```
User Input → Store Update → URL Update + Derived Calculation → UI Re-render
```

## Fee Structures

### IndexaCapital (Tiered Fees)

Management fees based on portfolio value + fixed costs:

| Portfolio Value | Management Fee | Total Annual Fee\* |
| --------------- | -------------- | ------------------ |
| < €10,000       | 0.405%         | 0.599%             |
| €10k - €100k    | 0.385%         | 0.579%             |
| €100k - €500k   | 0.355%         | 0.549%             |
| €500k - €1M     | 0.300%         | 0.494%             |
| €1M - €5M       | 0.250%         | 0.444%             |
| €5M - €10M      | 0.200%         | 0.394%             |
| €10M - €50M     | 0.150%         | 0.344%             |
| €50M - €100M    | 0.100%         | 0.294%             |
| > €100M         | 0.080%         | 0.274%             |

\*Total includes: Management fee + 0.096% custody + 0.098% underlying costs

**Fee Application:**

- Current tier only (based on month's portfolio value)
- Recalculated monthly as portfolio grows/shrinks
- Applied as monthly deduction (annual rate / 12)

### MyInvestor (Fixed Fees)

- Management: 0.30% (fixed)
- TER: User-configurable, 0.05% default, 0.59% maximum
- Total: 0.30% + user-specified TER

**Fee Application:**

- Fixed percentage regardless of portfolio size
- Applied as monthly deduction (annual rate / 12)

## Calculation Engine

### Monthly Simulation Algorithm

```
For each month (1 to totalMonths):
  1. Add periodic deposit (if applicable based on frequency)
  2. Calculate monthly growth: balance × (annualReturn / 12)
  3. Deduct monthly fee: balance × (annualFeeRate / 12)
  4. Store snapshot: {
       month,
       balance,
       totalDeposited,
       totalFeesPaid,
       totalReturns
     }
```

### Core Functions

**`calculateProviderComparison(params: SimulationParams)`**

- Orchestrates full simulation for both providers
- Returns monthly snapshots + final totals
- Pure function, no side effects

**`calculateMonthlyGrowth(params, feeFunction)`**

- Month-by-month simulation loop
- Accepts fee calculation function (dependency injection)
- Returns array of monthly snapshots

**`getIndexaCapitalFee(currentBalance: number): number`**

- Looks up tier based on portfolio value
- Returns effective annual fee rate
- Handles all 9 tiers + fixed costs

**`getMyInvestorFee(userTER: number): number`**

- Returns fixed annual fee (0.30% + userTER)
- Simple calculation, no tier logic

**Deposit Frequency Logic:**

- Monthly: deposit every month
- Quarterly: deposit every 3 months (months 3, 6, 9, 12...)
- Annual: deposit at month 12, 24, 36...

## Data Model

### SimulationParams Interface

```typescript
interface SimulationParams {
	initialInvestment: number; // Initial deposit (€)
	depositAmount: number; // Recurring deposit amount (€)
	depositFrequency: 'monthly' | 'quarterly' | 'annual';
	timePeriodYears: number; // Simulation duration
	expectedReturn: number; // Annual return rate (%)
	myInvestorTER: number; // MyInvestor TER (0.05-0.59%)
}
```

**Defaults:**

- initialInvestment: 1000
- depositAmount: 100
- depositFrequency: 'monthly'
- timePeriodYears: 20
- expectedReturn: 7
- myInvestorTER: 0.05

### SimulationResults Interface

```typescript
interface ProviderResult {
	totalInvested: number;
	totalFeesPaid: number;
	totalReturns: number;
	finalBalance: number;
	monthlySnapshots: MonthlySnapshot[];
}

interface MonthlySnapshot {
	month: number;
	balance: number;
	totalDeposited: number;
	totalFeesPaid: number;
	totalReturns: number;
}

interface SimulationResults {
	indexaCapital: ProviderResult;
	myInvestor: ProviderResult;
}
```

## Component Structure

### Routes

**`src/routes/+page.svelte`** - Main simulator page

- Loads URL params on mount, initializes stores
- Two-column layout (mobile: stacked)
- Orchestrates Form + Chart + Breakdown
- No business logic

### Components

**`src/lib/components/SimulatorForm.svelte`**

- Input form for all simulation parameters
- Two-way binding to `$simulationParams` store
- Fields:
  - Initial investment (€)
  - Periodic deposit amount (€)
  - Deposit frequency (dropdown: monthly/quarterly/annual)
  - Time period (years)
  - Expected annual return (%)
  - MyInvestor TER (%, 0.05-0.59 range)
- Minimal validation: positive numbers, TER range check
- Mobile-first: stacked inputs, touch-friendly

**`src/lib/components/ComparisonChart.svelte`**

- Props: `monthlyDataIndexa`, `monthlyDataMyInvestor`
- Modular Chart.js wrapper (swappable)
- Line chart: X=time, Y=portfolio value (€)
- Two lines: IndexaCapital, MyInvestor (distinct colors)
- Responsive canvas sizing
- Legend, tooltips, axis labels

**`src/lib/components/BreakdownTable.svelte`**

- Props: `resultsIndexa`, `resultsMyInvestor`
- Side-by-side comparison (mobile: stacked)
- Rows:
  - Total Invested
  - Total Fees Paid
  - Total Returns
  - Final Balance
- Highlights winner (higher final balance)
- Currency formatting: € with thousand separators

## Store Implementation

### `src/lib/stores/simulationParams.ts`

```typescript
import { writable } from 'svelte/store';

const defaults: SimulationParams = {
	initialInvestment: 1000,
	depositAmount: 100,
	depositFrequency: 'monthly',
	timePeriodYears: 20,
	expectedReturn: 7,
	myInvestorTER: 0.05
};

export const simulationParams = writable<SimulationParams>(defaults);
```

**URL Synchronization:**

- On mount: parse search params → update store
- On change: serialize store → update URL (no page reload)
- URL format: `?initial=1000&deposit=100&freq=monthly&years=20&return=7&ter=0.05`
- Invalid/missing params → fallback to defaults
- Enables shareable scenario links

### `src/lib/stores/simulationResults.ts`

```typescript
import { derived } from 'svelte/store';
import { simulationParams } from './simulationParams';
import { calculateProviderComparison } from '$lib/calculations/simulator';

export const simulationResults = derived(simulationParams, ($params) =>
	calculateProviderComparison($params)
);
```

**Behavior:**

- Auto-recalculates when `simulationParams` changes
- Pure derivation (no side effects)
- Components subscribe for reactive updates

## Testing Strategy

### Tooling

- **Vitest** - unit testing framework
- **@testing-library/svelte** - component testing without browser
- Focus on logic and isolated component units

### Test Coverage

**Calculation Functions (Unit Tests):**

- ✓ Fee tier lookups (all 9 IndexaCapital tiers)
- ✓ Tier boundary crossing (e.g., portfolio grows from 99k → 101k)
- ✓ Monthly compounding math accuracy
- ✓ Deposit frequency logic (monthly/quarterly/annual)
- ✓ Edge cases:
  - Zero deposits (initial investment only)
  - Very long periods (50+ years)
  - Very large balances (>€100M)
  - Negative returns (market downturn)

**Store Logic (Unit Tests):**

- ✓ Store initialization with defaults
- ✓ Parameter updates trigger recalculation
- ✓ Derived store computations correct
- ✓ URL encoding/decoding roundtrip

**Component Tests (Isolation):**

- ✓ Form inputs bind to stores correctly
- ✓ Form validation displays errors
- ✓ Chart receives correct props and renders
- ✓ Table displays formatted currency values
- ✓ Table highlights correct winner
- ✓ No full browser/E2E tests (per requirement)

**TDD Workflow:**

1. Write failing test
2. Implement minimum code to pass
3. Refactor for clarity
4. Repeat

## Project Structure

```
/
├── src/
│   ├── lib/
│   │   ├── calculations/
│   │   │   ├── fees.ts                    # Fee calculation functions
│   │   │   ├── fees.test.ts
│   │   │   ├── compounding.ts             # Compound interest logic
│   │   │   ├── compounding.test.ts
│   │   │   ├── simulator.ts               # Main simulation orchestrator
│   │   │   └── simulator.test.ts
│   │   ├── stores/
│   │   │   ├── simulationParams.ts        # Input parameters store
│   │   │   ├── simulationParams.test.ts
│   │   │   ├── simulationResults.ts       # Derived results store
│   │   │   └── simulationResults.test.ts
│   │   ├── components/
│   │   │   ├── SimulatorForm.svelte
│   │   │   ├── SimulatorForm.test.ts
│   │   │   ├── ComparisonChart.svelte
│   │   │   ├── ComparisonChart.test.ts
│   │   │   ├── BreakdownTable.svelte
│   │   │   └── BreakdownTable.test.ts
│   │   └── utils/
│   │       ├── formatters.ts              # Currency formatting
│   │       └── urlSync.ts                 # URL param serialization
│   ├── routes/
│   │   └── +page.svelte                   # Main page
│   ├── app.html
│   └── app.css                            # Global + Tailwind
├── static/                                # Static assets (favicon, etc.)
├── docs/
│   └── plans/
│       └── 2025-10-30-index-funds-comparison-simulator-design.md
├── tests/
│   └── setup.ts                          # Test environment config
├── .eslintrc.cjs
├── .prettierrc
├── tailwind.config.js
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json
└── package.json
```

## Technology Stack

### Core

- **SvelteKit** - framework
- **adapter-static** - static site generation for Cloudflare Pages
- **TypeScript** - type safety
- **Vite** - build tool

### UI

- **Tailwind CSS** - utility-first styling
- **Chart.js** - charting library (modular wrapper)
- **svelte-chartjs** - Svelte wrapper for Chart.js

### Testing

- **Vitest** - test runner
- **@testing-library/svelte** - component testing
- **@testing-library/jest-dom** - DOM matchers

### Code Quality

- **ESLint** - linting (TypeScript + Svelte)
- **Prettier** - code formatting
- **eslint-plugin-svelte** - Svelte-specific linting

## Build & Deployment

### Development

```bash
npm run dev          # Start dev server
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run lint         # Lint code
npm run format       # Format with Prettier
```

### Production Build

```bash
npm run build        # Generate static site → build/
npm run preview      # Preview production build locally
```

### Deployment (Cloudflare Pages)

1. Push to Git repository
2. Connect Cloudflare Pages to repo
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `build`
4. Auto-deploy on push to main branch

**Configuration:**

- `svelte.config.js` uses `adapter-static`
- All routes prerendered (static)
- No server-side rendering
- No API routes (all logic client-side)

## Error Handling & Edge Cases

### Input Validation (Minimal)

- Positive numbers for all monetary/percentage inputs
- TER within 0.05-0.59% range
- Time period > 0 years
- Display inline error messages below fields
- No form submission blocking

### Edge Cases

- **Zero deposits:** Works with initial investment only
- **Very large balances:** IndexaCapital tiers handle >€100M
- **Tier changes:** Recalculate fee every month based on current balance
- **Rounding:** Round to 2 decimal places for display
- **Invalid URL params:** Fall back to defaults silently
- **Empty data:** Show placeholder message in chart
- **Large time periods:** Chart.js auto-scales

### No Backend = Simplified Error Handling

- No network errors to handle
- No loading states needed
- All computation client-side and synchronous

## Currency & Localization

- **Currency:** Euros (€) only
- **Number formatting:**
  - Thousand separators: 1.000,00 €
  - Two decimal places for currency
  - One decimal place for percentages
- **Locale:** Assume ES-es for number formatting
- **No currency conversion**

## Performance Considerations

### Client-Side Computation

- Monthly calculations: linear O(n) complexity
- Max realistic: 50 years × 12 months = 600 iterations
- Negligible compute time (<10ms)
- No performance optimization needed initially

### Chart Rendering

- Chart.js handles thousands of data points efficiently
- Responsive resize via CSS
- Mobile: same data density (Chart.js optimizes internally)

### Bundle Size

- Keep dependencies minimal
- Chart.js is largest dependency (~200KB)
- Modular architecture allows future optimization
- Target: <500KB total bundle

## Future Enhancements (Out of Scope)

Potential future additions (not included in initial implementation):

- Inflation adjustment option
- Multiple scenarios side-by-side
- Historical backtesting with real market data
- Additional providers
- Export results to PDF/CSV
- Tax considerations
- Rebalancing strategies
- Multiple currency support

## Open Questions & Decisions

### Resolved

- ✓ Architecture: Reactive stores with functional core
- ✓ Charting: Chart.js (modular)
- ✓ Fee calculation: Current tier only (not blended)
- ✓ Compounding: Monthly
- ✓ Deployment: Cloudflare Pages
- ✓ Testing: TDD with unit + component tests (no E2E)
- ✓ URL sharing: Search parameters
- ✓ Inflation: Not included
- ✓ Currency: Euros only

### None Outstanding

## Success Criteria

The simulator is successful when:

1. ✓ Accurately calculates IndexaCapital tiered fees (validated in tests)
2. ✓ Accurately calculates MyInvestor fixed fees (validated in tests)
3. ✓ Correctly applies monthly compound interest
4. ✓ Correctly handles all deposit frequencies
5. ✓ Displays visual comparison chart
6. ✓ Displays detailed breakdown tables
7. ✓ URL sharing works (params persist across page loads)
8. ✓ Mobile-responsive on phones and tablets
9. ✓ Deploys successfully to Cloudflare Pages
10. ✓ All calculations covered by tests (>90% coverage)
11. ✓ TDD workflow followed throughout
