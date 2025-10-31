export type DepositFrequency = 'monthly' | 'quarterly' | 'annual';

export interface MonthlyGrowthParams {
	initialBalance: number;
	depositAmount: number;
	depositFrequency: DepositFrequency;
	annualReturn: number;
	annualFeeRate: number;
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
	const {
		initialBalance,
		depositAmount,
		depositFrequency,
		annualReturn,
		annualFeeRate,
		totalMonths
	} = params;
	const monthlyReturnRate = annualReturn / 100 / 12;
	const monthlyFeeRate = annualFeeRate / 100 / 12;

	const snapshots: MonthlySnapshot[] = [];
	let balance = initialBalance;
	let totalDeposited = initialBalance;
	let totalFeesPaid = 0;
	let totalReturns = 0;

	for (let month = 1; month <= totalMonths; month++) {
		// Determine if deposit happens this month
		const shouldDeposit =
			depositFrequency === 'monthly' ||
			(depositFrequency === 'quarterly' && month % 3 === 0) ||
			(depositFrequency === 'annual' && month % 12 === 0);

		if (shouldDeposit) {
			balance += depositAmount;
			totalDeposited += depositAmount;
		}

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
