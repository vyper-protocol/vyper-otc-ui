import { PublicKey } from '@solana/web3.js';

export default class RateSwitchboardState {
	constructor(public switchboarAggregator: PublicKey) {}
}
