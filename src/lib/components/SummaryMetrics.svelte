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
	$: totalReturns =
		winner === 'IndexaCapital' ? indexaCapital.totalReturns : myInvestor.totalReturns;
	$: returnPercentage =
		totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : '0.00';
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
	<!-- Winner Card -->
	<div class="p-3.5 bg-gradient-blue rounded-xl shadow-neu-raised-sm">
		<div class="flex items-center gap-1.5 mb-1.5">
			<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span class="text-xs font-medium text-white/90">Ganador</span>
		</div>
		<div class="text-xl font-bold text-white mb-0.5">{winner}</div>
		<div class="text-xs text-white/80">Por delante por {formatCurrency(difference)}</div>
	</div>

	<!-- Final Balance Card -->
	<div class="p-3.5 bg-neu-base rounded-xl shadow-neu-raised-sm">
		<div class="flex items-center gap-1.5 mb-1.5">
			<svg class="w-4 h-4 text-neu-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
				/>
			</svg>
			<span class="text-xs font-medium text-neu-text-light">Mejor Capital Final</span>
		</div>
		<div class="text-xl font-bold text-neu-text-dark mb-0.5">
			{formatCurrency(bestFinalBalance)}
		</div>
		<div class="text-xs text-neu-text-light">Valor total de la cartera</div>
	</div>

	<!-- Returns Card -->
	<div class="p-3.5 bg-neu-base rounded-xl shadow-neu-raised-sm">
		<div class="flex items-center gap-1.5 mb-1.5">
			<svg class="w-4 h-4 text-neu-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
				/>
			</svg>
			<span class="text-xs font-medium text-neu-text-light">Rentabilidad del Ganador</span>
		</div>
		<div class="text-xl font-bold text-neu-green mb-0.5">{formatCurrency(totalReturns)}</div>
		<div class="text-xs text-neu-text-light">+{returnPercentage}% de rentabilidad</div>
	</div>
</div>
