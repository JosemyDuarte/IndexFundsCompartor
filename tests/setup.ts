import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Chart.js for tests
vi.mock('chart.js', async () => {
	const actual = await vi.importActual<typeof import('chart.js')>('chart.js');

	class MockChart {
		canvas: HTMLCanvasElement;
		data: any;
		options: any;

		constructor(canvas: HTMLCanvasElement, config: any) {
			this.canvas = canvas;
			this.data = config.data;
			this.options = config.options;
		}

		update() {}
		destroy() {}

		static register(...args: any[]) {}
	}

	return {
		...actual,
		Chart: MockChart
	};
});
