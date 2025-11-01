<script lang="ts">
	import type { ProviderResult } from '$lib/calculations/simulator';
	import { formatCurrency } from '$lib/utils/formatters';

	export let indexaCapital: ProviderResult;
	export let myInvestor: ProviderResult;

	$: winner = indexaCapital.finalBalance > myInvestor.finalBalance ? 'indexa' : 'myinvestor';
	$: difference = Math.abs(indexaCapital.finalBalance - myInvestor.finalBalance);
</script>

<div class="space-y-4">
	<!-- Winner Badge -->
	<div class="flex items-center justify-center gap-2 p-4 bg-gradient-blue rounded-xl shadow-revolut-glow-blue">
		<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<span class="text-white font-semibold">
			{winner === 'indexa' ? 'IndexaCapital' : 'MyInvestor'} wins by {formatCurrency(difference)}
		</span>
	</div>

	<!-- Comparison Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- IndexaCapital Card -->
		<div class="p-6 bg-white/5 border border-white/10 rounded-xl
			{winner === 'indexa' ? 'ring-2 ring-revolut-purple shadow-revolut-glow-purple' : ''}
			transition-all duration-300">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-white">IndexaCapital</h3>
				{#if winner === 'indexa'}
					<span class="px-3 py-1 bg-revolut-purple text-white text-xs font-medium rounded-full">
						Winner
					</span>
				{/if}
			</div>

			<div class="space-y-3">
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-400">Total Invested</span>
					<span class="text-sm font-medium text-white">{formatCurrency(indexaCapital.totalInvested)}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-400">Total Returns</span>
					<span class="text-sm font-medium text-revolut-green">{formatCurrency(indexaCapital.totalReturns)}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-400">Total Fees</span>
					<span class="text-sm font-medium text-revolut-red">{formatCurrency(indexaCapital.totalFeesPaid)}</span>
				</div>
				<div class="pt-3 border-t border-white/10">
					<div class="flex justify-between items-center">
						<span class="text-base font-semibold text-white">Final Balance</span>
						<span class="text-lg font-bold text-white">{formatCurrency(indexaCapital.finalBalance)}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- MyInvestor Card -->
		<div class="p-6 bg-white/5 border border-white/10 rounded-xl
			{winner === 'myinvestor' ? 'ring-2 ring-revolut-blue shadow-revolut-glow-blue' : ''}
			transition-all duration-300">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-white">MyInvestor</h3>
				{#if winner === 'myinvestor'}
					<span class="px-3 py-1 bg-revolut-blue text-white text-xs font-medium rounded-full">
						Winner
					</span>
				{/if}
			</div>

			<div class="space-y-3">
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-400">Total Invested</span>
					<span class="text-sm font-medium text-white">{formatCurrency(myInvestor.totalInvested)}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-400">Total Returns</span>
					<span class="text-sm font-medium text-revolut-green">{formatCurrency(myInvestor.totalReturns)}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-400">Total Fees</span>
					<span class="text-sm font-medium text-revolut-red">{formatCurrency(myInvestor.totalFeesPaid)}</span>
				</div>
				<div class="pt-3 border-t border-white/10">
					<div class="flex justify-between items-center">
						<span class="text-base font-semibold text-white">Final Balance</span>
						<span class="text-lg font-bold text-white">{formatCurrency(myInvestor.finalBalance)}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
