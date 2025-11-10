import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createSimulationParamsStore } from '$lib/stores/simulationParams';
import SimulatorFormTestWrapper from './SimulatorFormTestWrapper.svelte';

describe('SimulatorForm', () => {
	it('renders all form inputs', () => {
		const store = createSimulationParamsStore();
		render(SimulatorFormTestWrapper, { props: { simulationParams: store } });

		expect(screen.getByLabelText('Initial Investment')).toBeTruthy();
		expect(screen.getByLabelText('Regular Deposit')).toBeTruthy();
		expect(screen.getByLabelText('Deposit Frequency')).toBeTruthy();
		expect(screen.getByLabelText('Investment Period (years)')).toBeTruthy();
		expect(screen.getByLabelText('Expected Return (% per year)')).toBeTruthy();
		expect(screen.getByLabelText('MyInvestor TER (%)')).toBeTruthy();
	});

	it('currency inputs display formatted values', () => {
		const store = createSimulationParamsStore();
		render(SimulatorFormTestWrapper, { props: { simulationParams: store } });

		const initialInput = screen.getByLabelText('Initial Investment') as HTMLInputElement;
		const depositInput = screen.getByLabelText('Regular Deposit') as HTMLInputElement;

		expect(initialInput.value).toBe('1.000'); // default 1000
		expect(depositInput.value).toBe('100'); // default 100
	});

	it('should update store when input changes without circular updates', async () => {
		const store = createSimulationParamsStore();

		let updateCount = 0;
		const unsubscribe = store.subscribe(() => {
			updateCount++;
		});

		const { container } = render(SimulatorFormTestWrapper, {
			props: { simulationParams: store }
		});

		// Reset counter after initial render
		const baselineCount = updateCount;

		const input = container.querySelector('#years') as HTMLInputElement;
		await fireEvent.input(input, { target: { value: '25' } });
		// NumericInput updates store on blur (after validation), not on input
		await fireEvent.blur(input);

		// Should update only once from the input change
		// With circular reactivity, we might see 2+ updates for a single input change
		const updatesFromInput = updateCount - baselineCount;

		// Should be exactly 1 update, not multiple due to circular reactivity
		expect(updatesFromInput).toBe(1);

		unsubscribe();
	});

	it('should not have circular reactivity for currency inputs', async () => {
		const store = createSimulationParamsStore();

		let updateCount = 0;
		const unsubscribe = store.subscribe(() => {
			updateCount++;
		});

		const { container } = render(SimulatorFormTestWrapper, {
			props: { simulationParams: store }
		});

		// Reset counter after initial render
		const baselineCount = updateCount;

		// Change initial investment input
		const initialInput = container.querySelector('#initial') as HTMLInputElement;
		await fireEvent.input(initialInput, { target: { value: '5000' } });
		// With validation, we need to blur to trigger the store update
		await fireEvent.blur(initialInput);

		// Wait for any potential circular updates
		await new Promise((resolve) => setTimeout(resolve, 50));

		const updatesFromInput = updateCount - baselineCount;

		// With circular reactivity (lines 14-20), we might see multiple updates
		// Without it, should be exactly 1
		expect(updatesFromInput).toBe(1);

		unsubscribe();
	});
});

describe('SimulatorForm numeric input validation', () => {
	it('should show error when investment years is less than 1', async () => {
		const user = userEvent.setup();
		const store = createSimulationParamsStore();

		render(SimulatorFormTestWrapper, { props: { simulationParams: store } });

		const yearsInput = screen.getByLabelText(/investment period/i);

		await user.clear(yearsInput);
		await user.type(yearsInput, '0');
		await user.tab();

		expect(screen.getByText(/minimum value is 1 year/i)).toBeInTheDocument();
		expect(yearsInput).toHaveClass('border-red-500');
	});

	it('should show error when TER is below minimum (0.05)', async () => {
		const user = userEvent.setup();
		const store = createSimulationParamsStore();

		render(SimulatorFormTestWrapper, { props: { simulationParams: store } });

		const terInput = screen.getByLabelText(/myinvestor ter/i);

		await user.clear(terInput);
		await user.type(terInput, '0.01');
		await user.tab();

		expect(screen.getByText(/minimum value is 0\.05%/i)).toBeInTheDocument();
	});

	it('should show error when TER is above maximum (0.59)', async () => {
		const user = userEvent.setup();
		const store = createSimulationParamsStore();

		render(SimulatorFormTestWrapper, { props: { simulationParams: store } });

		const terInput = screen.getByLabelText(/myinvestor ter/i);

		await user.clear(terInput);
		await user.type(terInput, '0.80');
		await user.tab();

		expect(screen.getByText(/maximum value is 0\.59%/i)).toBeInTheDocument();
	});

	it('should show error when expected return is not a valid number', async () => {
		const user = userEvent.setup();
		const store = createSimulationParamsStore();

		render(SimulatorFormTestWrapper, { props: { simulationParams: store } });

		const returnInput = screen.getByLabelText(/expected return/i);

		await user.clear(returnInput);
		await user.type(returnInput, 'abc');
		await user.tab();

		expect(screen.getByText(/please enter a valid number/i)).toBeInTheDocument();
	});
});
