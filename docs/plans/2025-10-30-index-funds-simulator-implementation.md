# IndexFunds Comparison Simulator - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static web application that simulates and compares investment returns between MyInvestor and IndexaCapital, accounting for their different fee structures and compound interest.

**Architecture:** Reactive stores with functional core pattern. Pure calculation functions handle all business logic, Svelte stores manage state and URL synchronization, thin UI components bind to stores for reactive updates.

**Tech Stack:** SvelteKit, TypeScript, Tailwind CSS, Chart.js, Vitest, @testing-library/svelte

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `svelte.config.js`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `src/app.html`
- Create: `src/app.css`

**Step 1: Initialize SvelteKit project**

Run: `npm create svelte@latest . -- --template skeleton --types typescript`
Expected: Project scaffolded with TypeScript

**Step 2: Install core dependencies**

Run:
```bash
npm install -D @sveltejs/adapter-static tailwindcss postcss autoprefixer
npm install -D vitest @testing-library/svelte @testing-library/jest-dom jsdom
npm install chart.js svelte-chartjs
```
Expected: All packages installed

**Step 3: Configure adapter-static**

Modify: `svelte.config.js`

```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		})
	}
};

export default config;
```

**Step 4: Configure Vitest**

Modify: `vite.config.ts`

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts']
	}
});
```

**Step 5: Create test setup file**

Create: `tests/setup.ts`

```typescript
import '@testing-library/jest-dom';
```

**Step 6: Initialize Tailwind**

Run: `npx tailwindcss init -p`

Modify: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: []
};
```

**Step 7: Configure Tailwind in app.css**

Create: `src/app.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 8: Create minimal app.html**

Modify: `src/app.html`

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

**Step 9: Add test script to package.json**

Modify: `package.json` - add to scripts:

```json
"scripts": {
	"dev": "vite dev",
	"build": "vite build",
	"preview": "vite preview",
	"test": "vitest run",
	"test:watch": "vitest"
}
```

**Step 10: Verify setup**

Run: `npm run test`
Expected: "No test files found" (setup working)

**Step 11: Commit**

```bash
git add .
git commit -m "chore: initialize SvelteKit project with TypeScript and Tailwind

- Configure adapter-static for Cloudflare Pages
- Set up Vitest with testing-library/svelte
- Initialize Tailwind CSS
- Install Chart.js dependencies"
```

---

## Task 2: Fee Calculation Functions (TDD)

**Files:**
- Create: `src/lib/calculations/fees.ts`
- Create: `src/lib/calculations/fees.test.ts`

**Step 1: Write failing test for IndexaCapital tier 1**

Create: `src/lib/calculations/fees.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getIndexaCapitalFee } from './fees';

