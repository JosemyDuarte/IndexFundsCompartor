import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import BreakdownTable from './BreakdownTable.svelte';

describe('BreakdownTable', () => {
	const indexaCapital = {
		totalInvested: 25000,
		totalFeesPaid: 500,
		totalReturns: 5000,
		finalBalance: 29500,
		monthlySnapshots: []
	};

	const myInvestor = {
		totalInvested: 25000,
		totalFeesPaid: 400,
		totalReturns: 5000,
		finalBalance: 29600,
		monthlySnapshots: []
	};

	it('renders both providers', () => {
		render(BreakdownTable, { props: { indexaCapital, myInvestor } });

		expect(screen.getByText('IndexaCapital')).toBeTruthy();
		expect(screen.getByText('MyInvestor')).toBeTruthy();
	});

	it('highlights the winner', () => {
		render(BreakdownTable, { props: { indexaCapital, myInvestor } });

		const winnerBadge = screen.getByText(/MyInvestor wins by/);
		expect(winnerBadge).toBeTruthy();
	});

	it('displays all financial metrics', () => {
		render(BreakdownTable, { props: { indexaCapital, myInvestor } });

		// Check that all metrics are shown
		expect(screen.getAllByText('Total Invested').length).toBe(2);
		expect(screen.getAllByText('Total Returns').length).toBe(2);
		expect(screen.getAllByText('Total Fees').length).toBe(2);
		expect(screen.getAllByText('Final Balance').length).toBe(2);
	});
});
