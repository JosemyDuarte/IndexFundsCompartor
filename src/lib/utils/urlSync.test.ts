import { describe, it, expect } from 'vitest';
import { paramsToUrl, urlToParams } from './urlSync';
import type { SimulationParams } from '$lib/calculations/simulator';

describe('paramsToUrl', () => {
	it('should encode simulation params to URL search string', () => {
		const params: SimulationParams = {
			initialInvestment: 5000,
			depositAmount: 200,
			depositFrequency: 'quarterly',
			timePeriodYears: 15,
			expectedReturn: 8.5,
			myInvestorTER: 0.25
		};

		const url = paramsToUrl(params);

		expect(url).toContain('initial=5000');
		expect(url).toContain('deposit=200');
		expect(url).toContain('freq=quarterly');
		expect(url).toContain('years=15');
		expect(url).toContain('return=8.5');
		expect(url).toContain('ter=0.25');
	});
});
