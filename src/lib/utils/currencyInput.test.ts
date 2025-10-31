import { describe, it, expect } from 'vitest';
import { formatCurrencyInput, parseCurrencyInput } from './currencyInput';

describe('formatCurrencyInput', () => {
	it('formats number with thousand separators', () => {
		expect(formatCurrencyInput(1000)).toBe('1.000');
		expect(formatCurrencyInput(100000)).toBe('100.000');
		expect(formatCurrencyInput(1000000)).toBe('1.000.000');
	});

	it('handles numbers without thousands', () => {
		expect(formatCurrencyInput(100)).toBe('100');
		expect(formatCurrencyInput(50)).toBe('50');
	});

	it('handles zero and negative numbers', () => {
		expect(formatCurrencyInput(0)).toBe('0');
		expect(formatCurrencyInput(-1000)).toBe('-1.000');
	});

	it('handles decimal numbers by rounding', () => {
		expect(formatCurrencyInput(1000.56)).toBe('1.001');
		expect(formatCurrencyInput(1000.44)).toBe('1.000');
	});

	it('handles special numeric values', () => {
		expect(formatCurrencyInput(Infinity)).toBe('0');
		expect(formatCurrencyInput(-Infinity)).toBe('0');
		expect(formatCurrencyInput(NaN)).toBe('0');
	});
});

describe('parseCurrencyInput', () => {
	it('parses formatted string to number', () => {
		expect(parseCurrencyInput('1.000')).toBe(1000);
		expect(parseCurrencyInput('100.000')).toBe(100000);
		expect(parseCurrencyInput('1.000.000')).toBe(1000000);
	});

	it('handles unformatted numbers', () => {
		expect(parseCurrencyInput('100')).toBe(100);
		expect(parseCurrencyInput('50')).toBe(50);
	});

	it('handles empty or invalid input', () => {
		expect(parseCurrencyInput('')).toBe(0);
		expect(parseCurrencyInput('abc')).toBe(0);
		expect(parseCurrencyInput('1.000abc')).toBe(1000);
	});

	it('handles negative numbers', () => {
		expect(parseCurrencyInput('-1.000')).toBe(-1000);
	});

	it('normalizes negative zero', () => {
		expect(parseCurrencyInput('-0')).toBe(0);
		expect(Object.is(parseCurrencyInput('-0'), -0)).toBe(false);
	});
});
