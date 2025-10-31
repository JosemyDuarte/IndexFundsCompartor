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
});
