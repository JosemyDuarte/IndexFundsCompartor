import type { SimulationParams } from '$lib/calculations/simulator';

export function paramsToUrl(params: SimulationParams): string {
	const searchParams = new URLSearchParams({
		initial: params.initialInvestment.toString(),
		deposit: params.depositAmount.toString(),
		freq: params.depositFrequency,
		years: params.timePeriodYears.toString(),
		return: params.expectedReturn.toString(),
		ter: params.myInvestorTER.toString()
	});

	return searchParams.toString();
}

export function urlToParams(url: string): Partial<SimulationParams> {
	const searchParams = new URLSearchParams(url);
	const params: Partial<SimulationParams> = {};

	const initial = searchParams.get('initial');
	if (initial) {
		const num = parseFloat(initial);
		if (!isNaN(num) && num > 0) params.initialInvestment = num;
	}

	const deposit = searchParams.get('deposit');
	if (deposit) {
		const num = parseFloat(deposit);
		if (!isNaN(num) && num >= 0) params.depositAmount = num;
	}

	const freq = searchParams.get('freq');
	if (freq === 'monthly' || freq === 'quarterly' || freq === 'annual') {
		params.depositFrequency = freq;
	}

	const years = searchParams.get('years');
	if (years) {
		const num = parseFloat(years);
		if (!isNaN(num) && num > 0) params.timePeriodYears = num;
	}

	const returnRate = searchParams.get('return');
	if (returnRate) {
		const num = parseFloat(returnRate);
		if (!isNaN(num)) params.expectedReturn = num;
	}

	const ter = searchParams.get('ter');
	if (ter) {
		const num = parseFloat(ter);
		if (!isNaN(num) && num >= 0.05 && num <= 0.59) params.myInvestorTER = num;
	}

	return params;
}
