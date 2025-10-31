import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import SimulatorForm from './SimulatorForm.svelte';

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
});
