# Fee Display and Bracket Visualization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Display fee information for both providers and visualize IndexaCapital fee bracket changes on the chart with average fee calculation.

**Architecture:** Extend MonthlySnapshot to track current fee rates, add bracket change detection logic, calculate IndexaCapital average fee, display fee information in UI cards, and add vertical markers to chart.js for bracket transitions.

**Tech Stack:** TypeScript, Svelte, Chart.js, Vitest

---

## Task 1: Extend MonthlySnapshot Interface

**Files:**
- Modify: `src/lib/calculations/compounding.ts:12-18`
- Modify: `src/lib/calculations/simulator.ts:50-98`
- Test: `src/lib/calculations/simulator.test.ts`

**Step 1: Write failing test for fee rate tracking**

Add to `src/lib/calculations/simulator.test.ts`:

```typescript
it('tracks current fee rate in monthly snapshots', () => {
	const params: SimulationParams = {
		initialInvestment: 1000,
		depositAmount: 100,
		depositFrequency: 'monthly',
		timePeriodYears: 1,
		expectedReturn: 7,
		myInvestorTER: 0.05
	};

	const results = calculateProviderComparison(params);

	// Every snapshot should have a feeRate
	expect(results.indexaCapital.monthlySnapshots[0].feeRate).toBeDefined();
	expect(results.myInvestor.monthlySnapshots[0].feeRate).toBeDefined();

	// MyInvestor should have constant fee rate
	const myInvestorFees = results.myInvestor.monthlySnapshots.map(s => s.feeRate);
	expect(new Set(myInvestorFees).size).toBe(1);
	expect(myInvestorFees[0]).toBe(0.35); // 0.3 management + 0.05 TER
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- simulator.test.ts`
Expected: FAIL with "Property 'feeRate' does not exist on type 'MonthlySnapshot'"

**Step 3: Add feeRate to MonthlySnapshot interface**

In `src/lib/calculations/compounding.ts:12-18`:

```typescript
export interface MonthlySnapshot {
	month: number;
	balance: number;
	totalDeposited: number;
	totalFeesPaid: number;
	totalReturns: number;
	feeRate: number; // Annual fee rate as percentage
}
```

**Step 4: Update calculateMonthlyGrowth to include feeRate**

In `src/lib/calculations/compounding.ts:60-66`:

```typescript
snapshots.push({
	month,
	balance,
	totalDeposited,
	totalFeesPaid,
	totalReturns,
	feeRate: annualFeeRate
});
```

**Step 5: Update simulateWithDynamicFees to include feeRate**

In `src/lib/calculations/simulator.ts:88-94`:

```typescript
snapshots.push({
	month,
	balance,
	totalDeposited,
	totalFeesPaid,
	totalReturns,
	feeRate: annualFeeRate
});
```

**Step 6: Run test to verify it passes**

Run: `npm test -- simulator.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add src/lib/calculations/compounding.ts src/lib/calculations/simulator.ts src/lib/calculations/simulator.test.ts
git commit -m "feat: add feeRate tracking to MonthlySnapshot"
```

---

## Task 2: Add Bracket Change Detection

**Files:**
- Modify: `src/lib/calculations/compounding.ts:12-18`
- Modify: `src/lib/calculations/simulator.ts:50-98`
- Test: `src/lib/calculations/simulator.test.ts`

**Step 1: Write failing test for bracket change detection**

Add to `src/lib/calculations/simulator.test.ts`:

```typescript
it('detects IndexaCapital fee bracket changes', () => {
	const params: SimulationParams = {
		initialInvestment: 9000,
		depositAmount: 500,
		depositFrequency: 'monthly',
		timePeriodYears: 2,
		expectedReturn: 10,
		myInvestorTER: 0.05
	};

	const results = calculateProviderComparison(params);
	const indexaSnapshots = results.indexaCapital.monthlySnapshots;

	// Find snapshots where bracket changed
	const bracketChanges = indexaSnapshots.filter(s => s.bracketChanged);

	// Should have at least one bracket change (9000 -> 10000 threshold)
	expect(bracketChanges.length).toBeGreaterThan(0);

	// Bracket changes should only happen when balance crosses threshold
	bracketChanges.forEach(snapshot => {
		const prevSnapshot = indexaSnapshots[snapshot.month - 2];
		if (prevSnapshot) {
			expect(snapshot.feeRate).not.toBe(prevSnapshot.feeRate);
		}
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- simulator.test.ts`
Expected: FAIL with "Property 'bracketChanged' does not exist"

