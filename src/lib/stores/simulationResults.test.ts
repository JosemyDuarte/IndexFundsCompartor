import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { simulationParams } from './simulationParams';
import { simulationResults } from './simulationResults';

describe('simulationResults store', () => {
	it('should derive results from simulation parameters', () => {
		simulationParams.set({
			initialInvestment: 10000,
			depositAmount: 100,
			depositFrequency: 'monthly',
			timePeriodYears: 1,
			expectedReturn: 7,
			myInvestorTER: 0.05
		});

		const results = get(simulationResults);

		expect(results.indexaCapital.finalBalance).toBeGreaterThan(10000);
		expect(results.myInvestor.finalBalance).toBeGreaterThan(10000);
		expect(results.indexaCapital.monthlySnapshots).toHaveLength(12);
		expect(results.myInvestor.monthlySnapshots).toHaveLength(12);
	});

	it('should automatically recalculate when params change', () => {
		simulationParams.set({
			initialInvestment: 1000,
			depositAmount: 0,
			depositFrequency: 'monthly',
			timePeriodYears: 1,
			expectedReturn: 0,
			myInvestorTER: 0.05
		});

		const results1 = get(simulationResults);
		const balance1 = results1.indexaCapital.finalBalance;

		// Change expected return
		simulationParams.update(p => ({ ...p, expectedReturn: 10 }));

		const results2 = get(simulationResults);
		const balance2 = results2.indexaCapital.finalBalance;

		// With 10% return, final balance should be higher
		expect(balance2).toBeGreaterThan(balance1);
	});
});
