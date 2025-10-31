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
});
