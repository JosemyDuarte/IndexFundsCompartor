<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { MonthlySnapshot } from '$lib/calculations/compounding';

	export let indexaSnapshots: MonthlySnapshot[];
	export let myInvestorSnapshots: MonthlySnapshot[];

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;
	let loading = true;

	onMount(() => {
		Chart.register(...registerables);
		createChart();
		loading = false;

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
						borderColor: '#9d7fc7',
						backgroundColor: 'rgba(157, 127, 199, 0.2)',
						borderWidth: 3,
						tension: 0.4,
						fill: true,
						pointRadius: 0,
						pointHoverRadius: 6,
						pointHoverBackgroundColor: '#9d7fc7',
						pointHoverBorderColor: '#fff',
						pointHoverBorderWidth: 2
					},
					{
						label: 'MyInvestor',
						data: myInvestorSnapshots.map((s) => s.balance),
						borderColor: '#6b9bd1',
						backgroundColor: 'rgba(107, 155, 209, 0.2)',
						borderWidth: 3,
						tension: 0.4,
						fill: true,
						pointRadius: 0,
						pointHoverRadius: 6,
						pointHoverBackgroundColor: '#6b9bd1',
						pointHoverBorderColor: '#fff',
						pointHoverBorderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false
				},
				plugins: {
					legend: {
						position: 'top',
						labels: {
							color: '#4a5568',
							font: {
								size: 12,
								weight: '500'
							},
							padding: 12,
							usePointStyle: true,
							pointStyle: 'circle'
						}
					},
					tooltip: {
						backgroundColor: 'rgba(224, 229, 236, 0.98)',
						titleColor: '#2d3748',
						bodyColor: '#4a5568',
						borderColor: '#a3b1c6',
						borderWidth: 1,
						padding: 10,
						displayColors: true,
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
							},
							footer: function(tooltipItems) {
								if (tooltipItems.length > 0) {
									const indexa = tooltipItems.find(item => item.datasetIndex === 0);
									const myInvestor = tooltipItems.find(item => item.datasetIndex === 1);
									if (indexa && myInvestor) {
										const diff = Math.abs(indexa.parsed.y - myInvestor.parsed.y);
										const winner = indexa.parsed.y > myInvestor.parsed.y ? 'IndexaCapital' : 'MyInvestor';
										return `Difference: €${diff.toFixed(2)} (${winner} ahead)`;
									}
								}
								return '';
							}
						},
						footerColor: '#718096',
						footerFont: {
							size: 10,
							weight: 'normal'
						}
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: 'Month',
							color: '#718096',
							font: {
								size: 12,
								weight: '500'
							}
						},
						grid: {
							color: 'rgba(163, 177, 198, 0.15)',
							drawBorder: false
						},
						ticks: {
							color: '#718096',
							font: {
								size: 11
							},
							maxTicksLimit: 10
						}
					},
					y: {
						title: {
							display: true,
							text: 'Portfolio Value',
							color: '#718096',
							font: {
								size: 12,
								weight: '500'
							}
						},
						grid: {
							color: 'rgba(163, 177, 198, 0.2)',
							drawBorder: false
						},
						ticks: {
							color: '#718096',
							font: {
								size: 11
							},
							callback: function (value) {
								return new Intl.NumberFormat('es-ES', {
									style: 'currency',
									currency: 'EUR',
									notation: 'compact',
									maximumFractionDigits: 0
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
		chart.update('none'); // Update without animation for smooth reactivity
	}
</script>

<div class="relative h-[280px] md:h-[320px] lg:h-[360px] w-full">
	{#if loading}
		<div class="absolute inset-0 flex items-center justify-center bg-neu-base/50 rounded-xl animate-pulse">
			<div class="text-neu-text-light">Loading chart...</div>
		</div>
	{/if}
	<canvas bind:this={canvas} class:opacity-0={loading}></canvas>
</div>
