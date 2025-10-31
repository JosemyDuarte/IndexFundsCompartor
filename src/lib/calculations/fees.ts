export function getIndexaCapitalFee(balance: number): number {
	// Management fee based on tier
	let managementFee: number;

	if (balance >= 100000000) {
		managementFee = 0.08;
	} else if (balance >= 50000000) {
		managementFee = 0.1;
	} else if (balance >= 10000000) {
		managementFee = 0.15;
	} else if (balance >= 5000000) {
		managementFee = 0.2;
	} else if (balance >= 1000000) {
		managementFee = 0.25;
	} else if (balance >= 500000) {
		managementFee = 0.3;
	} else if (balance >= 100000) {
		managementFee = 0.355;
	} else if (balance >= 10000) {
		managementFee = 0.385;
	} else {
		managementFee = 0.405;
	}

	// Fixed costs: custody (0.096%) + underlying (0.098%)
	const fixedCosts = 0.096 + 0.098;

	// Round to 3 decimal places to avoid floating point precision issues
	return Math.round((managementFee + fixedCosts) * 1000) / 1000;
}

export function getMyInvestorFee(ter: number): number {
	const managementFee = 0.3;
	// Round to 2 decimal places to avoid floating point precision issues
	return Math.round((managementFee + ter) * 100) / 100;
}
