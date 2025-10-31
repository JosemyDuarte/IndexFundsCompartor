<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { simulationParams } from '$lib/stores/simulationParams';
	import { simulationResults } from '$lib/stores/simulationResults';
	import { paramsToUrl, urlToParams } from '$lib/utils/urlSync';
	import SimulatorForm from '$lib/components/SimulatorForm.svelte';
	import ComparisonChart from '$lib/components/ComparisonChart.svelte';
	import BreakdownTable from '$lib/components/BreakdownTable.svelte';

	// Load params from URL on mount
	onMount(() => {
		if (browser) {
			const urlParams = urlToParams(window.location.search.substring(1));
			if (Object.keys(urlParams).length > 0) {
				simulationParams.update((current) => ({ ...current, ...urlParams }));
			}
		}
	});

	// Sync params to URL on change
	$: if (browser && $simulationParams) {
		const url = paramsToUrl($simulationParams);
		const newUrl = `${window.location.pathname}?${url}`;
		window.history.replaceState({}, '', newUrl);
	}
</script>

<svelte:head>
	<title>IndexFunds Comparison Simulator</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">IndexFunds Comparison Simulator</h1>
		<p class="mt-2 text-gray-600">
			Compare investment returns between MyInvestor and IndexaCapital
		</p>
	</header>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Form Section -->
		<div class="lg:col-span-1">
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="mb-4 text-xl font-semibold">Simulation Parameters</h2>
				<SimulatorForm />
			</div>
		</div>

		<!-- Results Section -->
		<div class="lg:col-span-2">
			<div class="space-y-6">
				<!-- Chart -->
				<div class="rounded-lg bg-white p-6 shadow">
					<h2 class="mb-4 text-xl font-semibold">Portfolio Growth Over Time</h2>
					<ComparisonChart
						indexaSnapshots={$simulationResults.indexaCapital.monthlySnapshots}
						myInvestorSnapshots={$simulationResults.myInvestor.monthlySnapshots}
					/>
				</div>

				<!-- Breakdown -->
				<div class="rounded-lg bg-white p-6 shadow">
					<h2 class="mb-4 text-xl font-semibold">Financial Breakdown</h2>
					<BreakdownTable
						indexaCapital={$simulationResults.indexaCapital}
						myInvestor={$simulationResults.myInvestor}
					/>
				</div>
			</div>
		</div>
	</div>
</div>
