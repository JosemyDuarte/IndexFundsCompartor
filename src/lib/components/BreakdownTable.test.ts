import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import BreakdownTable from './BreakdownTable.svelte';

describe('BreakdownTable', () => {
	const indexaCapital = {
		totalInvested: 25000,
		totalFeesPaid: 500,
		totalReturns: 5000,
		finalBalance: 29500,
		monthlySnapshots: [],
		averageFeeRate: 0.35,
		currentFeeRate: 0.35
	};

	const myInvestor = {
		totalInvested: 25000,
		totalFeesPaid: 400,
		totalReturns: 5000,
		finalBalance: 29600,
		monthlySnapshots: [],
		averageFeeRate: 0.35,
		currentFeeRate: 0.35
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
		const cards = container.querySelectorAll('.p-4.bg-neu-base');
		const myInvestorCard = cards[1];

		// Check that the winning card has the correct neumorphic raised shadow styling
		expect(myInvestorCard.classList.contains('shadow-neu-raised')).toBe(true);
	});

	it('displays all financial metrics', () => {
		render(BreakdownTable, { props: { indexaCapital, myInvestor } });

		// Check that all metrics are shown
		expect(screen.getAllByText('Total Invested').length).toBe(2);
		expect(screen.getAllByText('Total Returns').length).toBe(2);
		expect(screen.getAllByText('Total Fees').length).toBe(2);
		expect(screen.getAllByText('Final Balance').length).toBe(2);
	});

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
		expect(screen.getByText('Average Fee Rate')).toBeTruthy();
		expect(screen.getByText('0.405%')).toBeTruthy();

		// Check IndexaCapital shows current fee
		expect(screen.getByText('Current Fee Rate')).toBeTruthy();
		expect(screen.getByText('0.385%')).toBeTruthy();

		// Check MyInvestor shows fee rate (exact match to avoid matching IndexaCapital's labels)
		const feeRateLabels = screen.getAllByText(/^Fee Rate$/);
		expect(feeRateLabels.length).toBe(1); // Only MyInvestor should have this exact label
		expect(screen.getByText('0.35%')).toBeTruthy();
	});
});
