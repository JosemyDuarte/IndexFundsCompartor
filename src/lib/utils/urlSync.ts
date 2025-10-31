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
	return {};
}
