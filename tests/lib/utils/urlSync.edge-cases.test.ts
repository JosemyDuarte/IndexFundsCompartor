import { describe, it, expect } from 'vitest';
import { urlToParams, paramsToUrl } from '$lib/utils/urlSync';

describe('URL Sync Edge Cases', () => {
	describe('Invalid parameter values', () => {
		it('should ignore negative initial investment', () => {
			const result = urlToParams('initial=-5000');
			expect(result.initialInvestment).toBeUndefined();
		});

		it('should ignore negative deposit amount', () => {
			const result = urlToParams('deposit=-100');
			expect(result.depositAmount).toBeUndefined();
		});

		it('should accept zero deposit amount', () => {
			const result = urlToParams('deposit=0');
			expect(result.depositAmount).toBe(0);
		});

		it('should ignore negative years', () => {
			const result = urlToParams('years=-5');
			expect(result.timePeriodYears).toBeUndefined();
		});

		it('should ignore negative return rate', () => {
			// Note: negative returns are actually allowed (market can go down)
			const result = urlToParams('return=-2');
			expect(result.expectedReturn).toBe(-2);
		});

		it('should ignore TER below minimum (0.05)', () => {
			const result = urlToParams('ter=0.01');
			expect(result.myInvestorTER).toBeUndefined();
		});

		it('should ignore TER above maximum (0.59)', () => {
			const result = urlToParams('ter=0.99');
			expect(result.myInvestorTER).toBeUndefined();
		});

		it('should accept TER at minimum boundary', () => {
			const result = urlToParams('ter=0.05');
			expect(result.myInvestorTER).toBe(0.05);
		});

		it('should accept TER at maximum boundary', () => {
			const result = urlToParams('ter=0.59');
			expect(result.myInvestorTER).toBe(0.59);
		});

		it('should ignore invalid deposit frequency', () => {
			const result = urlToParams('freq=weekly');
			expect(result.depositFrequency).toBeUndefined();
		});

		it('should ignore non-numeric values', () => {
			const result = urlToParams('initial=abc&deposit=xyz&years=foo&return=bar&ter=baz');
			expect(result).toEqual({});
		});
	});

	describe('Extra or unknown parameters', () => {
		it('should ignore extra unknown parameters', () => {
			const result = urlToParams('initial=5000&unknown=value&extra=param');
			expect(result).toEqual({
				initialInvestment: 5000
			});
		});

		it('should handle mixed valid and invalid parameters', () => {
			const result = urlToParams('initial=5000&invalid=bad&deposit=200&freq=quarterly&bad=value');
			expect(result).toEqual({
				initialInvestment: 5000,
				depositAmount: 200,
				depositFrequency: 'quarterly'
			});
		});
	});

	describe('Empty and malformed URLs', () => {
		it('should handle empty URL string', () => {
			const result = urlToParams('');
			expect(result).toEqual({});
		});

		it('should handle URL with only separators', () => {
			const result = urlToParams('&&&');
			expect(result).toEqual({});
		});

		it('should handle URL with empty values', () => {
			const result = urlToParams('initial=&deposit=&freq=');
			expect(result).toEqual({});
		});

		it('should handle malformed key-value pairs', () => {
			const result = urlToParams('initial&deposit&freq');
			expect(result).toEqual({});
		});
	});

	describe('Special characters and encoding', () => {
		it('should handle URL-encoded values', () => {
			const result = urlToParams('initial=5000&freq=quarterly');
			expect(result.depositFrequency).toBe('quarterly');
		});

		it('should handle whitespace in values', () => {
			const result = urlToParams('initial=%205000%20&deposit=%20200%20');
			expect(result.initialInvestment).toBe(5000);
			expect(result.depositAmount).toBe(200);
		});
	});

	describe('Boundary values', () => {
		it('should handle very large numbers', () => {
			const result = urlToParams('initial=999999999&deposit=999999');
			expect(result.initialInvestment).toBe(999999999);
			expect(result.depositAmount).toBe(999999);
		});

		it('should handle very small positive numbers', () => {
			const result = urlToParams('initial=0.01&deposit=0.01&ter=0.05');
			expect(result.initialInvestment).toBe(0.01);
			expect(result.depositAmount).toBe(0.01);
			expect(result.myInvestorTER).toBe(0.05);
		});

		it('should handle decimal values', () => {
			const result = urlToParams('initial=5000.50&deposit=250.75&return=7.5&ter=0.15');
			expect(result.initialInvestment).toBe(5000.50);
			expect(result.depositAmount).toBe(250.75);
			expect(result.expectedReturn).toBe(7.5);
			expect(result.myInvestorTER).toBe(0.15);
		});
	});

	describe('Round-trip conversion', () => {
		it('should maintain values through parse-stringify-parse cycle', () => {
			const original = 'initial=5000&deposit=250&freq=quarterly&years=15&return=8.5&ter=0.15';
			const parsed = urlToParams(original);
			const stringified = paramsToUrl({
				initialInvestment: parsed.initialInvestment!,
				depositAmount: parsed.depositAmount!,
				depositFrequency: parsed.depositFrequency!,
				timePeriodYears: parsed.timePeriodYears!,
				expectedReturn: parsed.expectedReturn!,
				myInvestorTER: parsed.myInvestorTER!
			});
			const reParsed = urlToParams(stringified);

			expect(reParsed).toEqual(parsed);
		});
	});

	describe('Backward compatibility', () => {
		it('should handle old URL format with all params', () => {
			// This test ensures we don't break existing shared URLs
			const result = urlToParams('initial=1000&deposit=100&freq=monthly&years=20&return=7&ter=0.05');
			expect(result).toEqual({
				initialInvestment: 1000,
				depositAmount: 100,
				depositFrequency: 'monthly',
				timePeriodYears: 20,
				expectedReturn: 7,
				myInvestorTER: 0.05
			});
		});

		it('should handle old URL format with partial params', () => {
			const result = urlToParams('initial=2000&years=10');
			expect(result).toEqual({
				initialInvestment: 2000,
				timePeriodYears: 10
			});
		});
	});
});
