# IndexFunds Comparison Simulator

A static web application that simulates and compares investment returns between MyInvestor and IndexaCapital, two Spanish index fund providers.

## Features

- 📊 Visual comparison chart showing portfolio growth over time
- 💰 Detailed financial breakdown (fees, returns, final balance)
- 🔗 **Shareable URLs with persistent state** - URL params are preserved across refreshes
- 📱 Mobile-first responsive design
- ⚡ Static site - no backend required
- 🧪 Comprehensive test coverage with TDD

## UI Features

- **Modern Financial Dashboard**: Revolut-inspired design with dark theme
- **Prominent Chart Display**: Large, interactive chart (500-700px height) for easy comparison
- **Summary Metrics**: Quick-glance cards showing winner, final balance, and total returns
- **Responsive Layout**: Optimized for mobile, tablet, and desktop viewing
- **Smooth Animations**: Staggered card reveals for polished UX
- **Enhanced Tooltips**: Hover over chart to see detailed comparisons and differences

## Form Validation

All input fields include real-time validation with visual feedback:

### Currency Inputs (Initial Investment, Regular Deposit)

- Must be valid numbers
- Minimum: €0
- Shows error for letters or special characters

### Investment Period

- Minimum: 1 year
- Must be whole number

### Expected Return

- Minimum: 0%
- Accepts decimals

### MyInvestor TER

- Minimum: 0.05%
- Maximum: 0.59%
- Step: 0.01%

### Error Display

- Invalid fields show red border
- Error message appears below field
- Warning icon for visibility
- Error clears when user starts typing
- ARIA attributes for screen readers

## Tech Stack

- **Framework:** SvelteKit
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Chart.js
- **Testing:** Vitest + Testing Library
- **Deployment:** Cloudflare Pages

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── lib/
│   ├── calculations/     # Pure calculation functions
│   │   ├── fees.ts       # Fee tier logic
│   │   ├── compounding.ts # Compound interest
│   │   └── simulator.ts  # Main simulation
│   ├── stores/           # Svelte stores
│   │   ├── simulationParams.ts
│   │   └── simulationResults.ts
│   ├── components/       # UI components
│   │   ├── SimulatorForm.svelte
│   │   ├── ComparisonChart.svelte
│   │   └── BreakdownTable.svelte
│   └── utils/            # Helper utilities
├── routes/               # SvelteKit routes
└── app.css              # Global styles + Tailwind
```

## Architecture

The app follows a **functional core, reactive shell** pattern:

- **Pure Functions:** All business logic (fees, compounding, simulation)
- **Svelte Stores:** Reactive state management and URL synchronization
- **Components:** Thin UI layer that binds to stores

## Fee Structures

### IndexaCapital (Tiered)

| Portfolio Value | Management Fee | Custody Fee | Total Annual Fee |
| --------------- | -------------- | ----------- | ---------------- |
| < €10k          | 0.405%         | 0.109%      | 0.612%           |
| €10k - €100k    | 0.385%         | 0.103%      | 0.586%           |
| €100k - €500k   | 0.355%         | 0.097%      | 0.550%           |
| €500k - €1M     | 0.30%          | 0.091%      | 0.489%           |
| €1M - €5M       | 0.25%          | 0.048%      | 0.396%           |
| €5M - €10M      | 0.20%          | 0.048%      | 0.346%           |
| €10M - €50M     | 0.15%          | 0.048%      | 0.296%           |
| €50M - €100M    | 0.10%          | 0.048%      | 0.246%           |
| > €100M         | 0.08%          | 0.048%      | 0.226%           |

_Plus fixed underlying fee of 0.098% for all balances_

### MyInvestor (Fixed)

- Management: 0.30%
- TER: 0.05% - 0.59% (user-configurable)
- Total: 0.30% + TER

## Testing

Built with strict TDD approach:

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch
```

Test coverage includes:

- ✅ All calculation functions (fees, compounding, simulation)
- ✅ Store logic and reactivity
- ✅ Component rendering and interactions

## Deployment

### Cloudflare Pages

1. Push to Git repository
2. Connect Cloudflare Pages to repo
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `build`
4. Deploy automatically on push

## License

MIT
