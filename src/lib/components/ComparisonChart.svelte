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
						borderColor: '#8B3DFF',
						backgroundColor: 'rgba(139, 61, 255, 0.15)',
						borderWidth: 4,
						tension: 0.4,
						fill: true,
						pointRadius: 0,
						pointHoverRadius: 8,
						pointHoverBackgroundColor: '#8B3DFF',
						pointHoverBorderColor: '#fff',
						pointHoverBorderWidth: 3
					},
					{
						label: 'MyInvestor',
						data: myInvestorSnapshots.map((s) => s.balance),
						borderColor: '#0075FF',
						backgroundColor: 'rgba(0, 117, 255, 0.15)',
						borderWidth: 4,
						tension: 0.4,
						fill: true,
						pointRadius: 0,
						pointHoverRadius: 8,
						pointHoverBackgroundColor: '#0075FF',
						pointHoverBorderColor: '#fff',
						pointHoverBorderWidth: 3
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
							color: '#E5E7EB',
							font: {
								size: 13,
								weight: '500'
							},
							padding: 15,
							usePointStyle: true,
							pointStyle: 'circle'
						}
					},
					tooltip: {
						backgroundColor: 'rgba(26, 29, 41, 0.95)',
						titleColor: '#E5E7EB',
						bodyColor: '#E5E7EB',
						borderColor: 'rgba(255, 255, 255, 0.1)',
						borderWidth: 1,
						padding: 12,
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
							}
						}
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: 'Month',
							color: '#9CA3AF',
							font: {
								size: 12,
								weight: '500'
							}
						},
						grid: {
							color: 'rgba(255, 255, 255, 0.05)',
							drawBorder: false
						},
						ticks: {
							color: '#9CA3AF',
							font: {
								size: 11
							}
						}
					},
					y: {
						title: {
							display: true,
							text: 'Portfolio Value',
							color: '#9CA3AF',
							font: {
								size: 12,
								weight: '500'
							}
						},
						grid: {
							color: 'rgba(255, 255, 255, 0.05)',
							drawBorder: false
						},
						ticks: {
							color: '#9CA3AF',
							font: {
								size: 11
							},
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
		chart.update('none'); // Update without animation for smooth reactivity
	}
</script>

<div class="relative h-[500px] md:h-[600px] lg:h-[700px] w-full">
	<canvas bind:this={canvas}></canvas>
</div>
