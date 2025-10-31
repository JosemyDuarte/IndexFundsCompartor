import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { simulationParams } from './simulationParams';

describe('simulationParams store', () => {
	it('should initialize with default values', () => {
		const params = get(simulationParams);

		expect(params.initialInvestment).toBe(1000);
		expect(params.depositAmount).toBe(100);
		expect(params.depositFrequency).toBe('monthly');
		expect(params.timePeriodYears).toBe(20);
		expect(params.expectedReturn).toBe(7);
		expect(params.myInvestorTER).toBe(0.05);
	});

	it('should allow updating parameters', () => {
		simulationParams.set({
			initialInvestment: 5000,
			depositAmount: 200,
			depositFrequency: 'quarterly',
			timePeriodYears: 10,
			expectedReturn: 8,
			myInvestorTER: 0.25
		});

		const params = get(simulationParams);
		expect(params.initialInvestment).toBe(5000);
		expect(params.depositAmount).toBe(200);
		expect(params.depositFrequency).toBe('quarterly');
	});
});
