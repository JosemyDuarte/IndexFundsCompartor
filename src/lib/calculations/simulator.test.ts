import { describe, it, expect } from 'vitest';
import { calculateProviderComparison } from './simulator';

describe('calculateProviderComparison', () => {
	it('should simulate both providers and return results', () => {
		const params = {
			initialInvestment: 10000,
			depositAmount: 100,
			depositFrequency: 'monthly' as const,
			timePeriodYears: 1,
			expectedReturn: 7,
			myInvestorTER: 0.05
		};

		const result = calculateProviderComparison(params);

		expect(result).toHaveProperty('indexaCapital');
		expect(result).toHaveProperty('myInvestor');
		expect(result.indexaCapital.monthlySnapshots).toHaveLength(12);
		expect(result.myInvestor.monthlySnapshots).toHaveLength(12);
		expect(result.indexaCapital.finalBalance).toBeGreaterThan(10000);
		expect(result.myInvestor.finalBalance).toBeGreaterThan(10000);
	});
});
