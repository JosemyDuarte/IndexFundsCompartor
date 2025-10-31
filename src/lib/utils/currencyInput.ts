/**
 * Formats a number with Spanish thousand separators (dots)
 * Examples: 1000 -> "1.000", 100000 -> "100.000"
 */
export function formatCurrencyInput(value: number): string {
	const rounded = Math.round(value);
	const parts = rounded.toString().split('-');
	const isNegative = parts.length === 2;
	const numberPart = isNegative ? parts[1] : parts[0];

	// Add thousand separators
	const formatted = numberPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

	return isNegative ? `-${formatted}` : formatted;
}

/**
 * Parses a formatted currency string to number
 * Examples: "1.000" -> 1000, "100.000" -> 100000
 */
export function parseCurrencyInput(value: string): number {
	if (!value || value.trim() === '') return 0;

	// Remove thousand separators (dots) and parse
	const cleaned = value.replace(/\./g, '');
	const parsed = parseInt(cleaned, 10);

	return isNaN(parsed) ? 0 : parsed;
}
