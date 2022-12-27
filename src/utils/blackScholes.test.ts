import { cdfNormal, BSVanilla, BSDigital, newtonSolver, BSVanillaImplied, BSDigitalImplied, BSDigitalStrike } from './blackScholes';

test('cdfNormal bottom', () => {
	expect(cdfNormal(-100)).toBeCloseTo(0, 6);
});

test('cdfNormal neg', () => {
	expect(cdfNormal(-0.5)).toBeCloseTo(0.308538, 6);
});

test('cdfNormal mid', () => {
	expect(cdfNormal(0)).toBeCloseTo(0.5, 6);
});

test('cdfNormal pos', () => {
	expect(cdfNormal(0.5)).toBeCloseTo(0.691462, 6);
});

test('cdfNormal top', () => {
	expect(cdfNormal(100)).toBeCloseTo(1, 6);
});

test('BSVanilla call', () => {
	const spot = 100;
	const k = 110;
	const r = 0.1;
	const sigma = 0.2;
	const t = 1.5;
	const isCall = true;

	const price = BSVanilla(spot, k, r, sigma, t, isCall);

	expect(price).toBeCloseTo(12.383601, 6);
});

test('BSVanilla put', () => {
	const spot = 100;
	const k = 90;
	const r = 0.1;
	const sigma = 0.2;
	const t = 1.5;
	const isCall = false;

	const price = BSVanilla(spot, k, r, sigma, t, isCall);

	expect(price).toBeCloseTo(1.647468, 6);
});

test('BSDigital call', () => {
	const spot = 100;
	const k = 110;
	const r = 0.1;
	const sigma = 0.2;
	const t = 1.5;
	const isCall = true;

	const price = BSDigital(spot, k, r, sigma, t, isCall);

	expect(price).toBeCloseTo(0.464906, 6);
});

test('BSDigital put', () => {
	const spot = 100;
	const k = 90;
	const r = 0.1;
	const sigma = 0.2;
	const t = 1.5;
	const isCall = false;

	const price = BSDigital(spot, k, r, sigma, t, isCall);

	expect(price).toBeCloseTo(0.153876, 6);
});

test('BSDigital certain', () => {
	const spot = 100;
	const k = 100;
	const r = 0.1;
	const sigma = 0.2;
	const t = 1.5;

	const call = BSDigital(spot, k, r, sigma, t, true);
	const put = BSDigital(spot, k, r, sigma, t, false);
	const df = Math.exp(-r * t);

	expect(call + put).toBeCloseTo(df, 6);
});

test('newtonSolver', () => {
	const f = (x: number) => x * x;

	const m = newtonSolver(f, 50);

	expect(m).toBeCloseTo(0, 1);
});

test('newtonSolver BSVanillaImplied', () => {
	const spot = 100;
	const k = 110;
	const r = 0.1;
	// const sigma = 0.2;
	const t = 1.5;
	const isCall = true;
	const price = 12.3836;

	expect(BSVanillaImplied(spot, k, r, t, isCall, price)).toBeCloseTo(0.2, 1);
});

test('newtonSolver BSDigitalImplied', () => {
	const spot = 100;
	const k = 110;
	const r = 0.1;
	// const sigma = 0.2;
	const t = 1.5;
	const isCall = true;
	const price = 0.464906;

	expect(BSDigitalImplied(spot, k, r, t, isCall, price)).toBeCloseTo(0.2, 1);
});

test('newtonSolver BSDigitalStrike', () => {
	const spot = 100;
	// const k = 110;
	const r = 0.1;
	const sigma = 0.2;
	const t = 1.5;
	const isCall = true;
	const price = 0.464906;

	expect(BSDigitalStrike(spot, r, sigma, t, isCall, price)).toBeCloseTo(110, 2);
});
