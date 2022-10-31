import { PublicKey } from '@solana/web3.js';

export const AVAILABLE_RATE_PLUGINS = ['switchboard', 'pyth'] as const;
export const AVAILABLE_REDEEM_LOGIC_PLUGINS = ['forward', 'settled_forward', 'digital'] as const;
export type RatePluginTypeIds = typeof AVAILABLE_RATE_PLUGINS[number];
export type RedeemLogicPluginTypeIds = typeof AVAILABLE_REDEEM_LOGIC_PLUGINS[number];

export abstract class AbsPlugin {
	// eslint-disable-next-line no-empty-function, no-unused-vars
	constructor(public programPubkey: PublicKey, public statePubkey: PublicKey) {}

	abstract getPluginDataObj(): any;
	abstract get typeId(): RatePluginTypeIds | RedeemLogicPluginTypeIds;
}
