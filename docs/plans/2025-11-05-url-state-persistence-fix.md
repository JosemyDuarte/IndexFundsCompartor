# URL State Persistence Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix URL parameter persistence so page refreshes and direct links with custom params work correctly instead of always reverting to defaults.

**Architecture:** Use SvelteKit's `$page` store to read URL params during SSR/prerender, then initialize the simulation params store from URL before any reactive statements run. Add a flag to prevent URL sync until initial load completes.

**Tech Stack:** SvelteKit page store, existing urlSync utilities, Svelte writable stores

---

## Root Cause

The current implementation has a race condition:
1. Store initializes with defaults → Reactive statement fires → URL gets overwritten with defaults
2. `onMount` runs → Reads URL (now has defaults) → Updates store (no-op)

This happens because the reactive statement in [+page.svelte:23-27](src/routes/+page.svelte#L23-L27) runs before `onMount` in [+page.svelte:13-20](src/routes/+page.svelte#L13-L20).

---

## Task 1: Write Test for URL Param Preservation

**Files:**
- Create: `tests/lib/utils/urlSync.test.ts`

**Step 1: Write failing test for URL param preservation**

```typescript
import { describe, it, expect } from 'vitest';
import { urlToParams, paramsToUrl } from '$lib/utils/urlSync';

describe('urlSync', () => {
	describe('urlToParams', () => {
		it('should parse all valid URL parameters', () => {
			const urlString = 'initial=5000&deposit=250&freq=quarterly&years=15&return=8.5&ter=0.15';
			const result = urlToParams(urlString);

			expect(result).toEqual({
				initialInvestment: 5000,
				depositAmount: 250,
				depositFrequency: 'quarterly',
				timePeriodYears: 15,
				expectedReturn: 8.5,
				myInvestorTER: 0.15
			});
		});

		it('should handle partial URL parameters', () => {
			const urlString = 'initial=3000&years=10';
			const result = urlToParams(urlString);

			expect(result).toEqual({
				initialInvestment: 3000,
				timePeriodYears: 10
			});
		});

		it('should ignore invalid parameters', () => {
			const urlString = 'initial=-100&deposit=abc&freq=invalid&ter=999';
			const result = urlToParams(urlString);

			expect(result).toEqual({});
		});
	});

	describe('paramsToUrl', () => {
		it('should convert params to URL string', () => {
			const params = {
				initialInvestment: 5000,
				depositAmount: 250,
				depositFrequency: 'quarterly' as const,
				timePeriodYears: 15,
				expectedReturn: 8.5,
				myInvestorTER: 0.15
			};
			const result = paramsToUrl(params);

			expect(result).toBe('initial=5000&deposit=250&freq=quarterly&years=15&return=8.5&ter=0.15');
		});
	});
});
```

**Step 2: Run test to verify existing functionality**

Run: `npm test -- tests/lib/utils/urlSync.test.ts`
Expected: Tests should PASS (these test existing functionality)

**Step 3: Commit**

```bash
git add tests/lib/utils/urlSync.test.ts
git commit -m "test: add URL sync utility tests"
```

---

## Task 2: Add Integration Test for URL State Bug

**Files:**
- Modify: `tests/lib/utils/urlSync.test.ts`

**Step 1: Write failing integration test**

Add to existing test file:

```typescript
describe('URL state persistence integration', () => {
	it('should preserve URL params after initialization', () => {
		// Simulates the bug: reactive statement overwrites URL before onMount reads it
		// This test documents the expected behavior
		const customParams = 'initial=2000&deposit=200&freq=annual&years=25&return=6&ter=0.1';
		const parsed = urlToParams(customParams);
		const reconstructed = paramsToUrl({
			initialInvestment: parsed.initialInvestment ?? 1000,
			depositAmount: parsed.depositAmount ?? 100,
			depositFrequency: parsed.depositFrequency ?? 'monthly',
			timePeriodYears: parsed.timePeriodYears ?? 20,
			expectedReturn: parsed.expectedReturn ?? 7,
			myInvestorTER: parsed.myInvestorTER ?? 0.05
		});

		expect(reconstructed).toBe(customParams);
	});
});
```

**Step 2: Run test to verify it passes**

Run: `npm test -- tests/lib/utils/urlSync.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add tests/lib/utils/urlSync.test.ts
git commit -m "test: add URL state persistence integration test"
```

---

## Task 3: Create +page.ts Load Function

**Files:**
- Create: `src/routes/+page.ts`

**Step 1: Write test for page load function**

Create: `tests/routes/+page.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { load } from '../../src/routes/+page';

describe('+page load function', () => {
	it('should extract URL params from page URL', () => {
		const mockEvent = {
			url: new URL('http://localhost/?initial=3000&deposit=150&freq=quarterly&years=10&return=8&ter=0.2')
		};

		const result = load(mockEvent as any);

		expect(result).toEqual({
			urlParams: {
				initialInvestment: 3000,
				depositAmount: 150,
				depositFrequency: 'quarterly',
				timePeriodYears: 10,
				expectedReturn: 8,
				myInvestorTER: 0.2
			}
		});
	});

	it('should return empty object when no URL params present', () => {
		const mockEvent = {
			url: new URL('http://localhost/')
		};

		const result = load(mockEvent as any);

		expect(result).toEqual({
			urlParams: {}
		});
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/routes/+page.test.ts`
Expected: FAIL with "Cannot find module '../../src/routes/+page'"

**Step 3: Write minimal implementation**

Create: `src/routes/+page.ts`

```typescript
import type { PageLoad } from './$types';
import { urlToParams } from '$lib/utils/urlSync';

export const load: PageLoad = ({ url }) => {
	const urlParams = urlToParams(url.search.substring(1));

	return {
		urlParams
	};
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/routes/+page.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/routes/+page.ts tests/routes/+page.test.ts
git commit -m "feat: add page load function to extract URL params"
```

---

## Task 4: Update Store to Support Initial Values

**Files:**
- Modify: `src/lib/stores/simulationParams.ts`
- Create: `tests/lib/stores/simulationParams.test.ts`

**Step 1: Write test for store initialization with custom values**

```typescript
import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { createSimulationParamsStore } from '$lib/stores/simulationParams';

describe('simulationParams store', () => {
	it('should initialize with provided values', () => {
		const customValues = {
			initialInvestment: 5000,
			depositAmount: 250,
			depositFrequency: 'quarterly' as const,
			timePeriodYears: 15,
			expectedReturn: 8,
			myInvestorTER: 0.2
		};

		const store = createSimulationParamsStore(customValues);
		const value = get(store);

		expect(value).toEqual(customValues);
	});

	it('should merge partial values with defaults', () => {
		const partialValues = {
			initialInvestment: 3000,
			timePeriodYears: 10
		};

		const store = createSimulationParamsStore(partialValues);
		const value = get(store);

		expect(value).toEqual({
			initialInvestment: 3000,
			depositAmount: 100,
			depositFrequency: 'monthly',
			timePeriodYears: 10,
			expectedReturn: 7,
			myInvestorTER: 0.05
		});
	});

	it('should use defaults when no values provided', () => {
		const store = createSimulationParamsStore();
		const value = get(store);

		expect(value).toEqual({
			initialInvestment: 1000,
			depositAmount: 100,
			depositFrequency: 'monthly',
			timePeriodYears: 20,
			expectedReturn: 7,
			myInvestorTER: 0.05
		});
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/stores/simulationParams.test.ts`
Expected: FAIL with "createSimulationParamsStore is not exported"

**Step 3: Write minimal implementation**

Modify: `src/lib/stores/simulationParams.ts`

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

export function createSimulationParamsStore(initialValues?: Partial<SimulationParams>) {
	const merged = { ...defaults, ...initialValues };
	return writable<SimulationParams>(merged);
}

export const simulationParams = createSimulationParamsStore();
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/lib/stores/simulationParams.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/stores/simulationParams.ts tests/lib/stores/simulationParams.test.ts
git commit -m "feat: support custom initial values in simulation params store"
```

---

## Task 5: Update +page.svelte to Use Load Data

**Files:**
- Modify: `src/routes/+page.svelte`

**Step 1: Update +page.svelte to initialize from load data**

Modify the script section in `src/routes/+page.svelte`:

```typescript
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { createSimulationParamsStore } from '$lib/stores/simulationParams';
	import { simulationResults } from '$lib/stores/simulationResults';
	import { paramsToUrl } from '$lib/utils/urlSync';
	import SimulatorForm from '$lib/components/SimulatorForm.svelte';
	import ComparisonChart from '$lib/components/ComparisonChart.svelte';
	import BreakdownTable from '$lib/components/BreakdownTable.svelte';
	import SummaryMetrics from '$lib/components/SummaryMetrics.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// Initialize store with URL params from load function
	const simulationParams = createSimulationParamsStore(data.urlParams);

	// Flag to prevent URL sync until after initial load
	let isInitialLoad = true;

	onMount(() => {
		// Allow URL syncing after component mounts
		isInitialLoad = false;
	});

	// Sync params to URL on change (but not during initial load)
	$: if (browser && !isInitialLoad && $simulationParams) {
		const url = paramsToUrl($simulationParams);
		const newUrl = `${window.location.pathname}?${url}`;
		window.history.replaceState({}, '', newUrl);
	}
</script>
```

**Step 2: Manual test in browser**

Run: `npm run dev`
Test steps:
1. Open `http://localhost:5173/?initial=5000&deposit=200&freq=quarterly&years=15&return=8&ter=0.15`
2. Verify form shows the custom values
3. Refresh the page
4. Verify URL and form values are preserved
5. Change a value in the form
6. Verify URL updates
7. Refresh again
8. Verify new values are preserved

Expected: All steps should work correctly - URL params should persist through refreshes

**Step 3: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "fix: prevent URL params from being overwritten on initial load"
```

---

## Task 6: Add E2E Test for URL Persistence

**Files:**
- Create: `tests/e2e/url-persistence.test.ts`

**Step 1: Write E2E test**

```typescript
import { expect, test } from '@playwright/test';

test.describe('URL State Persistence', () => {
	test('should preserve URL params on page refresh', async ({ page }) => {
		// Navigate with custom params
		await page.goto('/?initial=5000&deposit=200&freq=quarterly&years=15&return=8&ter=0.15');

		// Verify form displays the custom values
		await expect(page.locator('input[name="initialInvestment"]')).toHaveValue('5000');
		await expect(page.locator('input[name="depositAmount"]')).toHaveValue('200');
		await expect(page.locator('select[name="depositFrequency"]')).toHaveValue('quarterly');
		await expect(page.locator('input[name="timePeriodYears"]')).toHaveValue('15');
		await expect(page.locator('input[name="expectedReturn"]')).toHaveValue('8');
		await expect(page.locator('input[name="myInvestorTER"]')).toHaveValue('0.15');

		// Refresh the page
		await page.reload();

		// Verify URL still has custom params
		expect(page.url()).toContain('initial=5000');
		expect(page.url()).toContain('deposit=200');
		expect(page.url()).toContain('freq=quarterly');
		expect(page.url()).toContain('years=15');
		expect(page.url()).toContain('return=8');
		expect(page.url()).toContain('ter=0.15');

		// Verify form still displays the custom values
		await expect(page.locator('input[name="initialInvestment"]')).toHaveValue('5000');
		await expect(page.locator('input[name="depositAmount"]')).toHaveValue('200');
	});

	test('should update URL when form values change', async ({ page }) => {
		// Start with default params
		await page.goto('/');

		// Change a value
		await page.locator('input[name="initialInvestment"]').fill('3000');

		// Wait for URL to update
		await page.waitForFunction(
			() => window.location.search.includes('initial=3000'),
			{ timeout: 1000 }
		);

		// Verify URL was updated
		expect(page.url()).toContain('initial=3000');

		// Refresh and verify persistence
		await page.reload();
		expect(page.url()).toContain('initial=3000');
		await expect(page.locator('input[name="initialInvestment"]')).toHaveValue('3000');
	});

	test('should use defaults when no URL params provided', async ({ page }) => {
		await page.goto('/');

		// Verify default values are displayed
		await expect(page.locator('input[name="initialInvestment"]')).toHaveValue('1000');
		await expect(page.locator('input[name="depositAmount"]')).toHaveValue('100');
		await expect(page.locator('select[name="depositFrequency"]')).toHaveValue('monthly');
		await expect(page.locator('input[name="timePeriodYears"]')).toHaveValue('20');
		await expect(page.locator('input[name="expectedReturn"]')).toHaveValue('7');
		await expect(page.locator('input[name="myInvestorTER"]')).toHaveValue('0.05');
	});
});
```

**Step 2: Check if Playwright is configured**

Run: `npm test:e2e` or check `package.json` for e2e scripts

**Step 3: Skip or adapt based on test setup**

If no Playwright setup exists, this test documents the expected behavior for future E2E testing setup. If it exists, run the test.

**Step 4: Commit**

```bash
git add tests/e2e/url-persistence.test.ts
git commit -m "test: add E2E tests for URL state persistence"
```

---

## Task 7: Update Form Components to Use Correct Store

**Files:**
- Modify: `src/lib/components/SimulatorForm.svelte` (if needed)

**Step 1: Check if SimulatorForm imports the store correctly**

Run: `cat src/lib/components/SimulatorForm.svelte | grep simulationParams`

**Step 2: Verify store import**

The component should import from the store file, not create a new instance. Since we changed the export to a function, we need to ensure existing components still work.

**Step 3: Revert store export to maintain compatibility**

Modify: `src/lib/stores/simulationParams.ts`

Keep both the function export and the singleton:

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

export function createSimulationParamsStore(initialValues?: Partial<SimulationParams>) {
	const merged = { ...defaults, ...initialValues };
	return writable<SimulationParams>(merged);
}

// Export defaults for components that need it
export { defaults as defaultParams };

// Note: This singleton is only used by components that don't create their own instance
// The +page.svelte will create its own instance with URL params
export const simulationParams = writable<SimulationParams>(defaults);
```

**Step 4: Update +page.svelte to pass store as context or prop**

Since Svelte components share stores by import, we need a different approach. Use Svelte context to pass the initialized store to child components.

Modify: `src/routes/+page.svelte`

```typescript
<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { browser } from '$app/environment';
	import { createSimulationParamsStore } from '$lib/stores/simulationParams';
	import { simulationResults } from '$lib/stores/simulationResults';
	import { paramsToUrl } from '$lib/utils/urlSync';
	import SimulatorForm from '$lib/components/SimulatorForm.svelte';
	import ComparisonChart from '$lib/components/ComparisonChart.svelte';
	import BreakdownTable from '$lib/components/BreakdownTable.svelte';
	import SummaryMetrics from '$lib/components/SummaryMetrics.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// Initialize store with URL params from load function
	const simulationParams = createSimulationParamsStore(data.urlParams);

	// Provide store to child components via context
	setContext('simulationParams', simulationParams);

	// Flag to prevent URL sync until after initial load
	let isInitialLoad = true;

	onMount(() => {
		// Allow URL syncing after component mounts
		isInitialLoad = false;
	});

	// Sync params to URL on change (but not during initial load)
	$: if (browser && !isInitialLoad && $simulationParams) {
		const url = paramsToUrl($simulationParams);
		const newUrl = `${window.location.pathname}?${url}`;
		window.history.replaceState({}, '', newUrl);
	}
</script>
```

**Step 5: Run tests to verify no regressions**

Run: `npm test`
Expected: All existing tests should still PASS

**Step 6: Commit**

```bash
git add src/lib/stores/simulationParams.ts src/routes/+page.svelte
git commit -m "refactor: use context to share store instance with components"
```

---

## Task 8: Verification and Documentation

**Files:**
- Modify: `README.md`

**Step 1: Manual verification**

Run: `npm run dev`

Test scenarios:
1. ✅ Open `/` - should show defaults and URL should update with default params
2. ✅ Open `/?initial=5000` - should show 5000 initial investment
3. ✅ Refresh - should keep 5000
4. ✅ Change value to 3000 - URL should update
5. ✅ Refresh - should keep 3000
6. ✅ Share URL with friend - they should see same values

**Step 2: Run full test suite**

Run: `npm test`
Expected: All tests PASS

**Step 3: Build for production**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Update README**

Add to the Features section in `README.md`:

```markdown
## Features

- 📊 Visual comparison chart showing portfolio growth over time
- 💰 Detailed financial breakdown (fees, returns, final balance)
- 🔗 **Shareable URLs with persistent state** - URL params are preserved across refreshes
- 📱 Mobile-first responsive design
- ⚡ Static site - no backend required
- 🧪 Comprehensive test coverage with TDD
```

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: highlight URL state persistence feature"
```

---

## Task 9: Final Integration Test

**Files:**
- Test existing functionality

**Step 1: Test complete user flow**

Run: `npm run dev`

Complete flow:
1. Open browser to `http://localhost:5173/`
2. Verify defaults are shown
3. Change initial investment to 10000
4. Change deposit to 500
5. Change frequency to quarterly
6. Copy URL from address bar
7. Open URL in new incognito tab
8. Verify all values match
9. Refresh the incognito tab
10. Verify values still match
11. Close incognito tab
12. Go back to original tab and change years to 30
13. Refresh
14. Verify years is still 30

Expected: All steps pass - URL state is fully preserved

**Step 2: Test edge cases**

1. Open `/?initial=invalid&deposit=-100&freq=badvalue`
2. Verify app shows defaults (invalid values ignored)
3. Open `/?initial=5000&extra=ignored&another=param`
4. Verify app shows 5000 initial (extra params ignored)

Expected: App handles invalid/extra params gracefully

**Step 3: Test backward compatibility**

1. Check that existing links with old params still work
2. Verify no breaking changes to URL format

Expected: No breaking changes

**Step 4: All tests pass**

Run: `npm test`
Expected: All tests PASS

**Step 5: Final commit**

```bash
git add -A
git commit -m "test: verify URL state persistence works end-to-end"
```

---

## Summary

This plan fixes the URL state persistence bug by:

1. **Using SvelteKit's load function** to read URL params before store initialization
2. **Creating store with URL params** instead of defaults
3. **Adding initialization flag** to prevent reactive URL sync from overwriting params on first load
4. **Comprehensive tests** at unit, integration, and E2E levels

**Key changes:**
- `src/routes/+page.ts` - New load function to extract URL params
- `src/lib/stores/simulationParams.ts` - Support custom initial values
- `src/routes/+page.svelte` - Initialize store from load data, delay URL sync

**Testing approach:**
- TDD at every step (write test, verify fail, implement, verify pass)
- Unit tests for utilities and store
- Integration tests for page load
- E2E tests for full user flow
- Manual verification of all scenarios

**References:**
- @superpowers:test-driven-development for TDD approach
- @superpowers:verification-before-completion before claiming success
