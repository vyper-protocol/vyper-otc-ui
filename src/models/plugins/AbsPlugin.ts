import { PublicKey } from '@solana/web3.js';

export type RatePluginTypeIds = 'switchboard' | 'pyth';
export type RedeemLogicPluginTypeIds = 'forward';

export abstract class AbsPlugin {
	// eslint-disable-next-line no-empty-function, no-unused-vars
	constructor(public programPubkey: PublicKey, public statePubkey: PublicKey) {}

	abstract getPluginDataObj(): any;
	abstract getTypeId(): RatePluginTypeIds | RedeemLogicPluginTypeIds;
}
