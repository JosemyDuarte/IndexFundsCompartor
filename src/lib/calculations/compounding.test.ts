import { describe, it, expect } from 'vitest';
import { calculateMonthlyGrowth } from './compounding';

describe('calculateMonthlyGrowth', () => {
	it('should apply monthly compound interest correctly', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			depositAmount: 0,
			depositFrequency: 'monthly',
			annualReturn: 12, // 1% per month for easy math
			annualFeeRate: 0,
			totalMonths: 1
		});

		expect(result).toHaveLength(1);
		expect(result[0].balance).toBeCloseTo(1010, 2); // 1000 * 1.01
		expect(result[0].totalReturns).toBeCloseTo(10, 2);
	});

	it('should compound over multiple months', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			depositAmount: 0,
			depositFrequency: 'monthly',
			annualReturn: 12,
			annualFeeRate: 0,
			totalMonths: 3
		});

		expect(result).toHaveLength(3);
		expect(result[0].balance).toBeCloseTo(1010, 2);
		expect(result[1].balance).toBeCloseTo(1020.1, 2); // 1010 * 1.01
		expect(result[2].balance).toBeCloseTo(1030.301, 2); // 1020.1 * 1.01
	});

	it('should add monthly deposits before calculating growth', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			depositAmount: 100,
			depositFrequency: 'monthly',
			annualReturn: 12,
			annualFeeRate: 0,
			totalMonths: 2
		});

		// Month 1: 1000 + 100 = 1100, then * 1.01 = 1111
		expect(result[0].balance).toBeCloseTo(1111, 2);
		expect(result[0].totalDeposited).toBe(1100);

		// Month 2: 1111 + 100 = 1211, then * 1.01 = 1223.11
		expect(result[1].balance).toBeCloseTo(1223.11, 2);
		expect(result[1].totalDeposited).toBe(1200);
	});

	it('should deduct fees monthly', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			depositAmount: 0,
			depositFrequency: 'monthly',
			annualReturn: 12,
			annualFeeRate: 1.2, // 0.1% per month for easy math
			totalMonths: 1
		});

		// Growth: 1000 * 1.01 = 1010
		// Fee: 1010 * 0.001 = 1.01
		// Final: 1010 - 1.01 = 1008.99
		expect(result[0].balance).toBeCloseTo(1008.99, 2);
		expect(result[0].totalFeesPaid).toBeCloseTo(1.01, 2);
	});

	it('should add deposits quarterly when frequency is quarterly', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			depositAmount: 300,
			depositFrequency: 'quarterly',
			annualReturn: 0,
			annualFeeRate: 0,
			totalMonths: 6
		});

		// Deposits at month 3 and 6
		expect(result[0].totalDeposited).toBe(1000); // No deposit month 1
		expect(result[1].totalDeposited).toBe(1000); // No deposit month 2
		expect(result[2].totalDeposited).toBe(1300); // Deposit month 3
		expect(result[3].totalDeposited).toBe(1300); // No deposit month 4
		expect(result[4].totalDeposited).toBe(1300); // No deposit month 5
		expect(result[5].totalDeposited).toBe(1600); // Deposit month 6
	});

	it('should add deposits annually when frequency is annual', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			depositAmount: 1000,
			depositFrequency: 'annual',
			annualReturn: 0,
			annualFeeRate: 0,
			totalMonths: 24
		});

		// Deposits at month 12 and 24
		expect(result[11].totalDeposited).toBe(2000); // Month 12
		expect(result[12].totalDeposited).toBe(2000); // Month 13 (no deposit)
		expect(result[23].totalDeposited).toBe(3000); // Month 24
	});
});
