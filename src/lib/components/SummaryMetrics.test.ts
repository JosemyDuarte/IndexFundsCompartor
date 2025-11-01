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

	it('renders best final balance card', () => {
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

		expect(screen.getByText('Best Final Balance')).toBeInTheDocument();
		expect(screen.getByText('11.900,00 €')).toBeInTheDocument();
		expect(screen.getByText('Total portfolio value')).toBeInTheDocument();
	});

	it('renders total returns card with percentage', () => {
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

		expect(screen.getByText("Winner's Returns")).toBeInTheDocument();
		expect(screen.getByText('2000,00 €')).toBeInTheDocument();
		expect(screen.getByText('+20.00% gain')).toBeInTheDocument();
	});

	it('shows MyInvestor as winner when it has higher balance', () => {
		const indexaCapital = {
			totalInvested: 10000,
			totalReturns: 1800,
			totalFeesPaid: 150,
			finalBalance: 11650,
			monthlySnapshots: []
		};

		const myInvestor = {
			totalInvested: 10000,
			totalReturns: 2000,
			totalFeesPaid: 100,
			finalBalance: 11900,
			monthlySnapshots: []
		};

		render(SummaryMetrics, {
			props: { indexaCapital, myInvestor }
		});

		expect(screen.getByText(/MyInvestor/i)).toBeInTheDocument();
		expect(screen.getByText(/250/)).toBeInTheDocument();
		expect(screen.getByText('2000,00 €')).toBeInTheDocument(); // MyInvestor's returns
		expect(screen.getByText('+20.00% gain')).toBeInTheDocument();
	});

	it('handles equal balances edge case', () => {
		const indexaCapital = {
			totalInvested: 10000,
			totalReturns: 2000,
			totalFeesPaid: 100,
			finalBalance: 12000,
			monthlySnapshots: []
		};

		const myInvestor = {
			totalInvested: 10000,
			totalReturns: 2000,
			totalFeesPaid: 100,
			finalBalance: 12000,
			monthlySnapshots: []
		};

		render(SummaryMetrics, {
			props: { indexaCapital, myInvestor }
		});

		// When equal, MyInvestor is shown as winner
		expect(screen.getByText(/MyInvestor/i)).toBeInTheDocument();
		expect(screen.getByText(/Ahead by 0,00 €/)).toBeInTheDocument(); // difference is 0
		expect(screen.getByText('12.000,00 €')).toBeInTheDocument(); // best final balance
		expect(screen.getByText('+20.00% gain')).toBeInTheDocument();
	});

	it('handles zero investment edge case', () => {
		const indexaCapital = {
			totalInvested: 0,
			totalReturns: 0,
			totalFeesPaid: 0,
			finalBalance: 0,
			monthlySnapshots: []
		};

		const myInvestor = {
			totalInvested: 0,
			totalReturns: 0,
			totalFeesPaid: 0,
			finalBalance: 0,
			monthlySnapshots: []
		};

		render(SummaryMetrics, {
			props: { indexaCapital, myInvestor }
		});

		// Should render without errors
		expect(screen.getByText(/MyInvestor/i)).toBeInTheDocument();
		expect(screen.getByText(/Ahead by 0,00 €/)).toBeInTheDocument();
		expect(screen.getByText('+0.00% gain')).toBeInTheDocument(); // No division by zero
	});

	it('calculates percentage accurately for different investment amounts', () => {
		const indexaCapital = {
			totalInvested: 5000,
			totalReturns: 1500,
			totalFeesPaid: 50,
			finalBalance: 6450,
			monthlySnapshots: []
		};

		const myInvestor = {
			totalInvested: 5000,
			totalReturns: 1200,
			totalFeesPaid: 80,
			finalBalance: 6120,
			monthlySnapshots: []
		};

		render(SummaryMetrics, {
			props: { indexaCapital, myInvestor }
		});

		// IndexaCapital wins with 1500/5000 = 30%
		expect(screen.getByText(/IndexaCapital/i)).toBeInTheDocument();
		expect(screen.getByText('1500,00 €')).toBeInTheDocument();
		expect(screen.getByText('+30.00% gain')).toBeInTheDocument();
	});
});
