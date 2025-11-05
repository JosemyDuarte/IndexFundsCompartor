import { describe, it, expect } from 'vitest';
import { urlToParams, paramsToUrl } from '$lib/utils/urlSync';

describe('urlSync', () => {
	describe('urlToParams', () => {
		it('should parse all valid URL parameters', () => {
			const urlString = 'initial=5000&deposit=250&freq=quarterly&years=15&return=8.5&ter=0.15';
			const result = urlToParams(urlString);

			expect(result).toEqual({
				initialInvestment: 5000,
				depositAmount: 250,
				depositFrequency: 'quarterly',
				timePeriodYears: 15,
				expectedReturn: 8.5,
				myInvestorTER: 0.15
			});
		});

		it('should handle partial URL parameters', () => {
			const urlString = 'initial=3000&years=10';
			const result = urlToParams(urlString);

			expect(result).toEqual({
				initialInvestment: 3000,
				timePeriodYears: 10
			});
		});

		it('should ignore invalid parameters', () => {
			const urlString = 'initial=-100&deposit=abc&freq=invalid&ter=999';
			const result = urlToParams(urlString);

			expect(result).toEqual({});
		});
	});

	describe('paramsToUrl', () => {
		it('should convert params to URL string', () => {
			const params = {
				initialInvestment: 5000,
				depositAmount: 250,
				depositFrequency: 'quarterly' as const,
				timePeriodYears: 15,
				expectedReturn: 8.5,
				myInvestorTER: 0.15
			};
			const result = paramsToUrl(params);

			expect(result).toBe('initial=5000&deposit=250&freq=quarterly&years=15&return=8.5&ter=0.15');
		});
	});
});