describe('getIndexaCapitalFee', () => {
	it('should return 0.599% for balance under €10,000', () => {
		expect(getIndexaCapitalFee(5000)).toBe(0.599);
		expect(getIndexaCapitalFee(9999)).toBe(0.599);
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module './fees'"

**Step 3: Write minimal implementation**

Create: `src/lib/calculations/fees.ts`

```typescript
export function getIndexaCapitalFee(balance: number): number {
	return 0.599;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/calculations/
git commit -m "test: add IndexaCapital fee tier 1 test"
```

**Step 6: Write test for tier 2**

Modify: `src/lib/calculations/fees.test.ts` - add test:

```typescript
	it('should return 0.579% for balance €10,000 to €100,000', () => {
		expect(getIndexaCapitalFee(10000)).toBe(0.579);
		expect(getIndexaCapitalFee(50000)).toBe(0.579);
		expect(getIndexaCapitalFee(99999)).toBe(0.579);
	});
```

**Step 7: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - returns 0.599 instead of 0.579

**Step 8: Implement tier 2**

Modify: `src/lib/calculations/fees.ts`

```typescript
export function getIndexaCapitalFee(balance: number): number {
	if (balance >= 10000) {
		return 0.579;
	}
	return 0.599;
}
```

**Step 9: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 10: Commit**

```bash
git add src/lib/calculations/fees.test.ts src/lib/calculations/fees.ts
git commit -m "feat: add IndexaCapital fee tier 2"
```

**Step 11: Write tests for all remaining tiers**

Modify: `src/lib/calculations/fees.test.ts` - add tests:

```typescript
	it('should return 0.549% for balance €100,000 to €500,000', () => {
		expect(getIndexaCapitalFee(100000)).toBe(0.549);
		expect(getIndexaCapitalFee(250000)).toBe(0.549);
		expect(getIndexaCapitalFee(499999)).toBe(0.549);
	});

	it('should return 0.494% for balance €500,000 to €1M', () => {
		expect(getIndexaCapitalFee(500000)).toBe(0.494);
		expect(getIndexaCapitalFee(750000)).toBe(0.494);
		expect(getIndexaCapitalFee(999999)).toBe(0.494);
	});

	it('should return 0.444% for balance €1M to €5M', () => {
		expect(getIndexaCapitalFee(1000000)).toBe(0.444);
		expect(getIndexaCapitalFee(3000000)).toBe(0.444);
		expect(getIndexaCapitalFee(4999999)).toBe(0.444);
	});

	it('should return 0.394% for balance €5M to €10M', () => {
		expect(getIndexaCapitalFee(5000000)).toBe(0.394);
		expect(getIndexaCapitalFee(7500000)).toBe(0.394);
		expect(getIndexaCapitalFee(9999999)).toBe(0.394);
	});

	it('should return 0.344% for balance €10M to €50M', () => {
		expect(getIndexaCapitalFee(10000000)).toBe(0.344);
		expect(getIndexaCapitalFee(25000000)).toBe(0.344);
		expect(getIndexaCapitalFee(49999999)).toBe(0.344);
	});

	it('should return 0.294% for balance €50M to €100M', () => {
		expect(getIndexaCapitalFee(50000000)).toBe(0.294);
		expect(getIndexaCapitalFee(75000000)).toBe(0.294);
		expect(getIndexaCapitalFee(99999999)).toBe(0.294);
	});

	it('should return 0.274% for balance over €100M', () => {
		expect(getIndexaCapitalFee(100000000)).toBe(0.274);
		expect(getIndexaCapitalFee(500000000)).toBe(0.274);
	});
```

**Step 12: Run test to verify they fail**

Run: `npm test`
Expected: Multiple FAILs

**Step 13: Implement all tier logic**

Modify: `src/lib/calculations/fees.ts`

```typescript
export function getIndexaCapitalFee(balance: number): number {
	// Management fee based on tier
	let managementFee: number;

	if (balance >= 100000000) {
		managementFee = 0.08;
	} else if (balance >= 50000000) {
		managementFee = 0.1;
	} else if (balance >= 10000000) {
		managementFee = 0.15;
	} else if (balance >= 5000000) {
		managementFee = 0.2;
	} else if (balance >= 1000000) {
		managementFee = 0.25;
	} else if (balance >= 500000) {
		managementFee = 0.3;
	} else if (balance >= 100000) {
		managementFee = 0.355;
	} else if (balance >= 10000) {
		managementFee = 0.385;
	} else {
		managementFee = 0.405;
	}

	// Fixed costs: custody (0.096%) + underlying (0.098%)
	const fixedCosts = 0.096 + 0.098;

	return managementFee + fixedCosts;
}
```

**Step 14: Run test to verify they pass**

Run: `npm test`
Expected: All PASS

**Step 15: Commit**

```bash
git add src/lib/calculations/fees.test.ts src/lib/calculations/fees.ts
git commit -m "feat: implement all IndexaCapital fee tiers"
```

**Step 16: Write test for MyInvestor fee**

Modify: `src/lib/calculations/fees.test.ts` - add:

```typescript
import { getIndexaCapitalFee, getMyInvestorFee } from './fees';

describe('getMyInvestorFee', () => {
	it('should return 0.35% for default TER (0.05%)', () => {
		expect(getMyInvestorFee(0.05)).toBe(0.35);
	});

	it('should return 0.89% for maximum TER (0.59%)', () => {
		expect(getMyInvestorFee(0.59)).toBe(0.89);
	});

	it('should return correct fee for custom TER', () => {
		expect(getMyInvestorFee(0.25)).toBe(0.55);
	});
});
```

**Step 17: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "getMyInvestorFee is not a function"

**Step 18: Implement MyInvestor fee**

Modify: `src/lib/calculations/fees.ts` - add:

```typescript
export function getMyInvestorFee(ter: number): number {
	const managementFee = 0.3;
	return managementFee + ter;
}
```

**Step 19: Run test to verify it passes**

Run: `npm test`
Expected: All PASS

**Step 20: Commit**

```bash
git add src/lib/calculations/fees.test.ts src/lib/calculations/fees.ts
git commit -m "feat: implement MyInvestor fee calculation"
```

---

## Task 3: Monthly Compounding Logic (TDD)

**Files:**
- Create: `src/lib/calculations/compounding.ts`
- Create: `src/lib/calculations/compounding.test.ts`

**Step 1: Write test for simple monthly growth**

Create: `src/lib/calculations/compounding.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { calculateMonthlyGrowth } from './compounding';

describe('calculateMonthlyGrowth', () => {
	it('should apply monthly compound interest correctly', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			monthlyDeposit: 0,
			annualReturn: 12, // 1% per month for easy math
			annualFeeRate: 0,
			totalMonths: 1
		});

		expect(result).toHaveLength(1);
		expect(result[0].balance).toBeCloseTo(1010, 2); // 1000 * 1.01
		expect(result[0].totalReturns).toBeCloseTo(10, 2);
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module './compounding'"

**Step 3: Define types and minimal implementation**

Create: `src/lib/calculations/compounding.ts`

```typescript
export interface MonthlyGrowthParams {
	initialBalance: number;
	monthlyDeposit: number;
	annualReturn: number; // percentage
	annualFeeRate: number; // percentage
	totalMonths: number;
}

export interface MonthlySnapshot {
	month: number;
	balance: number;
	totalDeposited: number;
	totalFeesPaid: number;
	totalReturns: number;
}

export function calculateMonthlyGrowth(params: MonthlyGrowthParams): MonthlySnapshot[] {
	const { initialBalance, annualReturn, totalMonths } = params;
	const monthlyReturnRate = annualReturn / 100 / 12;

	const balance = initialBalance * (1 + monthlyReturnRate);
	const totalReturns = balance - initialBalance;

	return [
		{
			month: 1,
			balance,
			totalDeposited: initialBalance,
			totalFeesPaid: 0,
			totalReturns
		}
	];
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/calculations/compounding.ts src/lib/calculations/compounding.test.ts
git commit -m "test: add monthly compound interest test"
```

**Step 6: Write test for multiple months**

Modify: `src/lib/calculations/compounding.test.ts` - add:

```typescript
	it('should compound over multiple months', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			monthlyDeposit: 0,
			annualReturn: 12,
			annualFeeRate: 0,
			totalMonths: 3
		});

		expect(result).toHaveLength(3);
		expect(result[0].balance).toBeCloseTo(1010, 2);
		expect(result[1].balance).toBeCloseTo(1020.1, 2); // 1010 * 1.01
		expect(result[2].balance).toBeCloseTo(1030.301, 2); // 1020.1 * 1.01
	});
```

**Step 7: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - result has length 1, not 3

**Step 8: Implement loop for multiple months**

Modify: `src/lib/calculations/compounding.ts`

```typescript
export function calculateMonthlyGrowth(params: MonthlyGrowthParams): MonthlySnapshot[] {
	const { initialBalance, monthlyDeposit, annualReturn, annualFeeRate, totalMonths } = params;
	const monthlyReturnRate = annualReturn / 100 / 12;
	const monthlyFeeRate = annualFeeRate / 100 / 12;

	const snapshots: MonthlySnapshot[] = [];
	let balance = initialBalance;
	let totalDeposited = initialBalance;
	let totalFeesPaid = 0;
	let totalReturns = 0;

	for (let month = 1; month <= totalMonths; month++) {
		// Apply monthly return
		const monthlyReturn = balance * monthlyReturnRate;
		balance += monthlyReturn;
		totalReturns += monthlyReturn;

		// Apply monthly fee
		const monthlyFee = balance * monthlyFeeRate;
		balance -= monthlyFee;
		totalFeesPaid += monthlyFee;

		snapshots.push({
			month,
			balance,
			totalDeposited,
			totalFeesPaid,
			totalReturns
		});
	}

	return snapshots;
}
```

**Step 9: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 10: Commit**

```bash
git add src/lib/calculations/compounding.ts src/lib/calculations/compounding.test.ts
git commit -m "feat: implement multi-month compounding loop"
```

**Step 11: Write test for monthly deposits**

Modify: `src/lib/calculations/compounding.test.ts` - add:

```typescript
	it('should add monthly deposits before calculating growth', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			monthlyDeposit: 100,
			annualReturn: 12,
			annualFeeRate: 0,
			totalMonths: 2
		});

		// Month 1: 1000 + 100 = 1100, then * 1.01 = 1111
		expect(result[0].balance).toBeCloseTo(1111, 2);
		expect(result[0].totalDeposited).toBe(1100);

		// Month 2: 1111 + 100 = 1211, then * 1.01 = 1223.11
		expect(result[1].balance).toBeCloseTo(1223.11, 2);
		expect(result[1].totalDeposited).toBe(1200);
	});
```

**Step 12: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - deposit not added

**Step 13: Add deposit logic to loop**

Modify: `src/lib/calculations/compounding.ts` - modify loop:

```typescript
	for (let month = 1; month <= totalMonths; month++) {
		// Add monthly deposit
		balance += monthlyDeposit;
		totalDeposited += monthlyDeposit;

		// Apply monthly return
		const monthlyReturn = balance * monthlyReturnRate;
		balance += monthlyReturn;
		totalReturns += monthlyReturn;

		// Apply monthly fee
		const monthlyFee = balance * monthlyFeeRate;
		balance -= monthlyFee;
		totalFeesPaid += monthlyFee;

		snapshots.push({
			month,
			balance,
			totalDeposited,
			totalFeesPaid,
			totalReturns
		});
	}
