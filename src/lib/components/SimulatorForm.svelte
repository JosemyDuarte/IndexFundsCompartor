<script lang="ts">
	import { simulationParams } from '$lib/stores/simulationParams';
</script>

<form class="space-y-4">
	<div>
		<label for="initial" class="block text-sm font-medium">
			Initial Investment (€)
		</label>
		<input
			id="initial"
			type="number"
			bind:value={$simulationParams.initialInvestment}
			class="mt-1 block w-full rounded border px-3 py-2"
			min="0"
			step="100"
		/>
	</div>

	<div>
		<label for="deposit" class="block text-sm font-medium">
			Deposit Amount (€)
		</label>
		<input
			id="deposit"
			type="number"
			bind:value={$simulationParams.depositAmount}
			class="mt-1 block w-full rounded border px-3 py-2"
			min="0"
			step="10"
		/>
	</div>

	<div>
		<label for="frequency" class="block text-sm font-medium">
			Deposit Frequency
		</label>
		<select
			id="frequency"
			bind:value={$simulationParams.depositFrequency}
			class="mt-1 block w-full rounded border px-3 py-2"
		>
			<option value="monthly">Monthly</option>
			<option value="quarterly">Quarterly</option>
			<option value="annual">Annual</option>
		</select>
	</div>

	<div>
		<label for="years" class="block text-sm font-medium">
			Time Period (years)
		</label>
		<input
			id="years"
			type="number"
			bind:value={$simulationParams.timePeriodYears}
			class="mt-1 block w-full rounded border px-3 py-2"
			min="1"
			step="1"
		/>
	</div>

	<div>
		<label for="return" class="block text-sm font-medium">
			Expected Return (% per year)
		</label>
		<input
			id="return"
			type="number"
			bind:value={$simulationParams.expectedReturn}
			class="mt-1 block w-full rounded border px-3 py-2"
			step="0.1"
		/>
	</div>

	<div>
		<label for="ter" class="block text-sm font-medium">
			MyInvestor TER (%)
		</label>
		<input
			id="ter"
			type="number"
			bind:value={$simulationParams.myInvestorTER}
			class="mt-1 block w-full rounded border px-3 py-2"
			min="0.05"
			max="0.59"
			step="0.01"
		/>
	</div>
</form>