**Step 3: Add bracketChanged to MonthlySnapshot interface**

In `src/lib/calculations/compounding.ts:12-18`:

```typescript
export interface MonthlySnapshot {
	month: number;
	balance: number;
	totalDeposited: number;
	totalFeesPaid: number;
	totalReturns: number;
	feeRate: number;
	bracketChanged?: boolean; // True when fee bracket changes
}
```

**Step 4: Implement bracket change detection in simulateWithDynamicFees**

In `src/lib/calculations/simulator.ts:50-98`, update the loop:

```typescript
function simulateWithDynamicFees(
	params: SimulationParams,
	totalMonths: number,
	getFeeRate: (balance: number) => number
): MonthlySnapshot[] {
	const snapshots: MonthlySnapshot[] = [];
	let balance = params.initialInvestment;
	let totalDeposited = params.initialInvestment;
	let totalFeesPaid = 0;
	let totalReturns = 0;
	let previousFeeRate: number | null = null;

	const monthlyReturnRate = params.expectedReturn / 100 / 12;

	for (let month = 1; month <= totalMonths; month++) {
		const shouldDeposit =
			params.depositFrequency === 'monthly' ||
			(params.depositFrequency === 'quarterly' && month % 3 === 0) ||
			(params.depositFrequency === 'annual' && month % 12 === 0);

		if (shouldDeposit) {
			balance += params.depositAmount;
			totalDeposited += params.depositAmount;
		}

		const monthlyReturn = balance * monthlyReturnRate;
		balance += monthlyReturn;
		totalReturns += monthlyReturn;

		const annualFeeRate = getFeeRate(balance);
		const monthlyFeeRate = annualFeeRate / 100 / 12;
		const monthlyFee = balance * monthlyFeeRate;
		balance -= monthlyFee;
		totalFeesPaid += monthlyFee;

		// Detect bracket change
		const bracketChanged = previousFeeRate !== null && annualFeeRate !== previousFeeRate;
		previousFeeRate = annualFeeRate;

		snapshots.push({
			month,
			balance,
			totalDeposited,
			totalFeesPaid,
			totalReturns,
			feeRate: annualFeeRate,
			bracketChanged: bracketChanged || undefined
		});
	}

	return snapshots;
}
```

**Step 5: Run test to verify it passes**

Run: `npm test -- simulator.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/calculations/compounding.ts src/lib/calculations/simulator.ts src/lib/calculations/simulator.test.ts
git commit -m "feat: add bracket change detection to fee simulation"
```

---

## Task 3: Calculate Average Fee for IndexaCapital

**Files:**
- Modify: `src/lib/calculations/simulator.ts:14-20`
- Modify: `src/lib/calculations/simulator.ts:100-109`
- Test: `src/lib/calculations/simulator.test.ts`

**Step 1: Write failing test for average fee calculation**

Add to `src/lib/calculations/simulator.test.ts`:

```typescript
it('calculates average fee for IndexaCapital', () => {
	const params: SimulationParams = {
		initialInvestment: 5000,
		depositAmount: 200,
		depositFrequency: 'monthly',
		timePeriodYears: 3,
		expectedReturn: 8,
		myInvestorTER: 0.05
	};

	const results = calculateProviderComparison(params);

	// IndexaCapital should have averageFeeRate
	expect(results.indexaCapital.averageFeeRate).toBeDefined();
	expect(results.indexaCapital.averageFeeRate).toBeGreaterThan(0);

	// MyInvestor should also have averageFeeRate (same as feeRate since it's constant)
	expect(results.myInvestor.averageFeeRate).toBe(0.35);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- simulator.test.ts`
