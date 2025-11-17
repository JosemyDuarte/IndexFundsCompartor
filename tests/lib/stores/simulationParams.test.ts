import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { createSimulationParamsStore } from '$lib/stores/simulationParams';

describe('simulationParams store', () => {
	it('should initialize with provided values', () => {
		const customValues = {
			initialInvestment: 5000,
			depositAmount: 250,
			depositFrequency: 'quarterly' as const,
			timePeriodYears: 15,
			expectedReturn: 8,
			myInvestorTER: 0.2
		};

		const store = createSimulationParamsStore(customValues);
		const value = get(store);

		expect(value).toEqual(customValues);
	});

	it('should merge partial values with defaults', () => {
		const partialValues = {
			initialInvestment: 3000,
			timePeriodYears: 10
		};

		const store = createSimulationParamsStore(partialValues);
		const value = get(store);

		expect(value).toEqual({
			initialInvestment: 3000,
			depositAmount: 100,
			depositFrequency: 'monthly',
			timePeriodYears: 10,
			expectedReturn: 7,
			myInvestorTER: 0.098
		});
	});

	it('should use defaults when no values provided', () => {
		const store = createSimulationParamsStore();
		const value = get(store);

		expect(value).toEqual({
			initialInvestment: 1000,
			depositAmount: 100,
			depositFrequency: 'monthly',
			timePeriodYears: 20,
			expectedReturn: 7,
			myInvestorTER: 0.098
		});
	});
});
