import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import NumericInput from './NumericInput.svelte';

describe('NumericInput', () => {
	it('should clear error message when user starts typing', async () => {
		const user = userEvent.setup();

		const { component } = render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 0,
				min: 1
			}
		});

		const input = screen.getByLabelText('Test Input');

		// Trigger error
		await user.clear(input);
		await user.type(input, '0');
		await user.tab();
		expect(screen.getByText(/minimum value/i)).toBeInTheDocument();

		// Start typing - error should clear
		await user.click(input);
		await user.type(input, '5');
		expect(screen.queryByText(/minimum value/i)).not.toBeInTheDocument();
	});

	it('should handle negative numbers', async () => {
		const user = userEvent.setup();

		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 10,
				min: 0
			}
		});

		const input = screen.getByLabelText('Test Input');

		await user.clear(input);
		await user.type(input, '-5');
		await user.tab();

		expect(screen.getByText(/minimum value is 0/i)).toBeInTheDocument();
	});

	it('should handle decimal inputs', async () => {
		const user = userEvent.setup();

		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 5,
				min: 0,
				max: 10,
				step: 0.1
			}
		});

		const input = screen.getByLabelText('Test Input');

		await user.clear(input);
		await user.type(input, '7.5');
		await user.tab();

		expect(screen.queryByText(/minimum value/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/maximum value/i)).not.toBeInTheDocument();
	});

	it('should show error for empty input on required numeric field', async () => {
		const user = userEvent.setup();

		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 10,
				min: 1
			}
		});

		const input = screen.getByLabelText('Test Input');

		await user.clear(input);
		await user.tab();

		expect(screen.getByText(/please enter a valid number/i)).toBeInTheDocument();
	});

	it('should not update bound value when validation fails', async () => {
		const user = userEvent.setup();
		let testValue = 10;

		const { component } = render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: testValue,
				min: 5
			}
		});

		const input = screen.getByLabelText('Test Input') as HTMLInputElement;

		// Try to set invalid value
		await user.clear(input);
		await user.type(input, '2');
		await user.tab();

		// Check that error is displayed
		expect(screen.getByText(/minimum value/i)).toBeInTheDocument();

		// The value should have reset to the original value on blur
		// (this is the current behavior - input resets on validation failure)
		expect(input.value).toBe('10');
	});

	it('should call onchange callback only when validation passes', async () => {
		const user = userEvent.setup();
		const onChangeMock = vi.fn();

		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 10,
				min: 5,
				onchange: onChangeMock
			}
		});

		const input = screen.getByLabelText('Test Input');

		// Invalid value - callback should not be called
		await user.clear(input);
		await user.type(input, '2');
		await user.tab();
		expect(onChangeMock).not.toHaveBeenCalled();

		// Valid value - callback should be called
		await user.clear(input);
		await user.type(input, '15');
		await user.tab();
		expect(onChangeMock).toHaveBeenCalledWith(15);
	});

	it('should handle very large numbers', async () => {
		const user = userEvent.setup();

		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 100,
				min: 0
			}
		});

		const input = screen.getByLabelText('Test Input');

		await user.clear(input);
		await user.type(input, '999999999');
		await user.tab();

		expect(screen.queryByText(/please enter a valid number/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/minimum value/i)).not.toBeInTheDocument();
	});

	it('should validate against maximum value', async () => {
		const user = userEvent.setup();

		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 5,
				min: 0,
				max: 10
			}
		});

		const input = screen.getByLabelText('Test Input');

		await user.clear(input);
		await user.type(input, '15');
		await user.tab();

		expect(screen.getByText(/maximum value is 10/i)).toBeInTheDocument();
	});

	it('should handle decimal validation with min/max', async () => {
		const user = userEvent.setup();

		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 5.5,
				min: 0.05,
				max: 0.59,
				step: 0.01,
				suffix: '%'
			}
		});

		const input = screen.getByLabelText('Test Input');

		// Test below minimum
		await user.clear(input);
		await user.type(input, '0.01');
		await user.tab();
		expect(screen.getByText(/minimum value is 0\.05%/i)).toBeInTheDocument();

		// Test above maximum
		await user.clear(input);
		await user.type(input, '0.80');
		await user.tab();
		expect(screen.getByText(/maximum value is 0\.59%/i)).toBeInTheDocument();

		// Test valid value
		await user.clear(input);
		await user.type(input, '0.25');
		await user.tab();
		expect(screen.queryByText(/minimum value/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/maximum value/i)).not.toBeInTheDocument();
	});

	it('should reset display value to original when validation fails', async () => {
		const user = userEvent.setup();

		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 10,
				min: 5
			}
		});

		const input = screen.getByLabelText('Test Input') as HTMLInputElement;

		// Enter invalid value
		await user.clear(input);
		await user.type(input, '2');
		await user.tab();

		// Input should reset to original value on blur when validation fails
		expect(input.value).toBe('10');
		expect(screen.getByText(/minimum value/i)).toBeInTheDocument();
	});

	it('should handle suffix display correctly', async () => {
		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 7,
				suffix: '%'
			}
		});

		expect(screen.getByText('%')).toBeInTheDocument();
	});

	it('should clear error when user corrects invalid input', async () => {
		const user = userEvent.setup();

		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 10,
				min: 5
			}
		});

		const input = screen.getByLabelText('Test Input');

		// Enter invalid value
		await user.clear(input);
		await user.type(input, '2');
		await user.tab();
		expect(screen.getByText(/minimum value/i)).toBeInTheDocument();

		// Correct the value
		await user.clear(input);
		await user.type(input, '10');
		await user.tab();
		expect(screen.queryByText(/minimum value/i)).not.toBeInTheDocument();
	});

	it('should handle zero as valid input when min is 0', async () => {
		const user = userEvent.setup();

		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 10,
				min: 0
			}
		});

		const input = screen.getByLabelText('Test Input');

		await user.clear(input);
		await user.type(input, '0');
		await user.tab();

		expect(screen.queryByText(/minimum value/i)).not.toBeInTheDocument();
	});

	it('should format year suffix correctly for singular and plural', async () => {
		const user = userEvent.setup();

		// Test min=1 (singular)
		const { rerender } = render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 10,
				min: 1
			}
		});

		const input = screen.getByLabelText('Test Input');

		await user.clear(input);
		await user.type(input, '0');
		await user.tab();
		expect(screen.getByText(/minimum value is 1 year/i)).toBeInTheDocument();
		expect(screen.queryByText(/years/i)).not.toBeInTheDocument();
	});

	it('should format year suffix correctly for plural', async () => {
		const user = userEvent.setup();

		render(NumericInput, {
			props: {
				id: 'test',
				label: 'Test Input',
				value: 10,
				min: 2
			}
		});

		const input = screen.getByLabelText('Test Input');

		await user.clear(input);
		await user.type(input, '0');
		await user.tab();
		expect(screen.getByText(/minimum value is 2 years/i)).toBeInTheDocument();
	});
});
