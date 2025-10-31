import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage } from './formatters';

describe('formatCurrency', () => {
	it('should format numbers as Euro currency', () => {
		// Use non-breaking space (U+00A0) as produced by Intl.NumberFormat
		expect(formatCurrency(1234.56)).toMatch(/1234,56\s+€/);
		expect(formatCurrency(1000000)).toMatch(/1\.000\.000,00\s+€/);
		expect(formatCurrency(0.99)).toMatch(/0,99\s+€/);
	});

	it('should handle negative numbers', () => {
		expect(formatCurrency(-123.45)).toMatch(/-123,45\s+€/);
	});
});

describe('formatPercentage', () => {
	it('should format numbers as percentages with one decimal', () => {
		expect(formatPercentage(7.5)).toBe('7,5%');
		expect(formatPercentage(0.599)).toBe('0,6%');
		expect(formatPercentage(10)).toBe('10,0%');
	});
});
