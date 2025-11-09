import { describe, it, expect } from 'vitest';
import { getIndexaCapitalFee, getMyInvestorFee } from './fees';

describe('getIndexaCapitalFee', () => {
	// Updated for tiered custody fees (0.048%-0.109%) + 0.098% underlying fee
	it('should return 0.612% for balance under €10,000', () => {
		expect(getIndexaCapitalFee(5000)).toBe(0.612);
		expect(getIndexaCapitalFee(9999)).toBe(0.612);
	});

	it('should return 0.586% for balance €10,000 to €100,000', () => {
		expect(getIndexaCapitalFee(10000)).toBe(0.586);
		expect(getIndexaCapitalFee(50000)).toBe(0.586);
		expect(getIndexaCapitalFee(99999)).toBe(0.586);
	});

	it('should return 0.550% for balance €100,000 to €500,000', () => {
		expect(getIndexaCapitalFee(100000)).toBe(0.55);
		expect(getIndexaCapitalFee(250000)).toBe(0.55);
		expect(getIndexaCapitalFee(499999)).toBe(0.55);
	});

	it('should return 0.489% for balance €500,000 to €1M', () => {
		expect(getIndexaCapitalFee(500000)).toBe(0.489);
		expect(getIndexaCapitalFee(750000)).toBe(0.489);
		expect(getIndexaCapitalFee(999999)).toBe(0.489);
	});

	it('should return 0.396% for balance €1M to €5M', () => {
		expect(getIndexaCapitalFee(1000000)).toBe(0.396);
		expect(getIndexaCapitalFee(3000000)).toBe(0.396);
		expect(getIndexaCapitalFee(4999999)).toBe(0.396);
	});

	it('should return 0.346% for balance €5M to €10M', () => {
		expect(getIndexaCapitalFee(5000000)).toBe(0.346);
		expect(getIndexaCapitalFee(7500000)).toBe(0.346);
		expect(getIndexaCapitalFee(9999999)).toBe(0.346);
	});

	it('should return 0.296% for balance €10M to €50M', () => {
		expect(getIndexaCapitalFee(10000000)).toBe(0.296);
		expect(getIndexaCapitalFee(25000000)).toBe(0.296);
		expect(getIndexaCapitalFee(49999999)).toBe(0.296);
	});

	it('should return 0.246% for balance €50M to €100M', () => {
		expect(getIndexaCapitalFee(50000000)).toBe(0.246);
		expect(getIndexaCapitalFee(75000000)).toBe(0.246);
		expect(getIndexaCapitalFee(99999999)).toBe(0.246);
	});

	it('should return 0.226% for balance over €100M', () => {
		expect(getIndexaCapitalFee(100000000)).toBe(0.226);
		expect(getIndexaCapitalFee(500000000)).toBe(0.226);
	});
});

describe('Tiered custody fees', () => {
	it('applies custody fee of 0.109% for balance < 10k', () => {
		const fee = getIndexaCapitalFee(5000);
		const expectedCustody = 0.109;
		const expectedUnderlying = 0.098;
		const expectedManagement = 0.405;
		const expectedTotal = expectedManagement + expectedCustody + expectedUnderlying;
		expect(fee).toBeCloseTo(expectedTotal, 3);
	});

	it('applies custody fee of 0.103% for balance 10k-100k', () => {
		const fee = getIndexaCapitalFee(50000);
		const expectedCustody = 0.103;
		const expectedUnderlying = 0.098;
		const expectedManagement = 0.385;
		const expectedTotal = expectedManagement + expectedCustody + expectedUnderlying;
		expect(fee).toBeCloseTo(expectedTotal, 3);
	});

	it('applies custody fee of 0.097% for balance 100k-500k', () => {
		const fee = getIndexaCapitalFee(250000);
		const expectedCustody = 0.097;
		const expectedUnderlying = 0.098;
		const expectedManagement = 0.355;
		const expectedTotal = expectedManagement + expectedCustody + expectedUnderlying;
		expect(fee).toBeCloseTo(expectedTotal, 3);
	});

	it('applies custody fee of 0.091% for balance 500k-1M', () => {
		const fee = getIndexaCapitalFee(750000);
		const expectedCustody = 0.091;
		const expectedUnderlying = 0.098;
		const expectedManagement = 0.3;
		const expectedTotal = expectedManagement + expectedCustody + expectedUnderlying;
		expect(fee).toBeCloseTo(expectedTotal, 3);
	});

	it('applies custody fee of 0.048% for balance > 1M', () => {
		const fee = getIndexaCapitalFee(2000000);
		const expectedCustody = 0.048;
		const expectedUnderlying = 0.098;
		const expectedManagement = 0.25;
		const expectedTotal = expectedManagement + expectedCustody + expectedUnderlying;
		expect(fee).toBeCloseTo(expectedTotal, 3);
	});

	it('handles exact boundary at 10k', () => {
		const fee = getIndexaCapitalFee(10000);
		const expectedCustody = 0.103;
		const expectedUnderlying = 0.098;
		const expectedManagement = 0.385;
		const expectedTotal = expectedManagement + expectedCustody + expectedUnderlying;
		expect(fee).toBeCloseTo(expectedTotal, 3);
	});

	it('handles exact boundary at 100k', () => {
		const fee = getIndexaCapitalFee(100000);
		const expectedCustody = 0.097;
		const expectedUnderlying = 0.098;
		const expectedManagement = 0.355;
		const expectedTotal = expectedManagement + expectedCustody + expectedUnderlying;
		expect(fee).toBeCloseTo(expectedTotal, 3);
	});
});

describe('getMyInvestorFee', () => {
	it('should return 0.35% for default TER (0.05%)', () => {
		expect(getMyInvestorFee(0.05)).toBe(0.35);
	});

	it('should return 0.89% for maximum TER (0.59%)', () => {
		expect(getMyInvestorFee(0.59)).toBe(0.89);
	});

	it('should return correct fee for custom TER', () => {
		expect(getMyInvestorFee(0.25)).toBe(0.55);
	});
});
