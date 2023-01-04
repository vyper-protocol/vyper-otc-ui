import { formatWithDecimalDigits } from './numberHelpers';

describe('formatWithDecimalDigits', () => {
	test('positive precision', () => {
		expect(formatWithDecimalDigits(1234.5678)).toBe('1,234.5678');
		expect(formatWithDecimalDigits(12.345678)).toBe('12.3457');
		expect(formatWithDecimalDigits(0.12345678)).toBe('0.1235');
		expect(formatWithDecimalDigits(0.0012345678)).toBe('0.001235');
		expect(formatWithDecimalDigits(1234)).toBe('1,234.0000');
		expect(formatWithDecimalDigits(0)).toBe('0.0000');
		expect(formatWithDecimalDigits(-1234.5678, 2)).toBe('-1,234.57');
		expect(formatWithDecimalDigits(0.165, 2)).toBe('0.17');
		expect(formatWithDecimalDigits(0.00165, 2)).toBe('0.0017');
	});

	test('-1 precision', () => {
		expect(formatWithDecimalDigits(1234.5678, -1)).toBe('1,234.5678');
		expect(formatWithDecimalDigits(1234567.8, -1)).toBe('1,234,567.8');
		expect(formatWithDecimalDigits(0.0012345678, -1)).toBe('0.0012345678');
		expect(formatWithDecimalDigits(1234, -1)).toBe('1,234');
	});
});
