import { describe, it, expect } from 'vitest';
import { load } from '../../src/routes/+page';

describe('+page load function', () => {
	it('should extract URL params from page URL', () => {
		const mockEvent = {
			url: new URL('http://localhost/?initial=3000&deposit=150&freq=quarterly&years=10&return=8&ter=0.2')
		};

		const result = load(mockEvent as any);

		expect(result).toEqual({
			urlParams: {
				initialInvestment: 3000,
				depositAmount: 150,
				depositFrequency: 'quarterly',
				timePeriodYears: 10,
				expectedReturn: 8,
				myInvestorTER: 0.2
			}
		});
	});

	it('should return empty object when no URL params present', () => {
		const mockEvent = {
			url: new URL('http://localhost/')
		};

		const result = load(mockEvent as any);

		expect(result).toEqual({
			urlParams: {}
		});
	});
});
