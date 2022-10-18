import { PublicKey } from '@solana/web3.js';

import { AbsPlugin, RedeemLogicPluginTypeIds } from './AbsPlugin';

/* eslint-disable space-before-function-paren */
export class RedeemLogicForwardState extends AbsPlugin {
	// eslint-disable-next-line no-unused-vars
	constructor(programPubkey: PublicKey, statePubkey: PublicKey, public strike: number, public isLinear: boolean, public notional: number) {
		super(programPubkey, statePubkey);
	}

	getPluginDataObj(): any {
		return {
			strike: this.strike,
			isLinear: this.isLinear,
			notional: this.notional
		};
	}
	getTypeId(): RedeemLogicPluginTypeIds {
		return 'forward';
	}

	clone(): RedeemLogicForwardState {
		return new RedeemLogicForwardState(this.programPubkey, this.statePubkey, this.strike, this.isLinear, this.notional);
	}
}
