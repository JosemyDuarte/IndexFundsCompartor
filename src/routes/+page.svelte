<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { simulationParams } from '$lib/stores/simulationParams';
	import { simulationResults } from '$lib/stores/simulationResults';
	import { paramsToUrl, urlToParams } from '$lib/utils/urlSync';
	import SimulatorForm from '$lib/components/SimulatorForm.svelte';
	import ComparisonChart from '$lib/components/ComparisonChart.svelte';
	import BreakdownTable from '$lib/components/BreakdownTable.svelte';
	import SummaryMetrics from '$lib/components/SummaryMetrics.svelte';

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
	<title>IndexFunds Comparison - MyInvestor vs IndexaCapital</title>
	<meta
		name="description"
		content="Compare investment returns between MyInvestor and IndexaCapital with real-time calculations"
	/>
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<header class="border-b border-white/10 bg-revolut-card/50 backdrop-blur-sm sticky top-0 z-10">
		<div class="container mx-auto px-4 py-6">
			<div class="flex items-center gap-3">
				<div
					class="w-10 h-10 bg-gradient-blue rounded-xl flex items-center justify-center shadow-revolut-glow-blue"
				>
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
						/>
					</svg>
				</div>
				<div>
					<h1 class="text-2xl font-bold text-white">IndexFunds Comparison</h1>
					<p class="text-sm text-gray-400">MyInvestor vs IndexaCapital</p>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-8">
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
			<!-- Sidebar - Form -->
			<aside class="lg:col-span-4">
				<div class="sticky top-24">
					<div class="p-6 bg-revolut-card border border-white/10 rounded-2xl shadow-revolut-card">
						<div class="mb-6">
							<h2 class="text-lg font-semibold text-white mb-1">Simulation Parameters</h2>
							<p class="text-sm text-gray-400">Adjust values to compare returns</p>
						</div>
						<SimulatorForm />
					</div>
				</div>
			</aside>

			<!-- Main Content - Results -->
			<main class="lg:col-span-8">
				<div class="space-y-6">
					<!-- Summary Metrics Card -->
					<div
						class="p-6 bg-revolut-card border border-white/10 rounded-2xl shadow-revolut-card animate-slide-up"
					>
						<SummaryMetrics
							indexaCapital={$simulationResults.indexaCapital}
							myInvestor={$simulationResults.myInvestor}
						/>
					</div>

					<!-- Chart Card -->
					<div
						class="p-6 bg-revolut-card border border-white/10 rounded-2xl shadow-revolut-card animate-slide-up"
						style="animation-delay: 0.1s;"
					>
						<div class="mb-6">
							<h2 class="text-lg font-semibold text-white mb-1">Portfolio Growth Over Time</h2>
							<p class="text-sm text-gray-400">Compare projected returns over investment period</p>
						</div>
						<ComparisonChart
							indexaSnapshots={$simulationResults.indexaCapital.monthlySnapshots}
							myInvestorSnapshots={$simulationResults.myInvestor.monthlySnapshots}
						/>
					</div>

					<!-- Breakdown Card -->
					<div
						class="p-6 bg-revolut-card border border-white/10 rounded-2xl shadow-revolut-card animate-slide-up"
						style="animation-delay: 0.2s;"
					>
						<div class="mb-6">
							<h2 class="text-lg font-semibold text-white mb-1">Financial Breakdown</h2>
							<p class="text-sm text-gray-400">Detailed comparison of costs and returns</p>
						</div>
						<BreakdownTable
							indexaCapital={$simulationResults.indexaCapital}
							myInvestor={$simulationResults.myInvestor}
						/>
					</div>
				</div>
			</main>
		</div>
	</div>

	<!-- Footer -->
	<footer class="mt-16 border-t border-white/10 bg-revolut-card/30 backdrop-blur-sm">
		<div class="container mx-auto px-4 py-8">
			<div class="text-center text-sm text-gray-400">
				<p>Built with SvelteKit, TypeScript, and Tailwind CSS</p>
				<p class="mt-2">Investment calculations are for comparison purposes only</p>
			</div>
		</div>
	</footer>
</div>
