import { describe, it, expect } from 'vitest';
import { getIndexaCapitalFee } from './fees';

describe('getIndexaCapitalFee', () => {
	it('should return 0.599% for balance under €10,000', () => {
		expect(getIndexaCapitalFee(5000)).toBe(0.599);
		expect(getIndexaCapitalFee(9999)).toBe(0.599);
	});

	it('should return 0.579% for balance €10,000 to €100,000', () => {
		expect(getIndexaCapitalFee(10000)).toBe(0.579);
		expect(getIndexaCapitalFee(50000)).toBe(0.579);
		expect(getIndexaCapitalFee(99999)).toBe(0.579);
	});

	it('should return 0.549% for balance €100,000 to €500,000', () => {
		expect(getIndexaCapitalFee(100000)).toBe(0.549);
		expect(getIndexaCapitalFee(250000)).toBe(0.549);
		expect(getIndexaCapitalFee(499999)).toBe(0.549);
	});

	it('should return 0.494% for balance €500,000 to €1M', () => {
		expect(getIndexaCapitalFee(500000)).toBe(0.494);
		expect(getIndexaCapitalFee(750000)).toBe(0.494);
		expect(getIndexaCapitalFee(999999)).toBe(0.494);
	});

	it('should return 0.444% for balance €1M to €5M', () => {
		expect(getIndexaCapitalFee(1000000)).toBe(0.444);
		expect(getIndexaCapitalFee(3000000)).toBe(0.444);
		expect(getIndexaCapitalFee(4999999)).toBe(0.444);
	});

	it('should return 0.394% for balance €5M to €10M', () => {
		expect(getIndexaCapitalFee(5000000)).toBe(0.394);
		expect(getIndexaCapitalFee(7500000)).toBe(0.394);
		expect(getIndexaCapitalFee(9999999)).toBe(0.394);
	});

	it('should return 0.344% for balance €10M to €50M', () => {
		expect(getIndexaCapitalFee(10000000)).toBe(0.344);
		expect(getIndexaCapitalFee(25000000)).toBe(0.344);
		expect(getIndexaCapitalFee(49999999)).toBe(0.344);
	});

	it('should return 0.294% for balance €50M to €100M', () => {
		expect(getIndexaCapitalFee(50000000)).toBe(0.294);
		expect(getIndexaCapitalFee(75000000)).toBe(0.294);
		expect(getIndexaCapitalFee(99999999)).toBe(0.294);
	});

	it('should return 0.274% for balance over €100M', () => {
		expect(getIndexaCapitalFee(100000000)).toBe(0.274);
		expect(getIndexaCapitalFee(500000000)).toBe(0.274);
	});
});
