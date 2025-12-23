<script lang="ts">
	import { onMount } from 'svelte';
	import type { MonthlySnapshot } from '$lib/calculations/compounding';
	import { Chart, registerables } from 'chart.js';
	import annotationPlugin from 'chartjs-plugin-annotation';
	import { getIndexaCapitalFeeComposition } from '$lib/calculations/fees';

	export let indexaSnapshots: MonthlySnapshot[];
	export let myInvestorSnapshots: MonthlySnapshot[];

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;
	let loading = true;
	let bracketChangeMonths: number[] = [];

	// Find months where IndexaCapital bracket changed
	$: {
		bracketChangeMonths = indexaSnapshots.filter((s) => s.bracketChanged).map((s) => s.month);
	}

	// Calculate X positions (months) where fee brackets change
	function getBreakpointMonths(
		snapshots: MonthlySnapshot[]
	): Array<{ month: number; balance: number; feeRate: number }> {
		const breakpoints: Array<{ month: number; balance: number; feeRate: number }> = [];

		for (let i = 0; i < snapshots.length; i++) {
			if (snapshots[i].bracketChanged) {
				breakpoints.push({
					month: snapshots[i].month,
					balance: snapshots[i].balance,
					feeRate: snapshots[i].feeRate
				});
			}
		}

		return breakpoints;
	}

	// Helper function to create annotation configuration for a breakpoint
	interface BreakpointAnnotation {
		type: string;
		xValue: number;
		yValue: number;
		backgroundColor: string;
		borderColor: string;
		borderWidth: number;
		radius: number;
		drawTime: string;
		enter?: (ctx: any) => void;
		leave?: (ctx: any) => void;
		label?: {
			display: boolean;
			content: string[];
			backgroundColor: string;
			color: string;
			font: {
				size: number;
				weight: string;
			};
			padding: number;
			borderRadius: number;
			position: string;
		};
	}

	function createBreakpointAnnotation(
		month: number,
		balance: number,
		feeRate: number,
		includeHoverHandlers: boolean = false
	): BreakpointAnnotation {
		const balanceFormatted = new Intl.NumberFormat('es-ES', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(balance);

		const years = Math.floor(month / 12);
		const months = month % 12;
		const timeLabel = months === 0 ? `Año ${years}` : `Año ${years}, Mes ${months}`;

		const annotation: BreakpointAnnotation = {
			type: 'point',
			xValue: month - 1, // Chart.js uses 0-based index
			yValue: balance,
			backgroundColor: 'rgba(251, 191, 36, 0.9)', // Yellow with opacity
			borderColor: 'rgba(217, 119, 6, 1)', // Darker yellow border
			borderWidth: 2,
			radius: 6,
			drawTime: 'afterDatasetsDraw',
			label: {
				display: true,
				content: [
					`${timeLabel}`,
					`Cambio de Tramo de Comisión`,
					`Saldo: ${balanceFormatted}`,
					`Nueva Comisión: ${feeRate.toFixed(3)}%`
				],
				backgroundColor: 'rgba(251, 191, 36, 0.95)',
				color: '#78350f',
				font: {
					size: 11,
					weight: '500'
				},
				padding: 6,
				borderRadius: 4,
				position: 'top'
			}
		};

		if (includeHoverHandlers) {
			annotation.enter = (ctx) => {
				ctx.chart.canvas.style.cursor = 'pointer';
			};
			annotation.leave = (ctx) => {
				ctx.chart.canvas.style.cursor = 'default';
			};
		}

		return annotation;
	}

	// Reactive breakpoint calculation
	$: breakpointData = getBreakpointMonths(indexaSnapshots);

	// Update chart when data changes
	$: if (chart && indexaSnapshots && myInvestorSnapshots) {
		chart.data.labels = indexaSnapshots.map((s) => s.month);
		chart.data.datasets[0].data = indexaSnapshots.map((s) => s.balance);
		chart.data.datasets[1].data = myInvestorSnapshots.map((s) => s.balance);

		// Update annotations for breakpoints using helper function
		const annotations: Record<string, any> = {};

		breakpointData.forEach((bp, index) => {
			annotations[`breakpoint-${index}`] = createBreakpointAnnotation(
				bp.month,
				bp.balance,
				bp.feeRate,
				true
			);
		});

		if (chart.options.plugins?.annotation) {
			chart.options.plugins.annotation.annotations = annotations;
		}

		chart.update('none'); // 'none' prevents animation for instant updates
	}

	onMount(() => {
		Chart.register(...registerables, annotationPlugin);

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
								title: function (tooltipItems) {
									if (tooltipItems.length === 0) return '';
									const monthIndex = tooltipItems[0].dataIndex;
									const snapshot = indexaSnapshots[monthIndex];
									const month = snapshot.month;
									const years = Math.floor(month / 12);
									const remainingMonths = month % 12;

									if (remainingMonths === 0) {
										return `Año ${years}`;
									}
									return `Año ${years}, Mes ${remainingMonths}`;
								},
								label: function (context) {
									const label = context.dataset.label || '';
									const value = new Intl.NumberFormat('es-ES', {
										style: 'currency',
										currency: 'EUR'
									}).format(context.parsed.y);

									// Get snapshot for this month
									const snapshots =
										context.datasetIndex === 0 ? indexaSnapshots : myInvestorSnapshots;
									const snapshot = snapshots[context.dataIndex];

									return `${label}: ${value} (Comisión: ${snapshot.feeRate.toFixed(3)}%)`;
								},
								afterLabel: function (context) {
									const snapshots =
										context.datasetIndex === 0 ? indexaSnapshots : myInvestorSnapshots;
									const snapshot = snapshots[context.dataIndex];

									// Get fee composition for this balance
									if (context.datasetIndex === 0) {
										// IndexaCapital
										const composition = getIndexaCapitalFeeComposition(snapshot.balance);
										return [
											`  Gestión: ${composition.managementFee.toFixed(3)}%`,
											`  Custodia: ${composition.custodyFee.toFixed(3)}%`,
											`  TER: ${composition.ter.toFixed(3)}%`
										];
									} else {
										// MyInvestor - get TER from params (we need to pass this)
										// For now, calculate from total fee rate
										const managementFee = 0.3;
										const ter = Math.round((snapshot.feeRate - managementFee) * 100) / 100;
										return [`  Gestión: ${managementFee.toFixed(3)}%`, `  TER: ${ter.toFixed(3)}%`];
									}
								},
								footer: function (tooltipItems) {
									if (tooltipItems.length === 0) return '';

									const month = tooltipItems[0].dataIndex + 1;
									const indexaSnapshot = indexaSnapshots[tooltipItems[0].dataIndex];
									const myInvestorSnapshot = myInvestorSnapshots[tooltipItems[0].dataIndex];

									const diff = Math.abs(indexaSnapshot.balance - myInvestorSnapshot.balance);
									const winner =
										indexaSnapshot.balance > myInvestorSnapshot.balance
											? 'IndexaCapital'
											: 'MyInvestor';
									const formatted = new Intl.NumberFormat('es-ES', {
										style: 'currency',
										currency: 'EUR'
									}).format(diff);

									// Check if this is a bracket change month
									if (indexaSnapshot.bracketChanged) {
										const balanceFormatted = new Intl.NumberFormat('es-ES', {
											style: 'currency',
											currency: 'EUR',
											minimumFractionDigits: 0,
											maximumFractionDigits: 0
										}).format(indexaSnapshot.balance);

										return [
											`${winner} por delante por ${formatted}`,
											'',
											`⚠️ El tramo de comisión ha cambiado`,
											`Nuevo tramo de saldo: ${balanceFormatted}`,
											`Nueva tasa de comisión: ${indexaSnapshot.feeRate.toFixed(3)}%`
										].join('\n');
									}

									return `${winner} por delante por ${formatted}`;
								}
							},
							footerColor: '#718096',
							footerFont: {
								size: 10,
								weight: 'normal'
							}
						},
						annotation: {
							annotations: breakpointData.reduce(
								(acc, bp, index) => {
									acc[`breakpoint-${index}`] = createBreakpointAnnotation(
										bp.month,
										bp.balance,
										bp.feeRate,
										true
									);
									return acc;
								},
								{} as Record<string, any>
							)
						}
					},
					scales: {
						x: {
							title: {
								display: true,
								text: 'Años',
								color: '#718096',
								font: {
									size: 12,
									weight: '500'
								}
							},
							grid: {
								color: function (context) {
									// Highlight bracket change months
									const month = context.index + 1;
									if (bracketChangeMonths.includes(month)) {
										return 'rgba(157, 127, 199, 1.0)'; // Fully opaque purple
									}
									return 'rgba(163, 177, 198, 0.15)';
								},
								lineWidth: function (context) {
									const month = context.index + 1;
									return bracketChangeMonths.includes(month) ? 4 : 1; // Even thicker
								},
								drawBorder: false
							},
							ticks: {
								color: '#718096',
								font: {
									size: 11
								},
								maxTicksLimit: 10,
								callback: function (value, index, ticks) {
									// value is the month number
									const month = value;
									const year = month / 12;

									// Only show labels at year boundaries
									if (month % 12 === 0) {
										return Math.floor(year).toString();
									}
									return '';
								}
							}
						},
						y: {
							title: {
								display: true,
								text: 'Valor de la Cartera',
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
		<div
			class="absolute inset-0 flex items-center justify-center bg-neu-base/50 rounded-xl animate-pulse"
		>
			<div class="text-neu-text-light">Cargando gráfico...</div>
		</div>
	{/if}
	<canvas bind:this={canvas} class:opacity-0={loading}></canvas>
</div>
