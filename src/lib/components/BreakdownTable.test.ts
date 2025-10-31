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

	it('should highlight the winner with higher final balance', () => {
		render(BreakdownTable, { indexaCapital: mockIndexa, myInvestor: mockMyInvestor });

		// IndexaCapital has higher balance (10400 > 10350)
		const rows = screen.getAllByRole('row');
		const finalBalanceRow = rows[rows.length - 1];

		expect(finalBalanceRow.innerHTML).toContain('text-green-600');
	});
});
