export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('es-ES', {
		style: 'currency',
		currency: 'EUR'
	}).format(value);
}

export function formatPercentage(value: number): string {
	return new Intl.NumberFormat('es-ES', {
		style: 'decimal',
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	}).format(value) + '%';
}
