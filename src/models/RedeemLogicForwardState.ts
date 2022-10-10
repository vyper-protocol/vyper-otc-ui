import { IDbPlugin } from './IDbPlugin';

/* eslint-disable space-before-function-paren */
export class RedeemLogicForwardState implements IDbPlugin {
	// eslint-disable-next-line no-unused-vars
	constructor(public strike: number, public isLinear: boolean, public notional: number) {
		//
	}

	getPluginDataObj(): any {
		return {
			strike: this.strike,
			isLinear: this.isLinear,
			notional: this.notional
		};
	}
	getTypeId(): string {
		return 'forward';
	}
}
