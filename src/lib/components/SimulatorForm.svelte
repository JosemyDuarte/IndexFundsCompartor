<script lang="ts">
	import { simulationParams } from '$lib/stores/simulationParams';
	import { writable } from 'svelte/store';
	import CurrencyInput from './CurrencyInput.svelte';

	// Create derived writable stores for currency inputs
	const initialInvestment = writable($simulationParams.initialInvestment);
	const depositAmount = writable($simulationParams.depositAmount);

	// Sync back to main store
	$: simulationParams.update((p) => ({ ...p, initialInvestment: $initialInvestment }));
	$: simulationParams.update((p) => ({ ...p, depositAmount: $depositAmount }));

	// Update local stores when main store changes externally
	$: initialInvestment.set($simulationParams.initialInvestment);
	$: depositAmount.set($simulationParams.depositAmount);
</script>

<form class="space-y-4">
	<!-- Initial Investment -->
	<CurrencyInput
		id="initial"
		label="Initial Investment"
		value={initialInvestment}
		min={0}
		step={100}
	/>

	<!-- Deposit Amount -->
	<CurrencyInput id="deposit" label="Regular Deposit" value={depositAmount} min={0} step={10} />

	<!-- Deposit Frequency -->
	<div>
		<label for="frequency" class="block text-xs font-medium text-neu-text-dark mb-1.5">
			Deposit Frequency
		</label>
		<div class="relative">
			<select
				id="frequency"
				bind:value={$simulationParams.depositFrequency}
				class="w-full px-3 py-2.5 bg-neu-base shadow-neu-inset rounded-lg text-sm
					text-neu-text appearance-none cursor-pointer
					focus:outline-none focus:shadow-neu-inset-sm
					transition-all duration-200"
			>
				<option value="monthly" class="bg-neu-base">Monthly</option>
				<option value="quarterly" class="bg-neu-base">Quarterly</option>
				<option value="annual" class="bg-neu-base">Annual</option>
			</select>
			<div class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
				<svg class="w-3.5 h-3.5 text-neu-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</div>
		</div>
	</div>

	<!-- Time Period -->
	<div>
		<label for="years" class="block text-xs font-medium text-neu-text-dark mb-1.5">
			Investment Period (years)
		</label>
		<input
			id="years"
			type="number"
			bind:value={$simulationParams.timePeriodYears}
			class="w-full px-3 py-2.5 bg-neu-base shadow-neu-inset rounded-lg text-sm
				text-neu-text placeholder-neu-text-light
				focus:outline-none focus:shadow-neu-inset-sm
				transition-all duration-200"
			min="1"
			step="1"
		/>
	</div>

	<!-- Expected Return -->
	<div>
		<label for="return" class="block text-xs font-medium text-neu-text-dark mb-1.5">
			Expected Return (% per year)
		</label>
		<div class="relative">
			<input
				id="return"
				type="number"
				bind:value={$simulationParams.expectedReturn}
				class="w-full pr-8 px-3 py-2.5 bg-neu-base shadow-neu-inset rounded-lg text-sm
					text-neu-text placeholder-neu-text-light
					focus:outline-none focus:shadow-neu-inset-sm
					transition-all duration-200"
				step="0.1"
			/>
			<span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neu-text-light">%</span>
		</div>
	</div>

	<!-- MyInvestor TER -->
	<div>
		<label for="ter" class="block text-xs font-medium text-neu-text-dark mb-1.5">
			MyInvestor TER (%)
		</label>
		<div class="relative">
			<input
				id="ter"
				type="number"
				bind:value={$simulationParams.myInvestorTER}
				class="w-full pr-8 px-3 py-2.5 bg-neu-base shadow-neu-inset rounded-lg text-sm
					text-neu-text placeholder-neu-text-light
					focus:outline-none focus:shadow-neu-inset-sm
					transition-all duration-200"
				min="0.05"
				max="0.59"
				step="0.01"
			/>
			<span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neu-text-light">%</span>
		</div>
	</div>
</form>
