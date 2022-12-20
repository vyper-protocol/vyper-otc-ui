export const cdfNormal = (d: number) => {
	const A1 = 0.31938153;
	const A2 = -0.356563782;
	const A3 = 1.781477937;
	const A4 = -1.821255978;
	const A5 = 1.330274429;
	const RSQRT2PI = 0.39894228040143267793994605993438;
	const K = 1.0 / (1.0 + 0.2316419 * Math.abs(d));

	const res = RSQRT2PI * Math.exp(-0.5 * d * d) * (K * (A1 + K * (A2 + K * (A3 + K * (A4 + K * A5)))));

	return d > 0 ? 1 - res : res;
};

/**
 * Naive Newton solver. Looks for `x: f(x) = 0`. Domain is assumed to be the reals so it will fail for e.g. with `f(x) = x ** 0.5`
 * @param f - The function to find the root of
 * @param guess - Initial guess for the root
 * @param xTol - The solver will stop if `|x1 - x0| < xTol`
 * @param maxRep - The solver will stop if it reaches `maxRep` iterations
 * @returns The approximate solution of `f(x) = 0`
 */

export const newtonSolver = (f: (x: number) => number, guess: number = 0, xTol: number = 0.005, maxRep: number = 100): number => {
	let x0 = guess;
	let i = 0;

	while (i < maxRep) {
		const h = 0.01 * x0;
		const x1 = x0 - (h * f(x0)) / (f(x0 + h) - f(x0));
		if (Math.abs(x1 - x0) < xTol) {
			break;
		}

		x0 = x1;
		i++;
	}
	return x0;
};

export const BSVanilla = (spot: number, k: number, r: number, sigma: number, t: number, isCall: boolean): number => {
	const sqrtT = sigma * Math.sqrt(t);
	const d1 = (Math.log(spot / k) + (r + 0.5 * sigma ** 2) * t) / sqrtT;
	const d2 = d1 - sqrtT;

	const callFlag = isCall ? 1 : -1;
	return callFlag * (spot * cdfNormal(callFlag * d1) - Math.exp(-r * t) * k * cdfNormal(callFlag * d2));
};

export const BSDigital = (spot: number, k: number, r: number, sigma: number, t: number, isCall: boolean): number => {
	const sqrtT = sigma * Math.sqrt(t);
	const d1 = (Math.log(spot / k) + (r + 0.5 * sigma ** 2) * t) / sqrtT;
	const d2 = d1 - sqrtT;

	const callFlag = isCall ? 1 : -1;
	return Math.exp(-r * t) * cdfNormal(callFlag * d2);
};

export const BSVanillaImplied = (spot: number, k: number, r: number, t: number, isCall: boolean, price: number): number => {
	const f = (x: number) => Math.abs(BSVanilla(spot, k, r, x, t, isCall) - price);
	return newtonSolver(f, 0.5);
};

export const BSDigitalImplied = (spot: number, k: number, r: number, t: number, isCall: boolean, price: number): number => {
	const f = (x: number) => Math.abs(BSDigital(spot, k, r, x, t, isCall) - price);
	return newtonSolver(f, 0.5);
};

export const BSDigitalStrike = (spot: number, r: number, sigma: number, t: number, isCall: boolean, price: number): number => {
	const f = (x: number) => Math.abs(BSDigital(spot, x, r, sigma, t, isCall) - price);
	return newtonSolver(f, spot);
};
