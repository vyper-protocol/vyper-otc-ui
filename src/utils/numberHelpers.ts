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

export const formatWithDecimalDigits = (val: number, precision = 4): string => {
	const str = val.toString();
	const [integerString, decimalString] = str.split('.');

	const parsedIntegerString = new Intl.NumberFormat('en-US').format(parseInt(integerString));

	if ( precision === -1 ) {
		if ( decimalString ) return `${parsedIntegerString}.${decimalString}`;
		return parsedIntegerString;
	}

	if ( val < 1 && val > -1 ) {
		return val.toPrecision(precision);
	}
	
	const decimal = val - parseInt(integerString);
	const parsedDecimalString = decimal.toFixed(precision).slice(2);
	
	return `${parsedIntegerString}.${parsedDecimalString}`;
};
