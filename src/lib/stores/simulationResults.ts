import { derived } from 'svelte/store';
import { simulationParams } from './simulationParams';
import { calculateProviderComparison } from '$lib/calculations/simulator';

export const simulationResults = derived(simulationParams, ($params) => {
	return calculateProviderComparison($params);
});
