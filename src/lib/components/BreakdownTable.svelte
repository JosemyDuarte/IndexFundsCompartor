<script lang="ts">
	import type { ProviderResult } from '$lib/calculations/simulator';
	import { formatCurrency } from '$lib/utils/formatters';

	export let indexaCapital: ProviderResult;
	export let myInvestor: ProviderResult;

	$: winner = indexaCapital.finalBalance > myInvestor.finalBalance ? 'indexa' : 'myinvestor';
</script>

<div class="overflow-x-auto">
	<table class="w-full border-collapse">
		<thead>
			<tr class="border-b">
				<th class="py-2 px-4 text-left">Metric</th>
				<th class="py-2 px-4 text-right">IndexaCapital</th>
				<th class="py-2 px-4 text-right">MyInvestor</th>
			</tr>
		</thead>
		<tbody>
			<tr class="border-b">
				<td class="py-2 px-4">Total Invested</td>
				<td class="py-2 px-4 text-right">{formatCurrency(indexaCapital.totalInvested)}</td>
				<td class="py-2 px-4 text-right">{formatCurrency(myInvestor.totalInvested)}</td>
			</tr>
			<tr class="border-b">
				<td class="py-2 px-4">Total Fees Paid</td>
				<td class="py-2 px-4 text-right">{formatCurrency(indexaCapital.totalFeesPaid)}</td>
				<td class="py-2 px-4 text-right">{formatCurrency(myInvestor.totalFeesPaid)}</td>
			</tr>
			<tr class="border-b">
				<td class="py-2 px-4">Total Returns</td>
				<td class="py-2 px-4 text-right">{formatCurrency(indexaCapital.totalReturns)}</td>
				<td class="py-2 px-4 text-right">{formatCurrency(myInvestor.totalReturns)}</td>
			</tr>
			<tr class="border-b font-bold">
				<td class="py-2 px-4">Final Balance</td>
				<td class="py-2 px-4 text-right" class:text-green-600={winner === 'indexa'}>
					{formatCurrency(indexaCapital.finalBalance)}
				</td>
				<td class="py-2 px-4 text-right" class:text-green-600={winner === 'myinvestor'}>
					{formatCurrency(myInvestor.finalBalance)}
				</td>
			</tr>
		</tbody>
	</table>
</div>
