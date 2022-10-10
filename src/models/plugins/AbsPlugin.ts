import { PublicKey } from '@solana/web3.js';

export abstract class AbsPlugin {
	// eslint-disable-next-line no-empty-function, no-unused-vars
	constructor(public programPubkey: PublicKey, public statePubkey: PublicKey) {}

	abstract getPluginDataObj(): any;
	abstract getTypeId(): string;
}