```

**Step 14: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 15: Commit**

```bash
git add src/lib/calculations/compounding.ts src/lib/calculations/compounding.test.ts
git commit -m "feat: add monthly deposit support"
```

**Step 16: Write test for fee deduction**

Modify: `src/lib/calculations/compounding.test.ts` - add:

```typescript
	it('should deduct fees monthly', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			monthlyDeposit: 0,
			annualReturn: 12,
			annualFeeRate: 1.2, // 0.1% per month for easy math
			totalMonths: 1
		});

		// Growth: 1000 * 1.01 = 1010
		// Fee: 1010 * 0.001 = 1.01
		// Final: 1010 - 1.01 = 1008.99
		expect(result[0].balance).toBeCloseTo(1008.99, 2);
		expect(result[0].totalFeesPaid).toBeCloseTo(1.01, 2);
	});
```

**Step 17: Run test to verify it passes**

Run: `npm test`
Expected: PASS (already implemented)

**Step 18: Commit**

```bash
git add src/lib/calculations/compounding.test.ts
git commit -m "test: verify fee deduction works correctly"
```

---

## Task 4: Deposit Frequency Logic (TDD)

**Files:**
- Modify: `src/lib/calculations/compounding.ts`
- Modify: `src/lib/calculations/compounding.test.ts`

**Step 1: Add deposit frequency to types**

Modify: `src/lib/calculations/compounding.ts` - update interface:

```typescript
export type DepositFrequency = 'monthly' | 'quarterly' | 'annual';

export interface MonthlyGrowthParams {
	initialBalance: number;
	depositAmount: number;
	depositFrequency: DepositFrequency;
	annualReturn: number;
	annualFeeRate: number;
	totalMonths: number;
}
```

**Step 2: Write test for quarterly deposits**

Modify: `src/lib/calculations/compounding.test.ts` - add:

```typescript
	it('should add deposits quarterly when frequency is quarterly', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			depositAmount: 300,
			depositFrequency: 'quarterly',
			annualReturn: 0,
			annualFeeRate: 0,
			totalMonths: 6
		});

		// Deposits at month 3 and 6
		expect(result[0].totalDeposited).toBe(1000); // No deposit month 1
		expect(result[1].totalDeposited).toBe(1000); // No deposit month 2
		expect(result[2].totalDeposited).toBe(1300); // Deposit month 3
		expect(result[3].totalDeposited).toBe(1300); // No deposit month 4
		expect(result[4].totalDeposited).toBe(1300); // No deposit month 5
		expect(result[5].totalDeposited).toBe(1600); // Deposit month 6
	});
```

**Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - deposits every month

**Step 4: Implement deposit frequency logic**

Modify: `src/lib/calculations/compounding.ts` - update loop:

```typescript
export function calculateMonthlyGrowth(params: MonthlyGrowthParams): MonthlySnapshot[] {
	const { initialBalance, depositAmount, depositFrequency, annualReturn, annualFeeRate, totalMonths } = params;
	const monthlyReturnRate = annualReturn / 100 / 12;
	const monthlyFeeRate = annualFeeRate / 100 / 12;

	const snapshots: MonthlySnapshot[] = [];
	let balance = initialBalance;
	let totalDeposited = initialBalance;
	let totalFeesPaid = 0;
	let totalReturns = 0;

	for (let month = 1; month <= totalMonths; month++) {
		// Determine if deposit happens this month
		const shouldDeposit =
			depositFrequency === 'monthly' ||
			(depositFrequency === 'quarterly' && month % 3 === 0) ||
			(depositFrequency === 'annual' && month % 12 === 0);

		if (shouldDeposit) {
			balance += depositAmount;
			totalDeposited += depositAmount;
		}

		// Apply monthly return
		const monthlyReturn = balance * monthlyReturnRate;
		balance += monthlyReturn;
		totalReturns += monthlyReturn;

		// Apply monthly fee
		const monthlyFee = balance * monthlyFeeRate;
		balance -= monthlyFee;
		totalFeesPaid += monthlyFee;

		snapshots.push({
			month,
			balance,
			totalDeposited,
			totalFeesPaid,
			totalReturns
		});
	}

	return snapshots;
}
```

**Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/calculations/compounding.ts src/lib/calculations/compounding.test.ts
git commit -m "feat: implement quarterly deposit frequency"
```

**Step 7: Write test for annual deposits**

Modify: `src/lib/calculations/compounding.test.ts` - add:

```typescript
	it('should add deposits annually when frequency is annual', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			depositAmount: 1000,
			depositFrequency: 'annual',
			annualReturn: 0,
			annualFeeRate: 0,
			totalMonths: 24
		});

		// Deposits at month 12 and 24
		expect(result[11].totalDeposited).toBe(2000); // Month 12
		expect(result[12].totalDeposited).toBe(2000); // Month 13 (no deposit)
		expect(result[23].totalDeposited).toBe(3000); // Month 24
	});
```

**Step 8: Run test to verify it passes**

Run: `npm test`
Expected: PASS (already implemented)

**Step 9: Commit**

```bash
git add src/lib/calculations/compounding.test.ts
git commit -m "test: verify annual deposit frequency"
```

**Step 10: Update existing test to use new interface**

Modify: `src/lib/calculations/compounding.test.ts` - update all tests to include depositFrequency:

Replace `monthlyDeposit: 0` with `depositAmount: 0, depositFrequency: 'monthly'`
Replace `monthlyDeposit: 100` with `depositAmount: 100, depositFrequency: 'monthly'`

**Step 11: Run test to verify all pass**

Run: `npm test`
Expected: All PASS

**Step 12: Commit**

```bash
git add src/lib/calculations/compounding.test.ts
git commit -m "refactor: update tests to use new deposit frequency interface"
```

---

## Task 5: Main Simulator Function (TDD)

**Files:**
- Create: `src/lib/calculations/simulator.ts`
- Create: `src/lib/calculations/simulator.test.ts`

**Step 1: Define types**

Create: `src/lib/calculations/simulator.ts`

```typescript
import type { DepositFrequency, MonthlySnapshot } from './compounding';

export interface SimulationParams {
	initialInvestment: number;
	depositAmount: number;
	depositFrequency: DepositFrequency;
	timePeriodYears: number;
	expectedReturn: number;
	myInvestorTER: number;
}

export interface ProviderResult {
	totalInvested: number;
	totalFeesPaid: number;
	totalReturns: number;
	finalBalance: number;
	monthlySnapshots: MonthlySnapshot[];
}

export interface SimulationResults {
	indexaCapital: ProviderResult;
	myInvestor: ProviderResult;
}
```

**Step 2: Write test for basic simulation**

Create: `src/lib/calculations/simulator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { calculateProviderComparison } from './simulator';

describe('calculateProviderComparison', () => {
	it('should simulate both providers and return results', () => {
		const params = {
			initialInvestment: 10000,
			depositAmount: 100,
			depositFrequency: 'monthly' as const,
			timePeriodYears: 1,
			expectedReturn: 7,
			myInvestorTER: 0.05
		};

		const result = calculateProviderComparison(params);

		expect(result).toHaveProperty('indexaCapital');
		expect(result).toHaveProperty('myInvestor');
		expect(result.indexaCapital.monthlySnapshots).toHaveLength(12);
		expect(result.myInvestor.monthlySnapshots).toHaveLength(12);
		expect(result.indexaCapital.finalBalance).toBeGreaterThan(10000);
		expect(result.myInvestor.finalBalance).toBeGreaterThan(10000);
	});
});
```

**Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "calculateProviderComparison is not a function"

**Step 4: Implement simulator function**

Modify: `src/lib/calculations/simulator.ts` - add:

```typescript
import { calculateMonthlyGrowth } from './compounding';
import { getIndexaCapitalFee, getMyInvestorFee } from './fees';

export function calculateProviderComparison(params: SimulationParams): SimulationResults {
	const totalMonths = params.timePeriodYears * 12;

	// Simulate IndexaCapital with dynamic tiered fees
	const indexaSnapshots = simulateWithDynamicFees(
		params,
		totalMonths,
		getIndexaCapitalFee
	);

	// Simulate MyInvestor with fixed fees
	const myInvestorFeeRate = getMyInvestorFee(params.myInvestorTER);
	const myInvestorSnapshots = calculateMonthlyGrowth({
		initialBalance: params.initialInvestment,
		depositAmount: params.depositAmount,
		depositFrequency: params.depositFrequency,
		annualReturn: params.expectedReturn,
		annualFeeRate: myInvestorFeeRate,
		totalMonths
	});

	return {
		indexaCapital: buildProviderResult(indexaSnapshots),
		myInvestor: buildProviderResult(myInvestorSnapshots)
	};
}

function simulateWithDynamicFees(
	params: SimulationParams,
	totalMonths: number,
	getFeeRate: (balance: number) => number
): MonthlySnapshot[] {
	// For IndexaCapital, we need to recalculate fees each month based on current balance
	const snapshots: MonthlySnapshot[] = [];
	let balance = params.initialInvestment;
	let totalDeposited = params.initialInvestment;
	let totalFeesPaid = 0;
	let totalReturns = 0;

	const monthlyReturnRate = params.expectedReturn / 100 / 12;

	for (let month = 1; month <= totalMonths; month++) {
		// Determine if deposit happens this month
		const shouldDeposit =
			params.depositFrequency === 'monthly' ||
			(params.depositFrequency === 'quarterly' && month % 3 === 0) ||
			(params.depositFrequency === 'annual' && month % 12 === 0);

		if (shouldDeposit) {
			balance += params.depositAmount;
			totalDeposited += params.depositAmount;
		}

		// Apply monthly return
		const monthlyReturn = balance * monthlyReturnRate;
		balance += monthlyReturn;
		totalReturns += monthlyReturn;

		// Get dynamic fee based on current balance
		const annualFeeRate = getFeeRate(balance);
		const monthlyFeeRate = annualFeeRate / 100 / 12;
		const monthlyFee = balance * monthlyFeeRate;
		balance -= monthlyFee;
		totalFeesPaid += monthlyFee;

		snapshots.push({
			month,
			balance,
			totalDeposited,
			totalFeesPaid,
			totalReturns
		});
	}

	return snapshots;
}

function buildProviderResult(snapshots: MonthlySnapshot[]): ProviderResult {
	const lastSnapshot = snapshots[snapshots.length - 1];
	return {
		totalInvested: lastSnapshot.totalDeposited,
		totalFeesPaid: lastSnapshot.totalFeesPaid,
		totalReturns: lastSnapshot.totalReturns,
		finalBalance: lastSnapshot.balance,
		monthlySnapshots: snapshots
	};
}
```

**Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/calculations/simulator.ts src/lib/calculations/simulator.test.ts
git commit -m "feat: implement main simulator with dynamic fees"
```

**Step 7: Write test comparing fee impact**

Modify: `src/lib/calculations/simulator.test.ts` - add:

```typescript
	it('should show IndexaCapital with lower fees for balances in lower tiers', () => {
		const params = {
			initialInvestment: 5000,
			depositAmount: 0,
			depositFrequency: 'monthly' as const,
			timePeriodYears: 1,
			expectedReturn: 7,
			myInvestorTER: 0.59 // Maximum TER
		};

		const result = calculateProviderComparison(params);

		// IndexaCapital: 0.599% total (tier 1)
		// MyInvestor: 0.89% total (0.30 + 0.59)
		// MyInvestor should have higher fees
		expect(result.myInvestor.totalFeesPaid).toBeGreaterThan(result.indexaCapital.totalFeesPaid);
	});

	it('should show MyInvestor with lower fees for large balances', () => {
		const params = {
			initialInvestment: 2000000, // €2M
			depositAmount: 0,
			depositFrequency: 'monthly' as const,
			timePeriodYears: 1,
			expectedReturn: 7,
			myInvestorTER: 0.05
		};

		const result = calculateProviderComparison(params);

		// IndexaCapital: 0.444% (€1M-€5M tier)
		// MyInvestor: 0.35% (0.30 + 0.05)
		// IndexaCapital should have higher fees
		expect(result.indexaCapital.totalFeesPaid).toBeGreaterThan(result.myInvestor.totalFeesPaid);
	});
```

**Step 8: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 9: Commit**

```bash
git add src/lib/calculations/simulator.test.ts
git commit -m "test: verify fee comparison logic between providers"
```

---

## Task 6: Simulation Parameters Store

**Files:**
- Create: `src/lib/stores/simulationParams.ts`
- Create: `src/lib/stores/simulationParams.test.ts`

**Step 1: Write test for store initialization**

Create: `src/lib/stores/simulationParams.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { simulationParams } from './simulationParams';

