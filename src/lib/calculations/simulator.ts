import type { DepositFrequency, MonthlySnapshot } from './compounding';
import { calculateMonthlyGrowth } from './compounding';
import { getIndexaCapitalFee, getMyInvestorFee } from './fees';

export interface SimulationParams {
	initialInvestment: number;
	depositAmount: number;
	depositFrequency: DepositFrequency;
	timePeriodYears: number;
	expectedReturn: number;
	myInvestorTER: number;
}

export interface ProviderResult {
	totalInvested: number;
	totalFeesPaid: number;
	totalReturns: number;
	finalBalance: number;
	monthlySnapshots: MonthlySnapshot[];
	averageFeeRate: number; // Weighted average annual fee rate
	currentFeeRate: number; // Current annual fee rate (last month)
}

export interface SimulationResults {
	indexaCapital: ProviderResult;
	myInvestor: ProviderResult;
}

export function calculateProviderComparison(params: SimulationParams): SimulationResults {
	const totalMonths = params.timePeriodYears * 12;

	// Simulate IndexaCapital with dynamic tiered fees
	const indexaSnapshots = simulateWithDynamicFees(params, totalMonths, getIndexaCapitalFee);

	// Simulate MyInvestor with fixed fees
	const myInvestorFeeRate = getMyInvestorFee(params.myInvestorTER);
	const myInvestorSnapshots = calculateMonthlyGrowth({
		initialBalance: params.initialInvestment,
		depositAmount: params.depositAmount,
		depositFrequency: params.depositFrequency,
		annualReturn: params.expectedReturn,
		annualFeeRate: myInvestorFeeRate,
		totalMonths
	});

	return {
		indexaCapital: buildProviderResult(indexaSnapshots),
		myInvestor: buildProviderResult(myInvestorSnapshots)
	};
}

function simulateWithDynamicFees(
	params: SimulationParams,
	totalMonths: number,
	getFeeRate: (balance: number) => number
): MonthlySnapshot[] {
	// For IndexaCapital, we need to recalculate fees each month based on current balance
	const snapshots: MonthlySnapshot[] = [];
	let balance = params.initialInvestment;
	let totalDeposited = params.initialInvestment;
	let totalFeesPaid = 0;
	let totalReturns = 0;
	let previousFeeRate: number | null = null;

	const monthlyReturnRate = params.expectedReturn / 100 / 12;

	for (let month = 1; month <= totalMonths; month++) {
		// Determine if deposit happens this month
		const shouldDeposit =
			params.depositFrequency === 'monthly' ||
			(params.depositFrequency === 'quarterly' && month % 3 === 0) ||
			(params.depositFrequency === 'annual' && month % 12 === 0);

		if (shouldDeposit) {
			balance += params.depositAmount;
			totalDeposited += params.depositAmount;
		}

		// Apply monthly return
		const monthlyReturn = balance * monthlyReturnRate;
		balance += monthlyReturn;
		totalReturns += monthlyReturn;

		// Get dynamic fee based on current balance
		const annualFeeRate = getFeeRate(balance);
		const monthlyFeeRate = annualFeeRate / 100 / 12;
		const monthlyFee = balance * monthlyFeeRate;
		balance -= monthlyFee;
		totalFeesPaid += monthlyFee;

		// Detect bracket change
		const bracketChanged = previousFeeRate !== null && annualFeeRate !== previousFeeRate;
		previousFeeRate = annualFeeRate;

		snapshots.push({
			month,
			balance,
			totalDeposited,
			totalFeesPaid,
			totalReturns,
			feeRate: annualFeeRate,
			bracketChanged: bracketChanged || undefined
		});
	}

	return snapshots;
}

function buildProviderResult(snapshots: MonthlySnapshot[]): ProviderResult {
	const lastSnapshot = snapshots[snapshots.length - 1];

	// Calculate weighted average fee rate
	// Weight by balance at each month to get accurate average
	let totalWeightedFee = 0;
	let totalWeight = 0;

	snapshots.forEach(snapshot => {
		totalWeightedFee += snapshot.feeRate * snapshot.balance;
		totalWeight += snapshot.balance;
	});

	const averageFeeRate = totalWeight > 0 ? totalWeightedFee / totalWeight : 0;

	return {
		totalInvested: lastSnapshot.totalDeposited,
		totalFeesPaid: lastSnapshot.totalFeesPaid,
		totalReturns: lastSnapshot.totalReturns,
		finalBalance: lastSnapshot.balance,
		monthlySnapshots: snapshots,
		averageFeeRate: Math.round(averageFeeRate * 1000) / 1000, // Round to 3 decimals
		currentFeeRate: lastSnapshot.feeRate
	};
}
