import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import SimulatorForm from './SimulatorForm.svelte';

describe('SimulatorForm', () => {
	it('renders all form inputs', () => {
		render(SimulatorForm);

		expect(screen.getByLabelText('Initial Investment')).toBeTruthy();
		expect(screen.getByLabelText('Regular Deposit')).toBeTruthy();
		expect(screen.getByLabelText('Deposit Frequency')).toBeTruthy();
		expect(screen.getByLabelText('Investment Period (years)')).toBeTruthy();
		expect(screen.getByLabelText('Expected Return (% per year)')).toBeTruthy();
		expect(screen.getByLabelText('MyInvestor TER (%)')).toBeTruthy();
	});

	it('currency inputs display formatted values', () => {
		render(SimulatorForm);

		const initialInput = screen.getByLabelText('Initial Investment') as HTMLInputElement;
		const depositInput = screen.getByLabelText('Regular Deposit') as HTMLInputElement;

		expect(initialInput.value).toBe('1.000'); // default 1000
		expect(depositInput.value).toBe('100'); // default 100
	});
});
