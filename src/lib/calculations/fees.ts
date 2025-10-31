export function getIndexaCapitalFee(balance: number): number {
	if (balance >= 10000) {
		return 0.579;
	}
	return 0.599;
}
