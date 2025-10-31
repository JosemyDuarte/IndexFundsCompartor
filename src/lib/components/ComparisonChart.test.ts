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
