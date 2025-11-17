<script lang="ts">
	import type { ProviderResult } from '$lib/calculations/simulator';
	import { formatCurrency } from '$lib/utils/formatters';

	export let indexaCapital: ProviderResult;
	export let myInvestor: ProviderResult;

	$: winner =
		myInvestor.finalBalance > indexaCapital.finalBalance ? 'myinvestor' : 'indexa';
	$: difference = Math.abs(indexaCapital.finalBalance - myInvestor.finalBalance);
</script>

<div class="space-y-3">
	<!-- Comparison Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
		<!-- IndexaCapital Card -->
		<div
			class="p-4 bg-neu-base rounded-xl
			{winner === 'indexa' ? 'shadow-neu-raised' : 'shadow-neu-raised-sm'}
			transition-all duration-300"
		>
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-neu-text-dark">IndexaCapital</h3>
				{#if winner === 'indexa'}
					<span class="px-2 py-0.5 bg-neu-purple text-white text-xs font-medium rounded-full shadow-neu-raised-sm">
						Winner
					</span>
				{/if}
			</div>

			<div class="space-y-2">
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Invested</span>
					<span class="text-xs font-medium text-neu-text-dark"
						>{formatCurrency(indexaCapital.totalInvested)}</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Returns</span>
					<span class="text-xs font-medium text-neu-green"
						>{formatCurrency(indexaCapital.totalReturns)}</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Fees</span>
					<span class="text-xs font-medium text-neu-red"
						>{formatCurrency(indexaCapital.totalFeesPaid)}</span
					>
				</div>
				<!-- Fee Composition Breakdown -->
				{#if indexaCapital.feeComposition && 'managementFee' in indexaCapital.feeComposition}
					<div class="ml-2 space-y-1 bg-neu-dark/5 p-2 rounded">
						<div class="text-xs font-medium text-neu-text-light mb-1">Fee Breakdown</div>
						<div class="flex justify-between items-center">
							<span class="text-xs text-neu-text-light">Management:</span>
							<span class="text-xs text-neu-text">{indexaCapital.feeComposition.managementFee.toFixed(3)}%</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-xs text-neu-text-light">Custody:</span>
							<span class="text-xs text-neu-text">{indexaCapital.feeComposition.custodyFee.toFixed(3)}%</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-xs text-neu-text-light">TER:</span>
							<span class="text-xs text-neu-text">{indexaCapital.feeComposition.ter.toFixed(3)}%</span>
						</div>
					</div>
				{/if}
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Average Fee Rate</span>
					<span class="text-xs font-medium text-neu-text"
						>{indexaCapital.averageFeeRate.toFixed(3)}%</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Current Fee Rate</span>
					<span class="text-xs font-medium text-neu-text"
						>{indexaCapital.currentFeeRate.toFixed(3)}%</span
					>
				</div>
				<div class="pt-2 border-t border-neu-dark/20">
					<div class="flex justify-between items-center">
						<span class="text-xs font-semibold text-neu-text-dark">Final Balance</span>
						<span class="text-sm font-bold text-neu-text-dark"
							>{formatCurrency(indexaCapital.finalBalance)}</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- MyInvestor Card -->
		<div
			class="p-4 bg-neu-base rounded-xl
			{winner === 'myinvestor' ? 'shadow-neu-raised' : 'shadow-neu-raised-sm'}
			transition-all duration-300"
		>
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-neu-text-dark">MyInvestor</h3>
				{#if winner === 'myinvestor'}
					<span class="px-2 py-0.5 bg-neu-blue text-white text-xs font-medium rounded-full shadow-neu-raised-sm">
						Winner
					</span>
				{/if}
			</div>

			<div class="space-y-2">
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Invested</span>
					<span class="text-xs font-medium text-neu-text-dark"
						>{formatCurrency(myInvestor.totalInvested)}</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Returns</span>
					<span class="text-xs font-medium text-neu-green"
						>{formatCurrency(myInvestor.totalReturns)}</span
					>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Total Fees</span>
					<span class="text-xs font-medium text-neu-red"
						>{formatCurrency(myInvestor.totalFeesPaid)}</span
					>
				</div>
				<!-- Fee Composition Breakdown -->
				{#if myInvestor.feeComposition && 'ter' in myInvestor.feeComposition}
					<div class="ml-2 space-y-1 bg-neu-dark/5 p-2 rounded">
						<div class="text-xs font-medium text-neu-text-light mb-1">Fee Breakdown</div>
						<div class="flex justify-between items-center">
							<span class="text-xs text-neu-text-light">Management:</span>
							<span class="text-xs text-neu-text">{myInvestor.feeComposition.managementFee.toFixed(3)}%</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-xs text-neu-text-light">TER:</span>
							<span class="text-xs text-neu-text">{myInvestor.feeComposition.ter.toFixed(3)}%</span>
						</div>
					</div>
				{/if}
				<div class="flex justify-between items-center">
					<span class="text-xs text-neu-text-light">Fee Rate</span>
					<span class="text-xs font-medium text-neu-text"
						>{myInvestor.currentFeeRate.toFixed(2)}%</span
					>
				</div>
				<div class="pt-2 border-t border-neu-dark/20">
					<div class="flex justify-between items-center">
						<span class="text-xs font-semibold text-neu-text-dark">Final Balance</span>
						<span class="text-sm font-bold text-neu-text-dark"
							>{formatCurrency(myInvestor.finalBalance)}</span
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