describe('simulationParams store', () => {
	it('should initialize with default values', () => {
		const params = get(simulationParams);

		expect(params.initialInvestment).toBe(1000);
		expect(params.depositAmount).toBe(100);
		expect(params.depositFrequency).toBe('monthly');
		expect(params.timePeriodYears).toBe(20);
		expect(params.expectedReturn).toBe(7);
		expect(params.myInvestorTER).toBe(0.05);
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module"

**Step 3: Implement store**

Create: `src/lib/stores/simulationParams.ts`

```typescript
import { writable } from 'svelte/store';
import type { SimulationParams } from '$lib/calculations/simulator';

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

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/stores/simulationParams.ts src/lib/stores/simulationParams.test.ts
git commit -m "feat: create simulation parameters store"
```

**Step 6: Write test for store updates**

Modify: `src/lib/stores/simulationParams.test.ts` - add:

```typescript
	it('should allow updating parameters', () => {
		simulationParams.set({
			initialInvestment: 5000,
			depositAmount: 200,
			depositFrequency: 'quarterly',
			timePeriodYears: 10,
			expectedReturn: 8,
			myInvestorTER: 0.25
		});

		const params = get(simulationParams);
		expect(params.initialInvestment).toBe(5000);
		expect(params.depositAmount).toBe(200);
		expect(params.depositFrequency).toBe('quarterly');
	});
```

**Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS (writable store already supports this)

**Step 8: Commit**

```bash
git add src/lib/stores/simulationParams.test.ts
git commit -m "test: verify store update functionality"
```

---

## Task 7: Simulation Results Derived Store

**Files:**
- Create: `src/lib/stores/simulationResults.ts`
- Create: `src/lib/stores/simulationResults.test.ts`

**Step 1: Write test for derived store**

Create: `src/lib/stores/simulationResults.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { simulationParams } from './simulationParams';
import { simulationResults } from './simulationResults';

describe('simulationResults store', () => {
	it('should derive results from simulation parameters', () => {
		simulationParams.set({
			initialInvestment: 10000,
			depositAmount: 100,
			depositFrequency: 'monthly',
			timePeriodYears: 1,
			expectedReturn: 7,
			myInvestorTER: 0.05
		});

		const results = get(simulationResults);

		expect(results.indexaCapital.finalBalance).toBeGreaterThan(10000);
		expect(results.myInvestor.finalBalance).toBeGreaterThan(10000);
		expect(results.indexaCapital.monthlySnapshots).toHaveLength(12);
		expect(results.myInvestor.monthlySnapshots).toHaveLength(12);
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module"

**Step 3: Implement derived store**

Create: `src/lib/stores/simulationResults.ts`

```typescript
import { derived } from 'svelte/store';
import { simulationParams } from './simulationParams';
import { calculateProviderComparison } from '$lib/calculations/simulator';

export const simulationResults = derived(simulationParams, ($params) => {
	return calculateProviderComparison($params);
});
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/stores/simulationResults.ts src/lib/stores/simulationResults.test.ts
git commit -m "feat: create derived simulation results store"
```

**Step 6: Write test for reactivity**

Modify: `src/lib/stores/simulationResults.test.ts` - add:

```typescript
	it('should automatically recalculate when params change', () => {
		simulationParams.set({
			initialInvestment: 1000,
			depositAmount: 0,
			depositFrequency: 'monthly',
			timePeriodYears: 1,
			expectedReturn: 0,
			myInvestorTER: 0.05
		});

		const results1 = get(simulationResults);
		const balance1 = results1.indexaCapital.finalBalance;

		// Change expected return
		simulationParams.update(p => ({ ...p, expectedReturn: 10 }));

		const results2 = get(simulationResults);
		const balance2 = results2.indexaCapital.finalBalance;

		// With 10% return, final balance should be higher
		expect(balance2).toBeGreaterThan(balance1);
	});
```

**Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS (derived stores are reactive by default)

**Step 8: Commit**

```bash
git add src/lib/stores/simulationResults.test.ts
git commit -m "test: verify derived store reactivity"
```

---

## Task 8: URL Synchronization Utilities

**Files:**
- Create: `src/lib/utils/urlSync.ts`
- Create: `src/lib/utils/urlSync.test.ts`

**Step 1: Write test for encoding params to URL**

Create: `src/lib/utils/urlSync.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { paramsToUrl, urlToParams } from './urlSync';
import type { SimulationParams } from '$lib/calculations/simulator';

describe('paramsToUrl', () => {
	it('should encode simulation params to URL search string', () => {
		const params: SimulationParams = {
			initialInvestment: 5000,
			depositAmount: 200,
			depositFrequency: 'quarterly',
			timePeriodYears: 15,
			expectedReturn: 8.5,
			myInvestorTER: 0.25
		};

		const url = paramsToUrl(params);

		expect(url).toContain('initial=5000');
		expect(url).toContain('deposit=200');
		expect(url).toContain('freq=quarterly');
		expect(url).toContain('years=15');
		expect(url).toContain('return=8.5');
		expect(url).toContain('ter=0.25');
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module"

**Step 3: Implement paramsToUrl**

Create: `src/lib/utils/urlSync.ts`

```typescript
import type { SimulationParams } from '$lib/calculations/simulator';

export function paramsToUrl(params: SimulationParams): string {
	const searchParams = new URLSearchParams({
		initial: params.initialInvestment.toString(),
		deposit: params.depositAmount.toString(),
		freq: params.depositFrequency,
		years: params.timePeriodYears.toString(),
		return: params.expectedReturn.toString(),
		ter: params.myInvestorTER.toString()
	});

	return searchParams.toString();
}

export function urlToParams(url: string): Partial<SimulationParams> {
	return {};
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/utils/urlSync.ts src/lib/utils/urlSync.test.ts
git commit -m "feat: implement params to URL encoding"
```

**Step 6: Write test for decoding URL to params**

Modify: `src/lib/utils/urlSync.test.ts` - add:

```typescript
describe('urlToParams', () => {
	it('should decode URL search string to simulation params', () => {
		const url = 'initial=5000&deposit=200&freq=quarterly&years=15&return=8.5&ter=0.25';

		const params = urlToParams(url);

		expect(params.initialInvestment).toBe(5000);
		expect(params.depositAmount).toBe(200);
		expect(params.depositFrequency).toBe('quarterly');
		expect(params.timePeriodYears).toBe(15);
		expect(params.expectedReturn).toBe(8.5);
		expect(params.myInvestorTER).toBe(0.25);
	});

	it('should return empty object for invalid URL params', () => {
		const url = 'invalid=data';

		const params = urlToParams(url);

		expect(Object.keys(params)).toHaveLength(0);
	});

	it('should handle missing params gracefully', () => {
		const url = 'initial=1000&years=10';

		const params = urlToParams(url);

		expect(params.initialInvestment).toBe(1000);
		expect(params.timePeriodYears).toBe(10);
		expect(params.depositAmount).toBeUndefined();
	});
});
```

**Step 7: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - returns empty object

**Step 8: Implement urlToParams**

Modify: `src/lib/utils/urlSync.ts`

```typescript
export function urlToParams(url: string): Partial<SimulationParams> {
	const searchParams = new URLSearchParams(url);
	const params: Partial<SimulationParams> = {};

	const initial = searchParams.get('initial');
	if (initial) {
		const num = parseFloat(initial);
		if (!isNaN(num) && num > 0) params.initialInvestment = num;
	}

	const deposit = searchParams.get('deposit');
	if (deposit) {
		const num = parseFloat(deposit);
		if (!isNaN(num) && num >= 0) params.depositAmount = num;
	}

	const freq = searchParams.get('freq');
	if (freq === 'monthly' || freq === 'quarterly' || freq === 'annual') {
		params.depositFrequency = freq;
	}

	const years = searchParams.get('years');
	if (years) {
		const num = parseFloat(years);
		if (!isNaN(num) && num > 0) params.timePeriodYears = num;
	}

	const returnRate = searchParams.get('return');
	if (returnRate) {
		const num = parseFloat(returnRate);
		if (!isNaN(num)) params.expectedReturn = num;
	}

	const ter = searchParams.get('ter');
	if (ter) {
		const num = parseFloat(ter);
		if (!isNaN(num) && num >= 0.05 && num <= 0.59) params.myInvestorTER = num;
	}

	return params;
}
```

**Step 9: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 10: Commit**

```bash
git add src/lib/utils/urlSync.ts src/lib/utils/urlSync.test.ts
git commit -m "feat: implement URL to params decoding with validation"
```

---

## Task 9: Currency Formatter Utility

**Files:**
- Create: `src/lib/utils/formatters.ts`
- Create: `src/lib/utils/formatters.test.ts`

**Step 1: Write test for currency formatting**

Create: `src/lib/utils/formatters.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage } from './formatters';

describe('formatCurrency', () => {
	it('should format numbers as Euro currency', () => {
		expect(formatCurrency(1234.56)).toBe('1.234,56 €');
		expect(formatCurrency(1000000)).toBe('1.000.000,00 €');
		expect(formatCurrency(0.99)).toBe('0,99 €');
	});

	it('should handle negative numbers', () => {
		expect(formatCurrency(-123.45)).toBe('-123,45 €');
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module"

**Step 3: Implement formatCurrency**

Create: `src/lib/utils/formatters.ts`

```typescript
export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('es-ES', {
		style: 'currency',
		currency: 'EUR'
	}).format(value);
}

export function formatPercentage(value: number): string {
	return '';
}
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/utils/formatters.ts src/lib/utils/formatters.test.ts
git commit -m "feat: implement Euro currency formatter"
```

**Step 6: Write test for percentage formatting**

Modify: `src/lib/utils/formatters.test.ts` - add:

```typescript
describe('formatPercentage', () => {
	it('should format numbers as percentages with one decimal', () => {
		expect(formatPercentage(7.5)).toBe('7,5%');
		expect(formatPercentage(0.599)).toBe('0,6%');
		expect(formatPercentage(10)).toBe('10,0%');
	});
});
```

**Step 7: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - returns empty string

**Step 8: Implement formatPercentage**

Modify: `src/lib/utils/formatters.ts`

```typescript
export function formatPercentage(value: number): string {
	return new Intl.NumberFormat('es-ES', {
		style: 'decimal',
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	}).format(value) + '%';
}
```

**Step 9: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 10: Commit**

```bash
git add src/lib/utils/formatters.ts src/lib/utils/formatters.test.ts
git commit -m "feat: implement percentage formatter"
```

---

## Task 10: Simulator Form Component

**Files:**
- Create: `src/lib/components/SimulatorForm.svelte`
- Create: `src/lib/components/SimulatorForm.test.ts`

**Step 1: Write test for form rendering**

Create: `src/lib/components/SimulatorForm.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import SimulatorForm from './SimulatorForm.svelte';

describe('SimulatorForm', () => {
	it('should render all input fields', () => {
		render(SimulatorForm);

		expect(screen.getByLabelText(/initial investment/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/deposit amount/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/deposit frequency/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/time period/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/expected return/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/myinvestor ter/i)).toBeInTheDocument();
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module"

**Step 3: Create basic form component**

Create: `src/lib/components/SimulatorForm.svelte`

```svelte
<script lang="ts">
	import { simulationParams } from '$lib/stores/simulationParams';
</script>

<form class="space-y-4">
	<div>
		<label for="initial" class="block text-sm font-medium">
			Initial Investment (€)
		</label>
		<input
			id="initial"
			type="number"
			bind:value={$simulationParams.initialInvestment}
			class="mt-1 block w-full rounded border px-3 py-2"
			min="0"
			step="100"
		/>
	</div>

	<div>
		<label for="deposit" class="block text-sm font-medium">
			Deposit Amount (€)
		</label>
		<input
			id="deposit"
			type="number"
			bind:value={$simulationParams.depositAmount}
			class="mt-1 block w-full rounded border px-3 py-2"
			min="0"
			step="10"
		/>
	</div>

	<div>
		<label for="frequency" class="block text-sm font-medium">
			Deposit Frequency
		</label>
		<select
			id="frequency"
			bind:value={$simulationParams.depositFrequency}
			class="mt-1 block w-full rounded border px-3 py-2"
		>
			<option value="monthly">Monthly</option>
			<option value="quarterly">Quarterly</option>
			<option value="annual">Annual</option>
		</select>
	</div>

	<div>
		<label for="years" class="block text-sm font-medium">
			Time Period (years)
		</label>
		<input
			id="years"
			type="number"
			bind:value={$simulationParams.timePeriodYears}
			class="mt-1 block w-full rounded border px-3 py-2"
			min="1"
			step="1"
		/>
	</div>

	<div>
		<label for="return" class="block text-sm font-medium">
			Expected Return (% per year)
		</label>
		<input
			id="return"
			type="number"
			bind:value={$simulationParams.expectedReturn}
			class="mt-1 block w-full rounded border px-3 py-2"
			step="0.1"
		/>
	</div>

	<div>
		<label for="ter" class="block text-sm font-medium">
			MyInvestor TER (%)
		</label>
		<input
			id="ter"
			type="number"
			bind:value={$simulationParams.myInvestorTER}
			class="mt-1 block w-full rounded border px-3 py-2"
			min="0.05"
			max="0.59"
			step="0.01"
		/>
	</div>
</form>
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/components/SimulatorForm.svelte src/lib/components/SimulatorForm.test.ts
git commit -m "feat: create simulator form component with all inputs"
```

**Step 6: Write test for store binding**

Modify: `src/lib/components/SimulatorForm.test.ts` - add:

```typescript
import { fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { simulationParams } from '$lib/stores/simulationParams';

	it('should update store when inputs change', async () => {
		render(SimulatorForm);

		const initialInput = screen.getByLabelText(/initial investment/i) as HTMLInputElement;

		await fireEvent.input(initialInput, { target: { value: '5000' } });

		const params = get(simulationParams);
		expect(params.initialInvestment).toBe(5000);
	});
```

**Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS (bind:value handles this)

**Step 8: Commit**

```bash
git add src/lib/components/SimulatorForm.test.ts
git commit -m "test: verify form inputs bind to store"
```

---

## Task 11: Breakdown Table Component

**Files:**
- Create: `src/lib/components/BreakdownTable.svelte`
- Create: `src/lib/components/BreakdownTable.test.ts`

**Step 1: Write test for table rendering**

Create: `src/lib/components/BreakdownTable.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import BreakdownTable from './BreakdownTable.svelte';
import type { ProviderResult } from '$lib/calculations/simulator';

describe('BreakdownTable', () => {
	const mockIndexa: ProviderResult = {
		totalInvested: 10000,
		totalFeesPaid: 100,
		totalReturns: 500,
		finalBalance: 10400,
		monthlySnapshots: []
	};

	const mockMyInvestor: ProviderResult = {
		totalInvested: 10000,
		totalFeesPaid: 150,
		totalReturns: 500,
		finalBalance: 10350,
		monthlySnapshots: []
	};

	it('should display both providers side by side', () => {
		render(BreakdownTable, { indexaCapital: mockIndexa, myInvestor: mockMyInvestor });

		expect(screen.getByText('IndexaCapital')).toBeInTheDocument();
		expect(screen.getByText('MyInvestor')).toBeInTheDocument();
	});

	it('should display all financial metrics', () => {
		render(BreakdownTable, { indexaCapital: mockIndexa, myInvestor: mockMyInvestor });

		expect(screen.getByText(/total invested/i)).toBeInTheDocument();
		expect(screen.getByText(/total fees paid/i)).toBeInTheDocument();
		expect(screen.getByText(/total returns/i)).toBeInTheDocument();
		expect(screen.getByText(/final balance/i)).toBeInTheDocument();
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module"

**Step 3: Create breakdown table component**

Create: `src/lib/components/BreakdownTable.svelte`

```svelte
<script lang="ts">
	import type { ProviderResult } from '$lib/calculations/simulator';
	import { formatCurrency } from '$lib/utils/formatters';

	export let indexaCapital: ProviderResult;
	export let myInvestor: ProviderResult;

	$: winner = indexaCapital.finalBalance > myInvestor.finalBalance ? 'indexa' : 'myinvestor';
</script>

<div class="overflow-x-auto">
	<table class="w-full border-collapse">
		<thead>
			<tr class="border-b">
				<th class="py-2 px-4 text-left">Metric</th>
				<th class="py-2 px-4 text-right">IndexaCapital</th>
				<th class="py-2 px-4 text-right">MyInvestor</th>
			</tr>
		</thead>
		<tbody>
			<tr class="border-b">
				<td class="py-2 px-4">Total Invested</td>
				<td class="py-2 px-4 text-right">{formatCurrency(indexaCapital.totalInvested)}</td>
				<td class="py-2 px-4 text-right">{formatCurrency(myInvestor.totalInvested)}</td>
			</tr>
			<tr class="border-b">
				<td class="py-2 px-4">Total Fees Paid</td>
				<td class="py-2 px-4 text-right">{formatCurrency(indexaCapital.totalFeesPaid)}</td>
				<td class="py-2 px-4 text-right">{formatCurrency(myInvestor.totalFeesPaid)}</td>
			</tr>
			<tr class="border-b">
				<td class="py-2 px-4">Total Returns</td>
				<td class="py-2 px-4 text-right">{formatCurrency(indexaCapital.totalReturns)}</td>
				<td class="py-2 px-4 text-right">{formatCurrency(myInvestor.totalReturns)}</td>
			</tr>
			<tr class="border-b font-bold">
				<td class="py-2 px-4">Final Balance</td>
				<td class="py-2 px-4 text-right" class:text-green-600={winner === 'indexa'}>
					{formatCurrency(indexaCapital.finalBalance)}
				</td>
				<td class="py-2 px-4 text-right" class:text-green-600={winner === 'myinvestor'}>
					{formatCurrency(myInvestor.finalBalance)}
				</td>
			</tr>
		</tbody>
	</table>
</div>
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/components/BreakdownTable.svelte src/lib/components/BreakdownTable.test.ts
git commit -m "feat: create breakdown table component"
```

**Step 6: Write test for winner highlighting**

Modify: `src/lib/components/BreakdownTable.test.ts` - add:

```typescript
	it('should highlight the winner with higher final balance', () => {
		render(BreakdownTable, { indexaCapital: mockIndexa, myInvestor: mockMyInvestor });

		// IndexaCapital has higher balance (10400 > 10350)
		const rows = screen.getAllByRole('row');
		const finalBalanceRow = rows[rows.length - 1];

		expect(finalBalanceRow.innerHTML).toContain('text-green-600');
	});
```

**Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS (already implemented)

**Step 8: Commit**

```bash
git add src/lib/components/BreakdownTable.test.ts
git commit -m "test: verify winner highlighting in breakdown table"
```

---

## Task 12: Comparison Chart Component

**Files:**
- Create: `src/lib/components/ComparisonChart.svelte`
- Create: `src/lib/components/ComparisonChart.test.ts`

**Step 1: Write test for chart component**

Create: `src/lib/components/ComparisonChart.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ComparisonChart from './ComparisonChart.svelte';
import type { MonthlySnapshot } from '$lib/calculations/compounding';

describe('ComparisonChart', () => {
	const mockSnapshots: MonthlySnapshot[] = [
		{ month: 1, balance: 1000, totalDeposited: 1000, totalFeesPaid: 0, totalReturns: 0 },
		{ month: 2, balance: 1050, totalDeposited: 1000, totalFeesPaid: 5, totalReturns: 55 },
		{ month: 3, balance: 1100, totalDeposited: 1000, totalFeesPaid: 10, totalReturns: 110 }
	];

	it('should render canvas element', () => {
		const { container } = render(ComparisonChart, {
			indexaSnapshots: mockSnapshots,
			myInvestorSnapshots: mockSnapshots
		});

		const canvas = container.querySelector('canvas');
		expect(canvas).toBeInTheDocument();
	});

	it('should accept snapshot data as props', () => {
		const { component } = render(ComparisonChart, {
			indexaSnapshots: mockSnapshots,
			myInvestorSnapshots: mockSnapshots
		});

		expect(component).toBeTruthy();
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL - "Cannot find module"

**Step 3: Create chart component**

Create: `src/lib/components/ComparisonChart.svelte`

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { MonthlySnapshot } from '$lib/calculations/compounding';

	export let indexaSnapshots: MonthlySnapshot[];
	export let myInvestorSnapshots: MonthlySnapshot[];

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		Chart.register(...registerables);
		createChart();

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});

	$: if (chart && indexaSnapshots && myInvestorSnapshots) {
		updateChart();
	}

	function createChart() {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: indexaSnapshots.map((s) => s.month),
				datasets: [
					{
						label: 'IndexaCapital',
						data: indexaSnapshots.map((s) => s.balance),
						borderColor: 'rgb(59, 130, 246)',
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						tension: 0.4
					},
					{
						label: 'MyInvestor',
						data: myInvestorSnapshots.map((s) => s.balance),
						borderColor: 'rgb(239, 68, 68)',
						backgroundColor: 'rgba(239, 68, 68, 0.1)',
						tension: 0.4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'top'
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						callbacks: {
							label: function (context) {
								let label = context.dataset.label || '';
								if (label) {
									label += ': ';
								}
								if (context.parsed.y !== null) {
									label += new Intl.NumberFormat('es-ES', {
										style: 'currency',
										currency: 'EUR'
									}).format(context.parsed.y);
								}
								return label;
							}
						}
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: 'Month'
						}
					},
					y: {
						title: {
							display: true,
							text: 'Portfolio Value (€)'
						},
						ticks: {
							callback: function (value) {
								return new Intl.NumberFormat('es-ES', {
									style: 'currency',
									currency: 'EUR',
									notation: 'compact'
								}).format(value as number);
							}
						}
					}
				}
			}
		});
	}

	function updateChart() {
		if (!chart) return;

		chart.data.labels = indexaSnapshots.map((s) => s.month);
		chart.data.datasets[0].data = indexaSnapshots.map((s) => s.balance);
		chart.data.datasets[1].data = myInvestorSnapshots.map((s) => s.balance);
		chart.update();
	}
</script>

<div class="relative h-96 w-full">
	<canvas bind:this={canvas}></canvas>
</div>
```

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/components/ComparisonChart.svelte src/lib/components/ComparisonChart.test.ts
git commit -m "feat: create comparison chart component with Chart.js"
```

---

## Task 13: Main Page Layout

**Files:**
- Create: `src/routes/+layout.svelte`
- Create: `src/routes/+page.svelte`

**Step 1: Create layout with Tailwind**

Create: `src/routes/+layout.svelte`

```svelte
<script>
	import '../app.css';
</script>

<div class="min-h-screen bg-gray-50">
	<slot />
</div>
```

**Step 2: Create main page**

Create: `src/routes/+page.svelte`

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { simulationParams } from '$lib/stores/simulationParams';
	import { simulationResults } from '$lib/stores/simulationResults';
	import { paramsToUrl, urlToParams } from '$lib/utils/urlSync';
	import SimulatorForm from '$lib/components/SimulatorForm.svelte';
	import ComparisonChart from '$lib/components/ComparisonChart.svelte';
	import BreakdownTable from '$lib/components/BreakdownTable.svelte';

	// Load params from URL on mount
	onMount(() => {
		if (browser) {
			const urlParams = urlToParams(window.location.search.substring(1));
			if (Object.keys(urlParams).length > 0) {
				simulationParams.update((current) => ({ ...current, ...urlParams }));
			}
		}
	});

	// Sync params to URL on change
	$: if (browser && $simulationParams) {
		const url = paramsToUrl($simulationParams);
		const newUrl = `${window.location.pathname}?${url}`;
		window.history.replaceState({}, '', newUrl);
	}
</script>

<svelte:head>
	<title>IndexFunds Comparison Simulator</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">IndexFunds Comparison Simulator</h1>
		<p class="mt-2 text-gray-600">
			Compare investment returns between MyInvestor and IndexaCapital
		</p>
	</header>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Form Section -->
		<div class="lg:col-span-1">
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold">Simulation Parameters</h2>
				<SimulatorForm />
			</div>
		</div>

		<!-- Results Section -->
		<div class="lg:col-span-2">
			<div class="space-y-6">
				<!-- Chart -->
				<div class="rounded-lg bg-white p-6 shadow">
					<h2 class="mb-4 text-xl font-semibold">Portfolio Growth Over Time</h2>
					<ComparisonChart
						indexaSnapshots={$simulationResults.indexaCapital.monthlySnapshots}
						myInvestorSnapshots={$simulationResults.myInvestor.monthlySnapshots}
					/>
				</div>

				<!-- Breakdown -->
				<div class="rounded-lg bg-white p-6 shadow">
					<h2 class="mb-4 text-xl font-semibold">Financial Breakdown</h2>
					<BreakdownTable
						indexaCapital={$simulationResults.indexaCapital}
						myInvestor={$simulationResults.myInvestor}
					/>
				</div>
			</div>
		</div>
	</div>
</div>
```

**Step 3: Test dev server**

Run: `npm run dev`
Expected: Dev server starts, navigate to localhost to see the app

**Step 4: Commit**

```bash
git add src/routes/
git commit -m "feat: create main page layout with all components"
```

---

## Task 14: Code Quality Tools Setup

**Files:**
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`
- Create: `.prettierignore`

**Step 1: Install linting dependencies**

Run:
```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint-plugin-svelte svelte-eslint-parser
npm install -D prettier prettier-plugin-svelte
```
Expected: All packages installed

**Step 2: Configure ESLint**

Create: `.eslintrc.cjs`

```javascript
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	]
};
```

**Step 3: Configure Prettier**

Create: `.prettierrc`

```json
{
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100,
	"plugins": ["prettier-plugin-svelte"],
	"overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }]
}
```

**Step 4: Create Prettier ignore file**

Create: `.prettierignore`

```
.svelte-kit/
build/
node_modules/
package-lock.json
```

**Step 5: Add scripts to package.json**

Modify: `package.json` - add to scripts:

```json
"lint": "eslint . --ext .js,.ts,.svelte",
"format": "prettier --write ."
```

**Step 6: Run linter**

Run: `npm run lint`
Expected: No errors (or fixable warnings)

**Step 7: Run formatter**

Run: `npm run format`
Expected: Files formatted

**Step 8: Commit**

```bash
git add .eslintrc.cjs .prettierrc .prettierignore package.json package-lock.json
git commit -m "chore: configure ESLint and Prettier"
```

---

## Task 15: Cloudflare Pages Configuration

**Files:**
- Create: `.node-version`
- Modify: `svelte.config.js` (verify adapter-static settings)

**Step 1: Specify Node version**

Create: `.node-version`

```
20
```

**Step 2: Verify adapter-static configuration**

Check: `svelte.config.js` has correct adapter settings (should already be set from Task 1)

**Step 3: Test production build**

Run: `npm run build`
Expected: Build succeeds, creates `build/` directory

**Step 4: Test preview**

Run: `npm run preview`
Expected: Preview server starts, site works correctly

**Step 5: Commit**

```bash
git add .node-version
git commit -m "chore: configure for Cloudflare Pages deployment"
```

---

## Task 16: README and Documentation

**Files:**
- Create: `README.md`

**Step 1: Create README**

Create: `README.md`

```markdown
# IndexFunds Comparison Simulator

A static web application that simulates and compares investment returns between MyInvestor and IndexaCapital, two Spanish index fund providers.

## Features

- 📊 Visual comparison chart showing portfolio growth over time
- 💰 Detailed financial breakdown (fees, returns, final balance)
- 🔗 Shareable URLs with simulation parameters
- 📱 Mobile-first responsive design
- ⚡ Static site - no backend required
- 🧪 Comprehensive test coverage with TDD

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

| Portfolio Value | Total Annual Fee |
|----------------|------------------|
| < €10k | 0.599% |
| €10k - €100k | 0.579% |
| €100k - €500k | 0.549% |
| €500k - €1M | 0.494% |
| €1M - €5M | 0.444% |
| €5M - €10M | 0.394% |
| €10M - €50M | 0.344% |
| €50M - €100M | 0.294% |
| > €100M | 0.274% |

*Includes management fee + 0.194% fixed costs (custody + underlying)*

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
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add comprehensive README"
```

---

## Task 17: Final Verification and Testing

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests PASS

**Step 2: Run linter**

Run: `npm run lint`
Expected: No errors

**Step 3: Build production**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Test production build**

Run: `npm run preview`
Expected: Site works correctly, all features functional

**Step 5: Test URL sharing**

1. Open preview
2. Change simulation parameters
3. Copy URL
4. Open in new tab/incognito
Expected: Parameters load correctly from URL

**Step 6: Test mobile responsive**

1. Open preview
2. Open browser dev tools
3. Test different mobile viewports
Expected: Layout adapts correctly, no overflow

**Step 7: Final commit**

```bash
git add .
git commit -m "chore: final verification and cleanup"
```

---

## Deployment Instructions

### Cloudflare Pages Setup

1. **Push to GitHub**
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect Cloudflare Pages**
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project"
   - Connect to your GitHub repository
   - Configure build:
     - Build command: `npm run build`
     - Build output directory: `build`
     - Environment variables: None needed
   - Click "Save and Deploy"

3. **Verify Deployment**
   - Wait for build to complete
   - Visit the provided `.pages.dev` URL
   - Test all functionality
   - Share URL with stakeholders

### Custom Domain (Optional)

- In Cloudflare Pages settings → Custom domains
- Add your domain
- DNS records configured automatically

---

## Success Criteria

✅ All tests passing (>90% coverage)
✅ Production build succeeds
✅ URL sharing works correctly
✅ Mobile responsive on all viewports
✅ Chart displays correctly with both provider lines
✅ Breakdown table shows accurate calculations
✅ Form inputs bind to store and update results
✅ IndexaCapital tiered fees calculated correctly
✅ MyInvestor fixed fees calculated correctly
✅ Deployable to Cloudflare Pages

---

## Notes for Implementation

**TDD Discipline:**
- Write test first, watch it fail
- Write minimal code to pass
- Refactor if needed
- Commit frequently

**DRY Principle:**
- Reuse calculation functions
- Don't duplicate fee logic
- Single source of truth for types

**YAGNI:**
- No features beyond requirements
- No premature optimization
- Keep it simple

**Testing Focus:**
- Test logic thoroughly
- Test components in isolation
- No heavy browser/E2E tests
- Fast test suite (<5s)
