<!-- src/lib/components/SummaryMetrics.svelte -->
<script lang="ts">
	import type { ProviderResult } from '$lib/calculations/simulator';
	import { formatCurrency } from '$lib/utils/formatters';

	export let indexaCapital: ProviderResult;
	export let myInvestor: ProviderResult;

	$: winner = indexaCapital.finalBalance > myInvestor.finalBalance ? 'IndexaCapital' : 'MyInvestor';
	$: difference = Math.abs(indexaCapital.finalBalance - myInvestor.finalBalance);
	$: totalInvested = indexaCapital.totalInvested;
	$: bestFinalBalance = Math.max(indexaCapital.finalBalance, myInvestor.finalBalance);
	$: totalReturns = winner === 'IndexaCapital' ? indexaCapital.totalReturns : myInvestor.totalReturns;
	$: returnPercentage = ((totalReturns / totalInvested) * 100).toFixed(2);
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
	<!-- Winner Card -->
	<div class="p-4 bg-gradient-blue rounded-xl shadow-revolut-glow-blue">
		<div class="flex items-center gap-2 mb-2">
			<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span class="text-sm font-medium text-white/80">Winner</span>
		</div>
		<div class="text-2xl font-bold text-white mb-1">{winner}</div>
		<div class="text-sm text-white/80">Ahead by {formatCurrency(difference)}</div>
	</div>

	<!-- Final Balance Card -->
	<div class="p-4 bg-white/5 border border-white/10 rounded-xl">
		<div class="flex items-center gap-2 mb-2">
			<svg class="w-5 h-5 text-revolut-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
			</svg>
			<span class="text-sm font-medium text-gray-400">Best Final Balance</span>
		</div>
		<div class="text-2xl font-bold text-white mb-1">{formatCurrency(bestFinalBalance)}</div>
		<div class="text-sm text-gray-400">Total portfolio value</div>
	</div>

	<!-- Returns Card -->
	<div class="p-4 bg-white/5 border border-white/10 rounded-xl">
		<div class="flex items-center gap-2 mb-2">
			<svg class="w-5 h-5 text-revolut-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
			</svg>
			<span class="text-sm font-medium text-gray-400">Total Returns</span>
		</div>
		<div class="text-2xl font-bold text-revolut-green mb-1">{formatCurrency(totalReturns)}</div>
		<div class="text-sm text-gray-400">+{returnPercentage}% gain</div>
	</div>
</div>
