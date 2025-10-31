import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { writable, get } from 'svelte/store';
import CurrencyInput from './CurrencyInput.svelte';

describe('CurrencyInput', () => {
	it('renders with formatted value', () => {
		const value = writable(1000);
		render(CurrencyInput, { props: { id: 'test', label: 'Amount', value } });

		const input = screen.getByLabelText('Amount') as HTMLInputElement;
		expect(input.value).toBe('1.000');
	});

	it('updates store when user types', async () => {
		const user = userEvent.setup();
		const value = writable(0);
		render(CurrencyInput, { props: { id: 'test', label: 'Amount', value } });

		const input = screen.getByLabelText('Amount') as HTMLInputElement;
		await user.clear(input);
		await user.type(input, '5000');

		expect(get(value)).toBe(5000);
	});

	it('formats value on blur', async () => {
		const user = userEvent.setup();
		const value = writable(0);
		render(CurrencyInput, { props: { id: 'test', label: 'Amount', value } });

		const input = screen.getByLabelText('Amount') as HTMLInputElement;
		await user.clear(input);
		await user.type(input, '10000');
		await user.tab(); // blur

		expect(input.value).toBe('10.000');
	});
});
