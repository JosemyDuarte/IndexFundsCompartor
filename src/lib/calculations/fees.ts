/**
 * Get IndexaCapital custody fee based on balance
 * Custody fees are tiered by balance amount
 */
function getCustodyFee(balance: number): number {
	if (balance < 10000) return 0.109;
	if (balance < 100000) return 0.103;
	if (balance < 500000) return 0.097;
	if (balance < 1000000) return 0.091;
	return 0.048;
}

export interface IndexaCapitalFeeComposition {
	managementFee: number;
	custodyFee: number;
	underlyingFee: number;
	totalFee: number;
}

export interface MyInvestorFeeComposition {
	managementFee: number;
	ter: number;
	totalFee: number;
}

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

	// Get tiered custody fee based on balance
	const custodyFee = getCustodyFee(balance);
	const underlyingFee = 0.098;

	// Round to 3 decimal places to avoid floating point precision issues
	return Math.round((managementFee + custodyFee + underlyingFee) * 1000) / 1000;
}

export function getMyInvestorFee(ter: number): number {
	const managementFee = 0.3;
	// Round to 2 decimal places to avoid floating point precision issues
	return Math.round((managementFee + ter) * 100) / 100;
}

export function getIndexaCapitalFeeComposition(balance: number): IndexaCapitalFeeComposition {
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

	// Get tiered custody fee based on balance
	const custodyFee = getCustodyFee(balance);
	const underlyingFee = 0.098;
	const totalFee = Math.round((managementFee + custodyFee + underlyingFee) * 1000) / 1000;

	return {
		managementFee,
		custodyFee,
		underlyingFee,
		totalFee
	};
}

export function getMyInvestorFeeComposition(ter: number): MyInvestorFeeComposition {
	const managementFee = 0.3;
	const totalFee = Math.round((managementFee + ter) * 100) / 100;

	return {
		managementFee,
		ter,
		totalFee
	};
}
