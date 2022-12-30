import BigNumber from 'bignumber.js';

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
	const bigVal = new BigNumber(val);
	const str = bigVal.toString();
	const [integerString, decimalString] = str.split('.');

	const parsedIntegerString = new Intl.NumberFormat('en-US').format(parseInt(integerString));

	if (precision === -1) {
		if (decimalString) return `${parsedIntegerString}.${decimalString}`;
		return parsedIntegerString;
	}

	if (bigVal.isEqualTo(0)) {
		return bigVal.toPrecision(precision + 1);
	}

	if (bigVal.isLessThan(1) && bigVal.isGreaterThan(-1)) {
		return bigVal.toPrecision(precision);
	}

	const decimal = bigVal.minus(new BigNumber(integerString));
	const parsedDecimalString = decimal.toFixed(precision).split('.')[1];

	return `${parsedIntegerString}.${parsedDecimalString}`;
};
