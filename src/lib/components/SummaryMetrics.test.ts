// src/lib/components/SummaryMetrics.test.ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import SummaryMetrics from './SummaryMetrics.svelte';

describe('SummaryMetrics', () => {
	it('renders winner metric', () => {
		const indexaCapital = {
			totalInvested: 10000,
			totalReturns: 2000,
			totalFeesPaid: 100,
			finalBalance: 11900,
			monthlySnapshots: []
		};

		const myInvestor = {
			totalInvested: 10000,
			totalReturns: 1800,
			totalFeesPaid: 150,
			finalBalance: 11650,
			monthlySnapshots: []
		};

		render(SummaryMetrics, {
			props: { indexaCapital, myInvestor }
		});

		expect(screen.getByText(/IndexaCapital/i)).toBeInTheDocument();
		expect(screen.getByText(/250/)).toBeInTheDocument(); // difference
	});
});
