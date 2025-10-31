import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import SimulatorForm from './SimulatorForm.svelte';
import { simulationParams } from '$lib/stores/simulationParams';

describe('SimulatorForm', () => {
	it('should render all input fields', () => {
		render(SimulatorForm);

		expect(screen.getByLabelText(/initial investment/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/deposit amount/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/deposit frequency/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/time period/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/expected return/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/myinvestor ter/i)).toBeInTheDocument();
	});

	it('should update store when inputs change', async () => {
		render(SimulatorForm);

		const initialInput = screen.getByLabelText(/initial investment/i) as HTMLInputElement;

		await fireEvent.input(initialInput, { target: { value: '5000' } });

		const params = get(simulationParams);
		expect(params.initialInvestment).toBe(5000);
	});
});
