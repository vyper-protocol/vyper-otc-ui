/**
 * Converts a number value into a string with commas for thousands
 * and dots for decimals
 */
export const formatCurrency = (x: number, d: boolean): string | number => {
	if (x === null || isNaN(x)) {
		return 0;
	} else {
		let parts = x.toString().split('.');
		if (d) {
			parts = x.toFixed(2).toString().split('.');
		}
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		return parts.join('.');
	}
};

export const formatWithDecimalDigits = (val: number, precision: number = 4): number => {
	return parseFloat(val.toPrecision(precision));
};
