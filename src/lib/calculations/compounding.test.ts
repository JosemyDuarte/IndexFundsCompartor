import { describe, it, expect } from 'vitest';
import { calculateMonthlyGrowth } from './compounding';

describe('calculateMonthlyGrowth', () => {
	it('should apply monthly compound interest correctly', () => {
		const result = calculateMonthlyGrowth({
			initialBalance: 1000,
			monthlyDeposit: 0,
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
			monthlyDeposit: 0,
			annualReturn: 12,
			annualFeeRate: 0,
			totalMonths: 3
		});

		expect(result).toHaveLength(3);
		expect(result[0].balance).toBeCloseTo(1010, 2);
		expect(result[1].balance).toBeCloseTo(1020.1, 2); // 1010 * 1.01
		expect(result[2].balance).toBeCloseTo(1030.301, 2); // 1020.1 * 1.01
	});
});
