<script lang="ts">
	import { onMount } from 'svelte';
	import type { MonthlySnapshot } from '$lib/calculations/compounding';
	import { Chart, registerables } from 'chart.js';

	export let indexaSnapshots: MonthlySnapshot[];
	export let myInvestorSnapshots: MonthlySnapshot[];

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;
	let loading = true;

	// Find months where IndexaCapital bracket changed
	$: bracketChangeMonths = indexaSnapshots
		.filter(s => s.bracketChanged)
		.map(s => s.month);

	onMount(() => {
		Chart.register(...registerables);

		if (canvas) {
			chart = new Chart(canvas, {
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
									const label = context.dataset.label || '';
									const value = new Intl.NumberFormat('es-ES', {
										style: 'currency',
										currency: 'EUR'
									}).format(context.parsed.y);

									// Get snapshot for this month
									const snapshots = context.datasetIndex === 0 ? indexaSnapshots : myInvestorSnapshots;
									const snapshot = snapshots[context.dataIndex];

									return `${label}: ${value} (Fee: ${snapshot.feeRate.toFixed(3)}%)`;
								},
								footer: function (tooltipItems) {
									if (tooltipItems.length === 0) return '';

									const month = tooltipItems[0].dataIndex + 1;
									const indexaSnapshot = indexaSnapshots[tooltipItems[0].dataIndex];
									const myInvestorSnapshot = myInvestorSnapshots[tooltipItems[0].dataIndex];

									const diff = Math.abs(indexaSnapshot.balance - myInvestorSnapshot.balance);
									const winner = indexaSnapshot.balance > myInvestorSnapshot.balance ? 'IndexaCapital' : 'MyInvestor';
									const formatted = new Intl.NumberFormat('es-ES', {
										style: 'currency',
										currency: 'EUR'
									}).format(diff);

									// Check if this is a bracket change month
									if (indexaSnapshot.bracketChanged) {
										return `${winner} ahead by ${formatted}\n⚠️ Fee bracket changed`;
									}

									return `${winner} ahead by ${formatted}`;
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
								color: function(context) {
									// Highlight bracket change months
									const month = context.index + 1;
									if (bracketChangeMonths.includes(month)) {
										return 'rgba(157, 127, 199, 0.4)'; // Purple for bracket changes
									}
									return 'rgba(163, 177, 198, 0.15)';
								},
								lineWidth: function(context) {
									const month = context.index + 1;
									return bracketChangeMonths.includes(month) ? 2 : 1;
								},
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
										minimumFractionDigits: 0,
										maximumFractionDigits: 0
									}).format(value as number);
								}
							}
						}
					}
				}
			});

			loading = false;
		}

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});
</script>

<div class="relative h-[280px] md:h-[320px] lg:h-[360px] w-full">
	{#if loading}
		<div class="absolute inset-0 flex items-center justify-center bg-neu-base/50 rounded-xl animate-pulse">
			<div class="text-neu-text-light">Loading chart...</div>
		</div>
	{/if}
	<canvas bind:this={canvas} class:opacity-0={loading}></canvas>
</div>
