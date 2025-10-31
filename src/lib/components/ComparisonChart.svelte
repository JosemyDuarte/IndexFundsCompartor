<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { MonthlySnapshot } from '$lib/calculations/compounding';

	export let indexaSnapshots: MonthlySnapshot[];
	export let myInvestorSnapshots: MonthlySnapshot[];

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		Chart.register(...registerables);
		createChart();

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});

	$: if (chart && indexaSnapshots && myInvestorSnapshots) {
		updateChart();
	}

	function createChart() {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: indexaSnapshots.map((s) => s.month),
				datasets: [
					{
						label: 'IndexaCapital',
						data: indexaSnapshots.map((s) => s.balance),
						borderColor: 'rgb(59, 130, 246)',
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						tension: 0.4
					},
					{
						label: 'MyInvestor',
						data: myInvestorSnapshots.map((s) => s.balance),
						borderColor: 'rgb(239, 68, 68)',
						backgroundColor: 'rgba(239, 68, 68, 0.1)',
						tension: 0.4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'top'
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						callbacks: {
							label: function (context) {
								let label = context.dataset.label || '';
								if (label) {
									label += ': ';
								}
								if (context.parsed.y !== null) {
									label += new Intl.NumberFormat('es-ES', {
										style: 'currency',
										currency: 'EUR'
									}).format(context.parsed.y);
								}
								return label;
							}
						}
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: 'Month'
						}
					},
					y: {
						title: {
							display: true,
							text: 'Portfolio Value (€)'
						},
						ticks: {
							callback: function (value) {
								return new Intl.NumberFormat('es-ES', {
									style: 'currency',
									currency: 'EUR',
									notation: 'compact'
								}).format(value as number);
							}
						}
					}
				}
			}
		});
	}

	function updateChart() {
		if (!chart) return;

		chart.data.labels = indexaSnapshots.map((s) => s.month);
		chart.data.datasets[0].data = indexaSnapshots.map((s) => s.balance);
		chart.data.datasets[1].data = myInvestorSnapshots.map((s) => s.balance);
		chart.update();
	}
</script>

<div class="relative h-96 w-full">
	<canvas bind:this={canvas}></canvas>
</div>
