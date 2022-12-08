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

export const formatWithDecimalDigits = (val: number, precision = 4): number => {
	const str = val.toString();
	const [integer, decimal] = str.split('.');

	let parsedDecimal: string | undefined;
	if (decimal !== undefined) {
		let startIndex = 0;
		while (decimal[startIndex] === '0') {
			startIndex += 1;
		}

		const roundedDecimal = parseInt(decimal.slice(startIndex)).toPrecision(precision).toString().replace('.', '').slice(0, precision);
		parsedDecimal = decimal.slice(0, startIndex) + roundedDecimal;
	}

	let strNum = integer;
	if (parsedDecimal !== undefined) {
		strNum = strNum + '.' + parsedDecimal;
	}

	return parseFloat(strNum);
};
