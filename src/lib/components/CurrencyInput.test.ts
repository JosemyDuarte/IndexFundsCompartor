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

	it('updates store when user types and blurs', async () => {
		const user = userEvent.setup();
		const value = writable(0);
		render(CurrencyInput, { props: { id: 'test', label: 'Amount', value } });

		const input = screen.getByLabelText('Amount') as HTMLInputElement;
		await user.clear(input);
		await user.type(input, '5000');
		await user.tab(); // blur to trigger validation and update

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

describe('CurrencyInput validation', () => {
	it('should show error message when value is below minimum', async () => {
		const value = writable(500);
		const user = userEvent.setup();

		render(CurrencyInput, {
			props: {
				id: 'test-input',
				label: 'Test Input',
				value,
				min: 1000,
				step: 100
			}
		});

		const input = screen.getByLabelText('Test Input');

		// Enter value below minimum
		await user.clear(input);
		await user.type(input, '500');
		await user.tab(); // Trigger blur

		// Should show error message
		expect(screen.getByText(/minimum value is €1\.000/i)).toBeInTheDocument();
	});

	it('should show error for invalid input (letters)', async () => {
		const value = writable(1000);
		const user = userEvent.setup();

		render(CurrencyInput, {
			props: {
				id: 'test-input',
				label: 'Test Input',
				value,
				min: 0,
				step: 100
			}
		});

		const input = screen.getByLabelText('Test Input');

		await user.clear(input);
		await user.type(input, 'abc');
		await user.tab();

		expect(screen.getByText(/please enter a valid number/i)).toBeInTheDocument();
	});

	it('should apply error styling when validation fails', async () => {
		const value = writable(500);
		const user = userEvent.setup();

		render(CurrencyInput, {
			props: {
				id: 'test-input',
				label: 'Test Input',
				value,
				min: 1000,
				step: 100
			}
		});

		const input = screen.getByLabelText('Test Input');

		await user.clear(input);
		await user.type(input, '500');
		await user.tab();

		// Should have error styling
		expect(input).toHaveClass('border-red-500');
	});

	it('should clear error when valid value entered', async () => {
		const value = writable(500);
		const user = userEvent.setup();

		render(CurrencyInput, {
			props: {
				id: 'test-input',
				label: 'Test Input',
				value,
				min: 1000,
				step: 100
			}
		});

		const input = screen.getByLabelText('Test Input');

		// Enter invalid value
		await user.clear(input);
		await user.type(input, '500');
		await user.tab();

		expect(screen.getByText(/minimum value/i)).toBeInTheDocument();

		// Fix with valid value
		await user.clear(input);
		await user.type(input, '2000');
		await user.tab();

		expect(screen.queryByText(/minimum value/i)).not.toBeInTheDocument();
		expect(input).not.toHaveClass('border-red-500');
	});
});
