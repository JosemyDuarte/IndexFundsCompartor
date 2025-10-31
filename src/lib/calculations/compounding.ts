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
	const { initialBalance, annualReturn, totalMonths } = params;
	const monthlyReturnRate = annualReturn / 100 / 12;

	const balance = initialBalance * (1 + monthlyReturnRate);
	const totalReturns = balance - initialBalance;

	return [
		{
			month: 1,
			balance,
			totalDeposited: initialBalance,
			totalFeesPaid: 0,
			totalReturns
		}
	];
}
