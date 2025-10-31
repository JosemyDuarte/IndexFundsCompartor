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

	it('should show IndexaCapital with lower fees for balances in lower tiers', () => {
		const params = {
			initialInvestment: 5000,
			depositAmount: 0,
			depositFrequency: 'monthly' as const,
			timePeriodYears: 1,
			expectedReturn: 7,
			myInvestorTER: 0.59 // Maximum TER
		};

		const result = calculateProviderComparison(params);

		// IndexaCapital: 0.599% total (tier 1)
		// MyInvestor: 0.89% total (0.30 + 0.59)
		// MyInvestor should have higher fees
		expect(result.myInvestor.totalFeesPaid).toBeGreaterThan(result.indexaCapital.totalFeesPaid);
	});

	it('should show MyInvestor with lower fees for large balances', () => {
		const params = {
			initialInvestment: 2000000, // €2M
			depositAmount: 0,
			depositFrequency: 'monthly' as const,
			timePeriodYears: 1,
			expectedReturn: 7,
			myInvestorTER: 0.05
		};

		const result = calculateProviderComparison(params);

		// IndexaCapital: 0.444% (€1M-€5M tier)
		// MyInvestor: 0.35% (0.30 + 0.05)
		// IndexaCapital should have higher fees
		expect(result.indexaCapital.totalFeesPaid).toBeGreaterThan(result.myInvestor.totalFeesPaid);
	});
});
