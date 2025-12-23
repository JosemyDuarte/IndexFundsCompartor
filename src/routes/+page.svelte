<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { derived } from 'svelte/store';
	import { browser } from '$app/environment';
	import { createSimulationParamsStore } from '$lib/stores/simulationParams';
	import { calculateProviderComparison } from '$lib/calculations/simulator';
	import { paramsToUrl } from '$lib/utils/urlSync';
	import SimulatorForm from '$lib/components/SimulatorForm.svelte';
	import ComparisonChart from '$lib/components/ComparisonChart.svelte';
	import BreakdownTable from '$lib/components/BreakdownTable.svelte';
	import SummaryMetrics from '$lib/components/SummaryMetrics.svelte';
	import ReferralCard from '$lib/components/ReferralCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// Initialize store with URL params from load function
	const simulationParams = createSimulationParamsStore(data.urlParams);

	// Provide store to child components via context
	setContext('simulationParams', simulationParams);

	// Create derived store for simulation results using the page-level store
	const simulationResults = derived(simulationParams, ($params) => {
		return calculateProviderComparison($params);
	});

	// Flag to prevent URL sync until after initial load
	let isInitialLoad = true;

	onMount(() => {
		// Allow URL syncing after component mounts
		isInitialLoad = false;
	});

	// Sync params to URL on change (but not during initial load)
	$: if (browser && !isInitialLoad && $simulationParams) {
		const url = paramsToUrl($simulationParams);
		const newUrl = `${window.location.pathname}?${url}`;
		window.history.replaceState({}, '', newUrl);
	}
</script>

<svelte:head>
	<title>Comparador de Fondos Indexados - MyInvestor vs IndexaCapital</title>
	<meta
		name="description"
		content="Compara la rentabilidad de las inversiones entre MyInvestor e IndexaCapital con cálculos en tiempo real"
	/>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="bg-neu-base sticky top-0 z-10 shadow-neu-raised-sm">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center gap-3">
				<div
					class="w-8 h-8 bg-gradient-blue rounded-lg flex items-center justify-center shadow-neu-raised-sm"
				>
					<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
						/>
					</svg>
				</div>
				<div>
					<h1 class="text-xl font-bold text-neu-text-dark">Comparador de Fondos Indexados</h1>
					<p class="text-xs text-neu-text-light">MyInvestor vs IndexaCapital</p>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-6 max-w-7xl">
		<div class="grid grid-cols-1 gap-5 lg:grid-cols-12">
			<!-- Sidebar - Form -->
			<aside class="lg:col-span-4">
				<div class="sticky top-20">
					<div class="p-5 bg-neu-base rounded-2xl shadow-neu-raised">
						<div class="mb-5">
							<h2 class="text-base font-semibold text-neu-text-dark mb-1">
								Parámetros de Simulación
							</h2>
							<p class="text-xs text-neu-text-light">
								Ajusta los valores para comparar rentabilidades
							</p>
						</div>
						<SimulatorForm />
					</div>
					<ReferralCard />
				</div>
			</aside>

			<!-- Main Content - Results -->
			<main class="lg:col-span-8">
				<div class="space-y-5">
					<!-- Summary Metrics Card -->
					<div class="p-5 bg-neu-base rounded-2xl shadow-neu-raised animate-slide-up">
						<SummaryMetrics
							indexaCapital={$simulationResults.indexaCapital}
							myInvestor={$simulationResults.myInvestor}
						/>
					</div>

					<!-- Chart Card -->
					<div
						class="p-5 bg-neu-base rounded-2xl shadow-neu-raised animate-slide-up"
						style="animation-delay: 0.1s;"
					>
						<div class="mb-4">
							<h2 class="text-base font-semibold text-neu-text-dark mb-1">
								Crecimiento de la Cartera
							</h2>
							<p class="text-xs text-neu-text-light">
								Compara la rentabilidad proyectada durante el periodo de inversión
							</p>
						</div>
						<ComparisonChart
							indexaSnapshots={$simulationResults.indexaCapital.monthlySnapshots}
							myInvestorSnapshots={$simulationResults.myInvestor.monthlySnapshots}
						/>
						<div class="mt-3 flex items-start gap-2 text-xs text-neu-text-light">
							<svg
								class="w-4 h-4 mt-0.5 text-neu-purple flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<p>
								Los <strong class="text-yellow-600">marcadores amarillos</strong> muestran la posición
								exacta del cambio de tramo de comisión de IndexaCapital. Pasa el cursor sobre el gráfico
								o los marcadores para ver información detallada de las comisiones.
							</p>
						</div>
					</div>

					<!-- Breakdown Card -->
					<div
						class="p-5 bg-neu-base rounded-2xl shadow-neu-raised animate-slide-up"
						style="animation-delay: 0.2s;"
					>
						<div class="mb-4">
							<h2 class="text-base font-semibold text-neu-text-dark mb-1">Desglose Financiero</h2>
							<p class="text-xs text-neu-text-light">
								Comparación detallada de costes y rentabilidades
							</p>
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
	<footer class="mt-auto bg-neu-base shadow-neu-raised-sm border-t border-neu-dark/10">
		<div class="container mx-auto px-4 py-6">
			<div class="text-center text-xs text-neu-text-light">
				<p>Creado con SvelteKit, TypeScript y Tailwind CSS</p>
				<p class="mt-1">Los cálculos de inversión son solo para fines comparativos</p>
			</div>
		</div>
	</footer>
</div>
