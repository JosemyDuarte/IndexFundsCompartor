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

describe('urlToParams', () => {
	it('should decode URL search string to simulation params', () => {
		const url = 'initial=5000&deposit=200&freq=quarterly&years=15&return=8.5&ter=0.25';

		const params = urlToParams(url);

		expect(params.initialInvestment).toBe(5000);
		expect(params.depositAmount).toBe(200);
		expect(params.depositFrequency).toBe('quarterly');
		expect(params.timePeriodYears).toBe(15);
		expect(params.expectedReturn).toBe(8.5);
		expect(params.myInvestorTER).toBe(0.25);
	});

	it('should return empty object for invalid URL params', () => {
		const url = 'invalid=data';

		const params = urlToParams(url);

		expect(Object.keys(params)).toHaveLength(0);
	});

	it('should handle missing params gracefully', () => {
		const url = 'initial=1000&years=10';

		const params = urlToParams(url);

		expect(params.initialInvestment).toBe(1000);
		expect(params.timePeriodYears).toBe(10);
		expect(params.depositAmount).toBeUndefined();
	});
});
