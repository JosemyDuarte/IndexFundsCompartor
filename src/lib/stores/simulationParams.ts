import { writable } from 'svelte/store';
import type { SimulationParams } from '$lib/calculations/simulator';

const defaults: SimulationParams = {
	initialInvestment: 1000,
	depositAmount: 100,
	depositFrequency: 'monthly',
	timePeriodYears: 20,
	expectedReturn: 7,
	myInvestorTER: 0.098
};

export function createSimulationParamsStore(initialValues?: Partial<SimulationParams>) {
	const merged = { ...defaults, ...initialValues };
	return writable<SimulationParams>(merged);
}

export const simulationParams = createSimulationParamsStore();
