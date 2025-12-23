import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ComparisonChart from './ComparisonChart.svelte';
import type { MonthlySnapshot } from '$lib/calculations/compounding';

describe('ComparisonChart', () => {
	const mockSnapshots: MonthlySnapshot[] = [
		{
			month: 1,
			balance: 1000,
			totalDeposited: 1000,
			totalFeesPaid: 0,
			totalReturns: 0,
			feeRate: 0.35
		},
		{
			month: 2,
			balance: 1050,
			totalDeposited: 1000,
			totalFeesPaid: 5,
			totalReturns: 55,
			feeRate: 0.35
		},
		{
			month: 3,
			balance: 1100,
			totalDeposited: 1000,
			totalFeesPaid: 10,
			totalReturns: 110,
			feeRate: 0.35
		}
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

	it('should update chart data when props change', async () => {
		const { container, rerender } = render(ComparisonChart, {
			props: {
				indexaSnapshots: mockSnapshots,
				myInvestorSnapshots: mockSnapshots
			}
		});

		// Wait for chart to initialize
		await new Promise((resolve) => setTimeout(resolve, 100));

		const canvas = container.querySelector('canvas');
		expect(canvas).toBeTruthy();

		// Update props using Svelte 5 rerender
		const newSnapshots: MonthlySnapshot[] = [
			{
				month: 1,
				balance: 5000,
				totalDeposited: 1000,
				totalFeesPaid: 10,
				totalReturns: 100,
				feeRate: 0.5,
				bracketChanged: false
			},
			{
				month: 2,
				balance: 10000,
				totalDeposited: 2000,
				totalFeesPaid: 20,
				totalReturns: 200,
				feeRate: 0.5,
				bracketChanged: false
			},
			{
				month: 3,
				balance: 15000,
				totalDeposited: 3000,
				totalFeesPaid: 30,
				totalReturns: 300,
				feeRate: 0.5,
				bracketChanged: false
			}
		];

		await rerender({
			indexaSnapshots: newSnapshots,
			myInvestorSnapshots: newSnapshots
		});

		// Chart should still be present and not recreated
		const canvasAfter = container.querySelector('canvas');
		expect(canvasAfter).toBe(canvas);
	});
});