Expected: FAIL with "Property 'averageFeeRate' does not exist on type 'ProviderResult'"

**Step 3: Add averageFeeRate to ProviderResult interface**

In `src/lib/calculations/simulator.ts:14-20`:

```typescript
export interface ProviderResult {
	totalInvested: number;
	totalFeesPaid: number;
	totalReturns: number;
	finalBalance: number;
	monthlySnapshots: MonthlySnapshot[];
	averageFeeRate: number; // Weighted average annual fee rate
	currentFeeRate: number; // Current annual fee rate (last month)
}
```

**Step 4: Update buildProviderResult to calculate average fee**

In `src/lib/calculations/simulator.ts:100-109`:

```typescript
function buildProviderResult(snapshots: MonthlySnapshot[]): ProviderResult {
	const lastSnapshot = snapshots[snapshots.length - 1];

	// Calculate weighted average fee rate
	// Weight by balance at each month to get accurate average
	let totalWeightedFee = 0;
	let totalWeight = 0;

	snapshots.forEach(snapshot => {
		totalWeightedFee += snapshot.feeRate * snapshot.balance;
		totalWeight += snapshot.balance;
	});

	const averageFeeRate = totalWeight > 0 ? totalWeightedFee / totalWeight : 0;

	return {
		totalInvested: lastSnapshot.totalDeposited,
		totalFeesPaid: lastSnapshot.totalFeesPaid,
		totalReturns: lastSnapshot.totalReturns,
		finalBalance: lastSnapshot.balance,
		monthlySnapshots: snapshots,
		averageFeeRate: Math.round(averageFeeRate * 1000) / 1000, // Round to 3 decimals
		currentFeeRate: lastSnapshot.feeRate
	};
}
```

**Step 5: Run test to verify it passes**

Run: `npm test -- simulator.test.ts`
Expected: PASS

**Step 6: Fix any broken component tests**

Component tests may need updates to mock the new properties. Update as needed:
- `src/lib/components/BreakdownTable.test.ts`
- `src/lib/components/SummaryMetrics.test.ts`
- `src/lib/stores/simulationResults.test.ts`

Add to test data:
```typescript
averageFeeRate: 0.35,
currentFeeRate: 0.35
```

