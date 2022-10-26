import { PublicKey } from '@solana/web3.js';

export const AVAILABLE_RATE_PLUGINS = ['switchboard', 'pyth'];
export const AVAILABLE_REDEEM_LOGIC_PLUGINS = ['forward'];
export type RatePluginTypeIds = 'switchboard' | 'pyth';
export type RedeemLogicPluginTypeIds = 'forward' | 'settled_forward';

export abstract class AbsPlugin {
	// eslint-disable-next-line no-empty-function, no-unused-vars
	constructor(public programPubkey: PublicKey, public statePubkey: PublicKey) {}

	abstract getPluginDataObj(): any;
	abstract get typeId(): RatePluginTypeIds | RedeemLogicPluginTypeIds;
}
