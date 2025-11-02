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

	it('tracks current fee rate in monthly snapshots', () => {
		const params = {
			initialInvestment: 1000,
			depositAmount: 100,
			depositFrequency: 'monthly' as const,
			timePeriodYears: 1,
			expectedReturn: 7,
			myInvestorTER: 0.05
		};

		const results = calculateProviderComparison(params);

		// Every snapshot should have a feeRate
		expect(results.indexaCapital.monthlySnapshots[0].feeRate).toBeDefined();
		expect(results.myInvestor.monthlySnapshots[0].feeRate).toBeDefined();

		// MyInvestor should have constant fee rate
		const myInvestorFees = results.myInvestor.monthlySnapshots.map(s => s.feeRate);
		expect(new Set(myInvestorFees).size).toBe(1);
		expect(myInvestorFees[0]).toBe(0.35); // 0.3 management + 0.05 TER
	});

	it('detects IndexaCapital fee bracket changes', () => {
		const params = {
			initialInvestment: 9000,
			depositAmount: 500,
			depositFrequency: 'monthly' as const,
			timePeriodYears: 2,
			expectedReturn: 10,
			myInvestorTER: 0.05
		};

		const results = calculateProviderComparison(params);
		const indexaSnapshots = results.indexaCapital.monthlySnapshots;

		// Find snapshots where bracket changed
		const bracketChanges = indexaSnapshots.filter(s => s.bracketChanged);

		// Should have at least one bracket change (9000 -> 10000 threshold)
		expect(bracketChanges.length).toBeGreaterThan(0);

		// Bracket changes should only happen when balance crosses threshold
		bracketChanges.forEach(snapshot => {
			const prevSnapshot = indexaSnapshots[snapshot.month - 2];
			if (prevSnapshot) {
				expect(snapshot.feeRate).not.toBe(prevSnapshot.feeRate);
			}
		});
	});

	it('calculates average fee for IndexaCapital', () => {
		const params = {
			initialInvestment: 5000,
			depositAmount: 200,
			depositFrequency: 'monthly' as const,
			timePeriodYears: 3,
			expectedReturn: 8,
			myInvestorTER: 0.05
		};

		const results = calculateProviderComparison(params);

		// IndexaCapital should have averageFeeRate
		expect(results.indexaCapital.averageFeeRate).toBeDefined();
		expect(results.indexaCapital.averageFeeRate).toBeGreaterThan(0);

		// MyInvestor should also have averageFeeRate (same as feeRate since it's constant)
		expect(results.myInvestor.averageFeeRate).toBe(0.35);
	});

	it('calculates weighted average fee correctly when crossing brackets', () => {
		const params = {
			initialInvestment: 9000,
			depositAmount: 500,
			depositFrequency: 'monthly' as const,
			timePeriodYears: 1,
			expectedReturn: 10,
			myInvestorTER: 0.05
		};

		const results = calculateProviderComparison(params);

		// Should start at 0.599% (0.405% mgmt + 0.194% fixed) for balance < 10k
		// Should end at 0.579% (0.385% mgmt + 0.194% fixed) for balance >= 10k
		// Average should be between these values
		expect(results.indexaCapital.averageFeeRate).toBeGreaterThan(0.579);
		expect(results.indexaCapital.averageFeeRate).toBeLessThan(0.599);
		expect(results.indexaCapital.currentFeeRate).toBe(0.579);
	});

	it('calculates average fee correctly with single month', () => {
		const params = {
			initialInvestment: 10000,
			depositAmount: 0,
			depositFrequency: 'monthly' as const,
			timePeriodYears: 1/12,
			expectedReturn: 0,
			myInvestorTER: 0.05
		};

		const results = calculateProviderComparison(params);

		// With one month, average should equal current
		expect(results.indexaCapital.averageFeeRate).toBe(results.indexaCapital.currentFeeRate);
	});
});
