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
		const { container } = render(BreakdownTable, { props: { indexaCapital, myInvestor } });

		// MyInvestor should win (29600 > 29500)
		const winnerBadge = screen.getByText('Winner');
		expect(winnerBadge).toBeTruthy();

		// Find the MyInvestor card (second card in the grid)
		const cards = container.querySelectorAll('.p-6.bg-white\\/5');
		const myInvestorCard = cards[1];

		// Check that the winning card has the correct ring styling
		expect(myInvestorCard.classList.contains('ring-2')).toBe(true);
		expect(myInvestorCard.classList.contains('ring-revolut-blue')).toBe(true);
		expect(myInvestorCard.classList.contains('shadow-revolut-glow-blue')).toBe(true);
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