Run: `npm test`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add src/lib/calculations/simulator.ts src/lib/calculations/simulator.test.ts src/lib/components/*.test.ts src/lib/stores/*.test.ts
git commit -m "feat: calculate average and current fee rates for providers"
```

---

## Task 4: Display Fee Information in BreakdownTable

**Files:**
- Modify: `src/lib/components/BreakdownTable.svelte:1-110`
- Test: `src/lib/components/BreakdownTable.test.ts`

**Step 1: Write failing test for fee display**

Add to `src/lib/components/BreakdownTable.test.ts`:

```typescript
it('displays fee information for both providers', () => {
	const indexaWithFees = {
		...indexaCapital,
		averageFeeRate: 0.405,
		currentFeeRate: 0.385
	};

	const myInvestorWithFees = {
		...myInvestor,
		averageFeeRate: 0.35,
		currentFeeRate: 0.35
	};

	render(BreakdownTable, {
		props: {
			indexaCapital: indexaWithFees,
			myInvestor: myInvestorWithFees
		}
	});

	// Check IndexaCapital shows average fee
	expect(screen.getByText(/average fee/i)).toBeTruthy();
	expect(screen.getByText(/0\.405%/)).toBeTruthy(); // or appropriate formatting

	// Check MyInvestor shows fee rate
	expect(screen.getByText(/fee rate/i)).toBeTruthy();
	expect(screen.getByText(/0\.35%/)).toBeTruthy();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- BreakdownTable.test.ts`
Expected: FAIL with "Unable to find element with text"

**Step 3: Add fee display to BreakdownTable component**

In `src/lib/components/BreakdownTable.svelte`, add fee rows after Total Fees section:

```svelte
<script lang="ts">
	import type { ProviderResult } from '$lib/calculations/simulator';
	import { formatCurrency } from '$lib/utils/formatters';

	export let indexaCapital: ProviderResult;
	export let myInvestor: ProviderResult;

	$: winner =
		myInvestor.finalBalance > indexaCapital.finalBalance ? 'myinvestor' : 'indexa';
	$: difference = Math.abs(indexaCapital.finalBalance - myInvestor.finalBalance);
</script>

<div class="space-y-3">
	<!-- Comparison Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
		<!-- IndexaCapital Card -->
		<div
			class="p-4 bg-neu-base rounded-xl
			{winner === 'indexa' ? 'shadow-neu-raised' : 'shadow-neu-raised-sm'}
			transition-all duration-300"
		>
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-neu-text-dark">IndexaCapital</h3>
				{#if winner === 'indexa'}
					<span class="px-2 py-0.5 bg-neu-purple text-white text-xs font-medium rounded-full shadow-neu-raised-sm">
						Winner
					</span>
				{/if}
			</div>

			<div class="space-y-2">
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Invested</span>
					<span class="text-xs font-medium text-neu-text-dark"
						>{formatCurrency(indexaCapital.totalInvested)}</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Returns</span>
					<span class="text-xs font-medium text-neu-green"
						>{formatCurrency(indexaCapital.totalReturns)}</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Fees</span>
					<span class="text-xs font-medium text-neu-red"
						>{formatCurrency(indexaCapital.totalFeesPaid)}</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Average Fee Rate</span>
					<span class="text-xs font-medium text-neu-text"
						>{indexaCapital.averageFeeRate.toFixed(3)}%</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Current Fee Rate</span>
					<span class="text-xs font-medium text-neu-text"
						>{indexaCapital.currentFeeRate.toFixed(3)}%</span
					>
				</div>
				<div class="pt-2 border-t border-neu-dark/20">
					<div class="flex justify-between items-center">
						<span class="text-xs font-semibold text-neu-text-dark">Final Balance</span>
						<span class="text-sm font-bold text-neu-text-dark"
							>{formatCurrency(indexaCapital.finalBalance)}</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- MyInvestor Card -->
		<div
			class="p-4 bg-neu-base rounded-xl
			{winner === 'myinvestor' ? 'shadow-neu-raised' : 'shadow-neu-raised-sm'}
			transition-all duration-300"
		>
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-neu-text-dark">MyInvestor</h3>
				{#if winner === 'myinvestor'}
					<span class="px-2 py-0.5 bg-neu-blue text-white text-xs font-medium rounded-full shadow-neu-raised-sm">
						Winner
					</span>
				{/if}
			</div>

			<div class="space-y-2">
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Invested</span>
					<span class="text-xs font-medium text-neu-text-dark"
						>{formatCurrency(myInvestor.totalInvested)}</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Returns</span>
					<span class="text-xs font-medium text-neu-green"
						>{formatCurrency(myInvestor.totalReturns)}</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Fees</span>
					<span class="text-xs font-medium text-neu-red"
						>{formatCurrency(myInvestor.totalFeesPaid)}</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Fee Rate</span>
					<span class="text-xs font-medium text-neu-text"
						>{myInvestor.currentFeeRate.toFixed(2)}%</span
					>
				</div>
				<div class="pt-2 border-t border-neu-dark/20">
					<div class="flex justify-between items-center">
						<span class="text-xs font-semibold text-neu-text-dark">Final Balance</span>
						<span class="text-sm font-bold text-neu-text-dark"
							>{formatCurrency(myInvestor.finalBalance)}</span
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- BreakdownTable.test.ts`
Expected: PASS

**Step 5: Verify visual appearance in browser**

Run: `npm run dev`
Navigate to: http://localhost:5173
Verify: Fee rates are displayed in both cards

**Step 6: Commit**

```bash
git add src/lib/components/BreakdownTable.svelte src/lib/components/BreakdownTable.test.ts
git commit -m "feat: display fee rates in breakdown table"
```

---

## Task 5: Add Bracket Change Markers to Chart

**Files:**
- Modify: `src/lib/components/ComparisonChart.svelte:1-205`
- Test: Manual verification (Chart.js plugins are difficult to unit test)

**Step 1: Add annotation plugin to Chart.js config**

In `src/lib/components/ComparisonChart.svelte`, update the chart options to add vertical lines at bracket changes:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import type { MonthlySnapshot } from '$lib/calculations/compounding';
	import { Chart, registerables } from 'chart.js';

	export let indexaSnapshots: MonthlySnapshot[];
	export let myInvestorSnapshots: MonthlySnapshot[];

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;
	let loading = true;

	// Find months where IndexaCapital bracket changed
	$: bracketChangeMonths = indexaSnapshots
		.filter(s => s.bracketChanged)
		.map(s => s.month);

	onMount(() => {
		Chart.register(...registerables);

		if (canvas) {
			chart = new Chart(canvas, {
				type: 'line',
				data: {
					labels: indexaSnapshots.map((s) => s.month),
					datasets: [
						{
							label: 'IndexaCapital',
							data: indexaSnapshots.map((s) => s.balance),
							borderColor: '#9d7fc7',
							backgroundColor: 'rgba(157, 127, 199, 0.2)',
							borderWidth: 3,
							tension: 0.4,
							fill: true,
							pointRadius: 0,
							pointHoverRadius: 6,
							pointHoverBackgroundColor: '#9d7fc7',
							pointHoverBorderColor: '#fff',
							pointHoverBorderWidth: 2
						},
						{
							label: 'MyInvestor',
							data: myInvestorSnapshots.map((s) => s.balance),
							borderColor: '#6b9bd1',
							backgroundColor: 'rgba(107, 155, 209, 0.2)',
							borderWidth: 3,
							tension: 0.4,
							fill: true,
							pointRadius: 0,
							pointHoverRadius: 6,
							pointHoverBackgroundColor: '#6b9bd1',
							pointHoverBorderColor: '#fff',
							pointHoverBorderWidth: 2
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					interaction: {
						mode: 'index',
						intersect: false
					},
					plugins: {
						legend: {
							position: 'top',
							labels: {
								color: '#4a5568',
								font: {
									size: 12,
									weight: '500'
								},
								padding: 12,
								usePointStyle: true,
								pointStyle: 'circle'
							}
						},
						tooltip: {
							backgroundColor: 'rgba(224, 229, 236, 0.98)',
							titleColor: '#2d3748',
							bodyColor: '#4a5568',
							borderColor: '#a3b1c6',
							borderWidth: 1,
							padding: 10,
							displayColors: true,
							callbacks: {
								label: function (context) {
									const label = context.dataset.label || '';
									const value = new Intl.NumberFormat('es-ES', {
										style: 'currency',
										currency: 'EUR'
									}).format(context.parsed.y);

									// Get snapshot for this month
									const snapshots = context.datasetIndex === 0 ? indexaSnapshots : myInvestorSnapshots;
									const snapshot = snapshots[context.dataIndex];

									return `${label}: ${value} (Fee: ${snapshot.feeRate.toFixed(3)}%)`;
								},
								footer: function (tooltipItems) {
									if (tooltipItems.length === 0) return '';

									const month = tooltipItems[0].dataIndex + 1;
									const indexaSnapshot = indexaSnapshots[tooltipItems[0].dataIndex];
									const myInvestorSnapshot = myInvestorSnapshots[tooltipItems[0].dataIndex];

									const diff = Math.abs(indexaSnapshot.balance - myInvestorSnapshot.balance);
									const winner = indexaSnapshot.balance > myInvestorSnapshot.balance ? 'IndexaCapital' : 'MyInvestor';
									const formatted = new Intl.NumberFormat('es-ES', {
										style: 'currency',
										currency: 'EUR'
									}).format(diff);

									// Check if this is a bracket change month
									if (indexaSnapshot.bracketChanged) {
										return `${winner} ahead by ${formatted}\n⚠️ Fee bracket changed`;
									}

									return `${winner} ahead by ${formatted}`;
								}
							},
							footerColor: '#718096',
							footerFont: {
								size: 10,
								weight: 'normal'
							}
						}
					},
					scales: {
						x: {
							title: {
								display: true,
								text: 'Month',
								color: '#718096',
								font: {
									size: 12,
									weight: '500'
								}
							},
							grid: {
								color: function(context) {
									// Highlight bracket change months
									const month = context.index + 1;
									if (bracketChangeMonths.includes(month)) {
										return 'rgba(157, 127, 199, 0.4)'; // Purple for bracket changes
									}
									return 'rgba(163, 177, 198, 0.15)';
								},
								lineWidth: function(context) {
									const month = context.index + 1;
									return bracketChangeMonths.includes(month) ? 2 : 1;
								},
								drawBorder: false
							},
							ticks: {
								color: '#718096',
								font: {
									size: 11
								},
								maxTicksLimit: 10
							}
						},
						y: {
							title: {
								display: true,
								text: 'Portfolio Value',
								color: '#718096',
								font: {
									size: 12,
									weight: '500'
								}
							},
							grid: {
								color: 'rgba(163, 177, 198, 0.2)',
								drawBorder: false
							},
							ticks: {
								color: '#718096',
								font: {
									size: 11
								},
								callback: function (value) {
									return new Intl.NumberFormat('es-ES', {
										style: 'currency',
										currency: 'EUR',
										minimumFractionDigits: 0,
										maximumFractionDigits: 0
									}).format(value as number);
								}
							}
						}
					}
				}
			});

			loading = false;
		}

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});
</script>

<div class="relative h-[280px] md:h-[320px] lg:h-[360px] w-full">
	{#if loading}
		<div class="absolute inset-0 flex items-center justify-center bg-neu-base/50 rounded-xl animate-pulse">
			<div class="text-neu-text-light">Loading chart...</div>
		</div>
	{/if}
	<canvas bind:this={canvas} class:opacity-0={loading}></canvas>
</div>
```

**Step 2: Test visual appearance**

Run: `npm run dev`
Navigate to: http://localhost:5173
Verify:
1. Chart displays with purple highlighted vertical lines at bracket changes
2. Tooltip shows "Fee bracket changed" message on those months
3. Tooltip displays current fee rate for each provider
4. Grid lines are thicker at bracket change months

**Step 3: Adjust styling if needed**

Tweak colors, line widths, or tooltip messages based on visual appearance.

**Step 4: Commit**

```bash
git add src/lib/components/ComparisonChart.svelte
git commit -m "feat: add bracket change visualization to comparison chart"
```

---

## Task 6: Add Chart Legend Explanation

**Files:**
- Modify: `src/routes/+page.svelte:91-105`

**Step 1: Add explanatory text below chart**

In `src/routes/+page.svelte`, after the `ComparisonChart` component:

```svelte
<!-- Chart Card -->
<div
	class="p-5 bg-neu-base rounded-2xl shadow-neu-raised animate-slide-up"
	style="animation-delay: 0.1s;"
>
	<div class="mb-4">
		<h2 class="text-base font-semibold text-neu-text-dark mb-1">Portfolio Growth Over Time</h2>
		<p class="text-xs text-neu-text-light">Compare projected returns over investment period</p>
	</div>
	<ComparisonChart
		indexaSnapshots={$simulationResults.indexaCapital.monthlySnapshots}
		myInvestorSnapshots={$simulationResults.myInvestor.monthlySnapshots}
	/>
	<div class="mt-3 flex items-start gap-2 text-xs text-neu-text-light">
		<svg class="w-4 h-4 mt-0.5 text-neu-purple flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<p>
			Purple vertical lines indicate when IndexaCapital's fee bracket changes.
			Hover over the chart to see fee rates and bracket change notifications.
		</p>
	</div>
</div>
```

**Step 2: Test visual appearance**

Run: `npm run dev`
Navigate to: http://localhost:5173
Verify: Explanatory text appears below chart with info icon

**Step 3: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "feat: add chart legend explanation for bracket changes"
```

---

## Task 7: Integration Testing and Documentation

**Files:**
- Test: Manual end-to-end testing
- Create: `docs/features/fee-visualization.md`

**Step 1: Perform end-to-end testing**

Test scenarios:
1. **Low balance (< 10,000)**: Start with 1,000 initial, 100 monthly for 10 years
   - Verify: High fee rate shown for IndexaCapital, no bracket changes

2. **Bracket crossing**: Start with 9,000 initial, 500 monthly for 2 years
   - Verify: Chart shows bracket change marker when balance crosses 10,000
   - Verify: Average fee differs from current fee

3. **Multiple brackets**: Start with 50,000 initial, 5,000 monthly for 5 years
   - Verify: Multiple bracket change markers appear
   - Verify: Fee rates decrease over time

**Step 2: Create feature documentation**

Create `docs/features/fee-visualization.md`:

```markdown
# Fee Visualization Feature

## Overview

The IndexFunds comparison tool now displays detailed fee information and visualizes when IndexaCapital's tiered fee structure causes bracket changes.

## Components

### Fee Display

**Location:** BreakdownTable component

**IndexaCapital:**
- Average Fee Rate: Weighted average across investment period
- Current Fee Rate: Fee rate at final balance

**MyInvestor:**
- Fee Rate: Fixed rate (0.3% + TER)

### Bracket Change Visualization

**Location:** ComparisonChart component

**Visual Indicators:**
- Purple vertical grid lines at months where fee bracket changes
- Thicker grid lines for emphasis
- Tooltip footer shows "⚠️ Fee bracket changed" message

**Data:**
- Each MonthlySnapshot tracks current feeRate
- bracketChanged flag indicates transitions

## IndexaCapital Fee Brackets

Balance Range | Management Fee
---|---
< €10,000 | 0.405%
€10,000 - €99,999 | 0.385%
€100,000 - €499,999 | 0.355%
€500,000 - €999,999 | 0.30%
€1M - €4.99M | 0.25%
€5M - €9.99M | 0.20%
€10M - €49.99M | 0.15%
€50M - €99.99M | 0.10%
≥ €100M | 0.08%

*Plus fixed costs: 0.194% (custody 0.096% + underlying 0.098%)*

## Implementation Details

### Data Model

```typescript
interface MonthlySnapshot {
	month: number;
	balance: number;
	totalDeposited: number;
	totalFeesPaid: number;
	totalReturns: number;
	feeRate: number; // Annual fee rate
	bracketChanged?: boolean; // Fee bracket transition flag
}

interface ProviderResult {
	// ... existing fields
	averageFeeRate: number; // Weighted average
	currentFeeRate: number; // Final month rate
}
```

### Testing

Run full test suite:
```bash
npm test
```

Key test files:
- `src/lib/calculations/simulator.test.ts` - Fee tracking and bracket detection
- `src/lib/components/BreakdownTable.test.ts` - Fee display rendering

### Future Enhancements

- Add fee breakdown showing management vs fixed costs
- Export bracket change data to CSV
- Add annual summary showing average fee per year
```

**Step 3: Run full test suite**

Run: `npm test`
Expected: All tests PASS

**Step 4: Build production bundle**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 5: Commit documentation**

```bash
git add docs/features/fee-visualization.md
git commit -m "docs: add fee visualization feature documentation"
```

---

## Final Verification Checklist

- [ ] All tests passing (59 tests)
- [ ] Fee rates display in BreakdownTable
- [ ] IndexaCapital shows average and current fee
- [ ] MyInvestor shows fixed fee rate
- [ ] Chart highlights bracket changes with purple lines
- [ ] Tooltip shows fee rates for each provider
- [ ] Tooltip shows bracket change notification
- [ ] Chart legend explains purple markers
- [ ] Documentation complete
- [ ] Production build succeeds

---

## Estimated Time

- Task 1: 15 minutes
- Task 2: 20 minutes
- Task 3: 20 minutes
- Task 4: 25 minutes
- Task 5: 30 minutes
- Task 6: 10 minutes
- Task 7: 20 minutes

**Total: ~2.5 hours**
