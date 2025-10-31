export interface MonthlyGrowthParams {
	initialBalance: number;
	monthlyDeposit: number;
	annualReturn: number; // percentage
	annualFeeRate: number; // percentage
	totalMonths: number;
}

export interface MonthlySnapshot {
	month: number;
	balance: number;
	totalDeposited: number;
	totalFeesPaid: number;
	totalReturns: number;
}

export function calculateMonthlyGrowth(params: MonthlyGrowthParams): MonthlySnapshot[] {
	const { initialBalance, monthlyDeposit, annualReturn, annualFeeRate, totalMonths } = params;
	const monthlyReturnRate = annualReturn / 100 / 12;
	const monthlyFeeRate = annualFeeRate / 100 / 12;

	const snapshots: MonthlySnapshot[] = [];
	let balance = initialBalance;
	let totalDeposited = initialBalance;
	let totalFeesPaid = 0;
	let totalReturns = 0;

	for (let month = 1; month <= totalMonths; month++) {
		// Apply monthly return
		const monthlyReturn = balance * monthlyReturnRate;
		balance += monthlyReturn;
		totalReturns += monthlyReturn;

		// Apply monthly fee
		const monthlyFee = balance * monthlyFeeRate;
		balance -= monthlyFee;
		totalFeesPaid += monthlyFee;

		snapshots.push({
			month,
			balance,
			totalDeposited,
			totalFeesPaid,
			totalReturns
		});
	}

	return snapshots;
}
